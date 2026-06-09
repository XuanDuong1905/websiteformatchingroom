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

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseRoomId(resolvedParams.id);

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "ID phòng không hợp lệ",
        },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.room.findFirst({
      where: {
        id,
        status: {
          not: "deleted",
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy phòng",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.address !== undefined) data.address = body.address;
    if (body.district !== undefined) data.district = body.district;
    if (body.ward !== undefined) data.ward = body.ward;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.deposit !== undefined) data.deposit = Number(body.deposit);
    if (body.area !== undefined) data.area = Number(body.area);
    if (body.electricityFee !== undefined) data.electricityFee = Number(body.electricityFee);
    if (body.waterFee !== undefined) data.waterFee = Number(body.waterFee);
    if (body.wifiFee !== undefined) data.wifiFee = Number(body.wifiFee);
    if (body.parkingFee !== undefined) data.parkingFee = Number(body.parkingFee);
    if (body.otherFee !== undefined) data.otherFee = Number(body.otherFee);
    if (body.maxPeople !== undefined) data.maxPeople = Number(body.maxPeople);
    if (body.currentPeople !== undefined) data.currentPeople = Number(body.currentPeople);
    if (body.availableSlots !== undefined) data.availableSlots = Number(body.availableSlots);
    if (body.hasContract !== undefined) data.hasContract = Boolean(body.hasContract);
    if (body.minStayMonths !== undefined) data.minStayMonths = Number(body.minStayMonths);
    if (body.availableFrom !== undefined) {
      data.availableFrom = body.availableFrom ? new Date(body.availableFrom) : null;
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: updatedRoom,
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

export async function DELETE(request, { params }) {
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

    const existingRoom = await prisma.room.findFirst({
      where: {
        id,
        status: {
          not: "deleted",
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy phòng",
        },
        { status: 404 }
      );
    }

    await prisma.room.update({
      where: {
        id,
      },
      data: {
        status: "deleted",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa phòng thành công",
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