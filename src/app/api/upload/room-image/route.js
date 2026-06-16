import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { calculateRoomRiskScore } from "@/lib/riskScore";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const UPLOAD_FOLDER = "roommate-finder/rooms";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const roomId = formData.get("roomId");
    const isCover = formData.get("isCover") === "true";

    if (!file || typeof file === "string") {
      return NextResponse.json({ 
            success: false,
            message: "Chưa chọn file ảnh" 
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ảnh không được vượt quá 5MB" },
        { status: 400 }
      );
    }

    const parsedRoomId = Number(roomId);

    if (!Number.isInteger(parsedRoomId) || parsedRoomId < 1) {
      return NextResponse.json(
        { success: false, message: "ID phòng không hợp lệ" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findFirst({
      where: {
        id: parsedRoomId,
        status: { not: "deleted" },
      },
      include: {
        owner: {
          select: { reputationScore: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phòng" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: UPLOAD_FOLDER,
          resource_type: "image",
          format: "webp",
          transformation: [
            { width: 1200, height: 900, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(buffer);
    });

    const imageCount = await prisma.roomImage.count({
      where: { roomId: parsedRoomId },
    });

    const shouldBeCover = imageCount === 0 ? true : isCover;

    if (shouldBeCover) {
      await prisma.roomImage.updateMany({
        where: { roomId: parsedRoomId, isCover: true },
        data: { isCover: false },
      });
    }
    // update riskScore base on imageCount
    const updatedRiskScore = calculateRoomRiskScore({
      price: room.price,
      deposit: room.deposit,
      description: room.description,
      address: room.address,
      imageCount: imageCount + 1,
      ownerReputation: room.owner.reputationScore
    });

    await prisma.room.update({
      where: { id: parsedRoomId },
      data: { riskScore: updatedRiskScore }
    });

    const image = await prisma.roomImage.create({
      data: {
        roomId: parsedRoomId,
        imageUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        isCover: shouldBeCover,
        sortOrder: imageCount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Upload ảnh thành công",
        data: image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload room image error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi khi upload ảnh",
      },
      { status: 500 }
    );
  }
}