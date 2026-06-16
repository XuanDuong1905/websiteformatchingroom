import { Prisma, UserRole } from "@prisma/client";
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

function buildLandlordWhere(request: NextRequest): Prisma.UserWhereInput {
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const where: Prisma.UserWhereInput = {
    role: UserRole.LANDLORD,
  };

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
      {
        landlordProfile: {
          businessName: {
            contains: search,
          },
        },
      },
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip } = buildPagination(request);
    const where = buildLandlordWhere(request);

    const [landlords, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          reputationScore: true,
          createdAt: true,
          landlordProfile: {
            select: {
              businessName: true,
              businessLicenseImage: true,
              verifiedAt: true,
            },
          },
          _count: {
            select: {
              rooms: true,
              reportsReceived: true,
              reviewsReceived: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: landlords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/landlords failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tải danh sách chủ trọ",
      },
      { status: 500 },
    );
  }
}
