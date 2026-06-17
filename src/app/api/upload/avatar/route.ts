import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_UPLOAD_FOLDER = process.env.CLOUDINARY_AVATAR_FOLDER || "ghep-tro/avatars";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function getUploadFile(formData: FormData) {
  const file = formData.get("file") ?? formData.get("avatar") ?? formData.get("image");

  if (!file || typeof file === "string") {
    return null;
  }

  return file;
}

function getExtension(filename: string) {
  const extension = filename.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

function hasValidImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    return (
      buffer.length >= pngSignature.length &&
      pngSignature.every((byte, index) => buffer[index] === byte)
    );
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = getUploadFile(formData);

    if (!file) {
      return errorResponse("Chưa chọn ảnh đại diện", 400);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return errorResponse("Chỉ chấp nhận ảnh JPG, JPEG hoặc PNG", 400);
    }

    const extension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return errorResponse("Định dạng file phải là jpg, jpeg hoặc png", 400);
    }

    if (file.size <= 0) {
      return errorResponse("File ảnh không hợp lệ", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("Ảnh đại diện không được vượt quá 5MB", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasValidImageSignature(buffer, file.type)) {
      return errorResponse("Nội dung file không đúng định dạng ảnh", 400);
    }

    const uploadResult = await uploadImageBuffer(buffer, {
      folder: AVATAR_UPLOAD_FOLDER,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"],
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/upload/avatar failed:", error);
    return errorResponse("Không thể upload ảnh đại diện", 500);
  }
}
