import { Prisma, RoomStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser, requireApprovedLandlord } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { calculateRoomRiskScore } from "@/lib/riskScore";
import { serializeRoom, type RoomWithPublicRelations } from "@/lib/rooms/serializer";
import { roomCreateSchema, roomListQuerySchema } from "@/lib/validations/room";

export const runtime = "nodejs";

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

function getSearchParamsObject(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}

function buildRoomWhere(query: ReturnType<typeof roomListQuerySchema.parse>, mine: boolean) {
  const where: Record<string, unknown> = {};

  if (!mine) {
    where.status = query.status ?? RoomStatus.ACTIVE;
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.landlordId) {
    where.landlordId = query.landlordId;
  }

  if (query.city) {
    where.city = {
      contains: query.city,
    };
  }

  if (query.district) {
    where.district = {
      contains: query.district,
    };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  if (query.minArea !== undefined || query.maxArea !== undefined) {
    where.area = {
      ...(query.minArea !== undefined ? { gte: query.minArea } : {}),
      ...(query.maxArea !== undefined ? { lte: query.maxArea } : {}),
    };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
      { address: { contains: query.search } },
      { ward: { contains: query.search } },
      { district: { contains: query.search } },
      { city: { contains: query.search } },
    ];
  }

  return where;
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

export async function GET(request: NextRequest) {
  try {
    const mine = request.nextUrl.searchParams.get("mine") === "true";
    const parsed = roomListQuerySchema.safeParse(getSearchParamsObject(request));

    if (!parsed.success) {
      return errorResponse(
        "Tham số lọc phòng không hợp lệ",
        400,
        parsed.error.flatten(),
      );
    }

    const query = parsed.data;

    if (mine) {
      const auth = await requireApprovedLandlord(request);
      if (auth.response) return auth.response;
      query.landlordId = auth.user.id;
    } else if (query.landlordId) {
      const user = await getAuthenticatedUser(request).catch(() => null);
      const isOwnQuery = user?.id === query.landlordId;

      if (!isOwnQuery) {
        query.status = query.status ?? RoomStatus.ACTIVE;
      }
    }

    const where = buildRoomWhere(query, mine);
    const skip = (query.page - 1) * query.limit;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.limit,
        include: includeRoomRelations(),
      }),
      prisma.room.count({
        where,
      }),
    ]);

    const data = rooms.map((room: RoomWithPublicRelations) => ({
      ...serializeRoom(room),
      _count: {
        images: room.images.length,
      },
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/rooms failed:", error);
    return errorResponse("Không thể tải danh sách phòng", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApprovedLandlord(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => null);
    const parsed = roomCreateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu phòng không hợp lệ",
        400,
        parsed.error.flatten(),
      );
    }

    const input = parsed.data;
    const riskScore = calculateRoomRiskScore({
      price: input.price,
      deposit: 0,
      description: input.description,
      address: input.address,
      imageCount: input.images.length,
      ownerReputation: 5,
    });

    const room = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdRoom = await tx.room.create({
        data: {
          landlordId: auth.user.id,
          title: input.title,
          description: input.description,
          address: input.address,
          ward: input.ward,
          district: input.district,
          city: input.city,
          price: input.price,
          electricPrice: input.electricPrice,
          waterPrice: input.waterPrice,
          serviceFee: input.serviceFee,
          area: input.area,
          maxOccupants: input.maxOccupants,
          currentOccupants: input.currentOccupants,
          availableSlots: Math.max(input.maxOccupants - input.currentOccupants, 0),
          latitude: input.latitude,
          longitude: input.longitude,
          status: input.status,
          riskScore,
          images: {
            create: input.images.map((imageUrl, index) => ({
              imageUrl,
              isCover: index === 0,
              sortOrder: index,
            })),
          },
        },
      });

      return tx.room.findUniqueOrThrow({
        where: {
          id: createdRoom.id,
        },
        include: includeRoomRelations(),
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng phòng thành công",
        data: serializeRoom(room),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/rooms failed:", error);
    return errorResponse("Không thể đăng phòng", 500);
  }
}
