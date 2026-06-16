import { NextRequest, NextResponse } from "next/server";

import { requireApprovedLandlord } from "@/lib/auth/server";
import { uploadImageBuffer } from "@/lib/cloudinary";
import {
  ROOM_IMAGE_EXTENSIONS,
  ROOM_IMAGE_LIMITS,
  ROOM_IMAGE_MIME_TYPES,
} from "@/lib/validations/room";

export const runtime = "nodejs";

const ROOM_UPLOAD_FOLDER = process.env.CLOUDINARY_ROOM_FOLDER || "ghep-tro/rooms";
const ALLOWED_MIME_TYPES = new Set<string>(ROOM_IMAGE_MIME_TYPES);
const ALLOWED_EXTENSIONS = new Set<string>(ROOM_IMAGE_EXTENSIONS);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function getFiles(formData: FormData) {
  const entries = [
    ...formData.getAll("files"),
    ...formData.getAll("images"),
    ...formData.getAll("file"),
  ];

  return entries.filter((entry): entry is File => entry instanceof File);
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function hasValidImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return buffer.length >= signature.length && signature.every((byte, index) => buffer[index] === byte);
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

function validateFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP";
  }

  if (!ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
    return "Định dạng file phải là jpg, jpeg, png hoặc webp";
  }

  if (file.size <= 0) {
    return "File ảnh không hợp lệ";
  }

  if (file.size > ROOM_IMAGE_LIMITS.maxSize) {
    return "Mỗi ảnh không được vượt quá 5MB";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const auth = await requireApprovedLandlord(request);
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const files = getFiles(formData);

    if (files.length < ROOM_IMAGE_LIMITS.min) {
      return errorResponse(`Cần upload ít nhất ${ROOM_IMAGE_LIMITS.min} ảnh`, 400);
    }

    if (files.length > ROOM_IMAGE_LIMITS.max) {
      return errorResponse(`Chỉ được upload tối đa ${ROOM_IMAGE_LIMITS.max} ảnh`, 400);
    }

    for (const file of files) {
      const fileError = validateFile(file);
      if (fileError) return errorResponse(fileError, 400);
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());

        if (!hasValidImageSignature(buffer, file.type)) {
          throw new Error("INVALID_IMAGE_SIGNATURE");
        }

        const uploadResult = await uploadImageBuffer(buffer, {
          folder: ROOM_UPLOAD_FOLDER,
          resource_type: "image",
          allowed_formats: [...ROOM_IMAGE_EXTENSIONS],
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        });

        return uploadResult.secure_url as string;
      }),
    );

    return NextResponse.json(
      {
        urls,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_IMAGE_SIGNATURE") {
      return errorResponse("Nội dung file không đúng định dạng ảnh", 400);
    }

    console.error("POST /api/upload/room-images failed:", error);
    return errorResponse("Không thể upload ảnh phòng", 500);
  }
}
