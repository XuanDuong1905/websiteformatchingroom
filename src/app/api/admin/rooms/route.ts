import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function buildPagination(request: NextRequest) {
  const page = toPositiveInt(request.nextUrl.searchParams.get("page"), 1);
  const requestedLimit = toPositiveInt(
    request.nextUrl.searchParams.get("limit"),
    DEFAULT_LIMIT,
  );
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildRoomWhere(request: NextRequest): Prisma.RoomWhereInput {
  const search = request.nextUrl.searchParams.get("search")?.trim();

  if (!search) return {};

  return {
    OR: [
      { title: { contains: search } },
      { address: { contains: search } },
      { ward: { contains: search } },
      { district: { contains: search } },
      { city: { contains: search } },
      {
        landlord: {
          fullName: {
            contains: search,
          },
        },
      },
      {
        landlord: {
          email: {
            contains: search,
          },
        },
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = buildPagination(request);
    const where = buildRoomWhere(request);

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          address: true,
          ward: true,
          district: true,
          city: true,
          price: true,
          area: true,
          status: true,
          riskScore: true,
          createdAt: true,
          landlord: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              images: true,
              reviews: true,
              riskReports: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/rooms failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tải danh sách trọ",
      },
      { status: 500 },
    );
  }
}
