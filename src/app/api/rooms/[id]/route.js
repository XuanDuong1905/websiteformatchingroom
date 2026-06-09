import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseRoomId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseRoomId(resolvedParams.id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID phòng không hợp lệ",
        },
        { status: 400 }
      );
    }

    const room = await prisma.room.findFirst({
      where: {
        id,
        status: {
          not: "deleted",
        },
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        rules: true,
        owner: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            reputationScore: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy phòng",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi máy chủ",
      },
      { status: 500 }
    );
  }
}