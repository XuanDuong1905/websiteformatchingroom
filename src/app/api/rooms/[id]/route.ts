import { RoomStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { requireApprovedLandlord } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { calculateRoomRiskScore } from "@/lib/riskScore";
import { serializeRoom } from "@/lib/rooms/serializer";
import { roomUpdateSchema } from "@/lib/validations/room";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number, errors?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

function parseRoomId(rawId: string) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

function includeRoomRelations() {
  return {
    images: {
      orderBy: {
        sortOrder: "asc" as const,
      },
    },
    landlord: {
      select: {
        id: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        reputationScore: true,
      },
    },
  };
}

// ---------- GET /api/rooms/[id] ----------

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseRoomId(rawId);

    if (!id) {
      return errorResponse("ID phòng không hợp lệ", 400);
    }

    const room = await prisma.room.findFirst({
      where: {
        id,
        status: {
          not: RoomStatus.DELETED,
        },
      },
      include: {
        ...includeRoomRelations(),
        amenities: {
          include: {
            amenity: true,
          },
        },
        rules: true,
      },
    });

    if (!room) {
      return errorResponse("Không tìm thấy phòng", 404);
    }

    // Serialize the base fields then attach amenities / rules as-is.
    const serialized = serializeRoom(room);

    return NextResponse.json({
      success: true,
      data: {
        ...serialized,
        amenities: room.amenities,
        rules: room.rules,
      },
    });
  } catch (error) {
    console.error("GET /api/rooms/[id] failed:", error);
    return errorResponse("Lỗi máy chủ", 500);
  }
}

// ---------- PATCH /api/rooms/[id] ----------

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApprovedLandlord(request);
  if (auth.response) return auth.response;

  try {
    const { id: rawId } = await context.params;
    const id = parseRoomId(rawId);

    if (!id) {
      return errorResponse("ID phòng không hợp lệ", 400);
    }

    const existingRoom = await prisma.room.findFirst({
      where: {
        id,
        landlordId: auth.user.id,
        status: {
          not: RoomStatus.DELETED,
        },
      },
      include: {
        landlord: {
          select: { reputationScore: true },
        },
        _count: {
          select: { images: true },
        },
      },
    });

    if (!existingRoom) {
      return errorResponse("Không tìm thấy phòng", 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = roomUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu cập nhật không hợp lệ",
        400,
        parsed.error.flatten(),
      );
    }

    const input = parsed.data;

    // Recalculate risk score using merged data.
    const riskScore = calculateRoomRiskScore({
      price: input.price ?? existingRoom.price,
      deposit: existingRoom.deposit,
      description: input.description ?? existingRoom.description,
      address: input.address ?? existingRoom.address,
      imageCount: existingRoom._count.images,
      ownerReputation: existingRoom.landlord.reputationScore,
    });

    // Build update data only from provided fields.
    const data: Record<string, unknown> = { riskScore };
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.address !== undefined) data.address = input.address;
    if (input.ward !== undefined) data.ward = input.ward;
    if (input.district !== undefined) data.district = input.district;
    if (input.city !== undefined) data.city = input.city;
    if (input.price !== undefined) data.price = input.price;
    if (input.electricPrice !== undefined) data.electricPrice = input.electricPrice;
    if (input.waterPrice !== undefined) data.waterPrice = input.waterPrice;
    if (input.serviceFee !== undefined) data.serviceFee = input.serviceFee;
    if (input.area !== undefined) data.area = input.area;
    if (input.maxOccupants !== undefined) data.maxOccupants = input.maxOccupants;
    if (input.currentOccupants !== undefined) data.currentOccupants = input.currentOccupants;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.status !== undefined) data.status = input.status;

    // Recalculate available slots when occupancy fields change.
    const maxOcc = (data.maxOccupants as number | undefined) ?? existingRoom.maxOccupants;
    const curOcc = (data.currentOccupants as number | undefined) ?? existingRoom.currentOccupants;
    data.availableSlots = Math.max(maxOcc - curOcc, 0);

    const updatedRoom = await prisma.room.update({
      where: { id },
      data,
      include: includeRoomRelations(),
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: serializeRoom(updatedRoom),
    });
  } catch (error) {
    console.error("PATCH /api/rooms/[id] failed:", error);
    return errorResponse("Lỗi máy chủ", 500);
  }
}

// ---------- DELETE /api/rooms/[id] ----------

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireApprovedLandlord(request);
  if (auth.response) return auth.response;

  try {
    const { id: rawId } = await context.params;
    const id = parseRoomId(rawId);

    if (!id) {
      return errorResponse("ID phòng không hợp lệ", 400);
    }

    const existingRoom = await prisma.room.findFirst({
      where: {
        id,
        landlordId: auth.user.id,
        status: {
          not: RoomStatus.DELETED,
        },
      },
    });

    if (!existingRoom) {
      return errorResponse("Không tìm thấy phòng", 404);
    }

    await prisma.room.update({
      where: { id },
      data: {
        status: RoomStatus.DELETED,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa phòng thành công",
    });
  } catch (error) {
    console.error("DELETE /api/rooms/[id] failed:", error);
    return errorResponse("Lỗi máy chủ", 500);
  }
}
