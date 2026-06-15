import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoomStatus, VerificationStatus } from "@prisma/client";
import { calculateRoomRiskScore } from "@/lib/riskScore";

const SORT_OPTIONS = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  risk_asc: { riskScore: "asc" },
  area_desc: { area: "desc" },
};

function readNumber(searchParams, key) {
  const value = searchParams.get(key);

  if (value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error("INVALID_NUMBER");
  }

  return number;
}

function readInteger(searchParams, key, defaultValue) {
  const value = searchParams.get(key);

  if (value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new Error("INVALID_NUMBER");
  }

  return number;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const district = searchParams.get("district");
    const ward = searchParams.get("ward");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const verificationStatus = searchParams.get("verificationStatus");
    const availableOnly = searchParams.get("availableOnly") === "true";
    const sort = searchParams.get("sort") || "newest";

    if (status && !Object.values(RoomStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Trạng thái phòng không hợp lệ",
        },
        { status: 400 }
      );
    }

    if (
      verificationStatus &&
      !Object.values(VerificationStatus).includes(verificationStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Trạng thái xác thực không hợp lệ",
        },
        { status: 400 }
      );
    }

    const minPrice = readNumber(searchParams, "minPrice");
    const maxPrice = readNumber(searchParams, "maxPrice");
    const minArea = readNumber(searchParams, "minArea");
    const maxArea = readNumber(searchParams, "maxArea");
    const maxPeople = readInteger(searchParams, "maxPeople", null);
    const maxRiskScore = readNumber(searchParams, "maxRiskScore");
    const page = readInteger(searchParams, "page", 1);
    const limit = Math.min(readInteger(searchParams, "limit", 12), 50);

    const where = {
      status: status || {
        not: RoomStatus.deleted,
      },
    };

    if (district) {
      where.district = district;
    }

    if (ward) {
      where.ward = ward;
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    if (minPrice !== null || maxPrice !== null) {
      where.price = {};

      if (minPrice !== null) {
        where.price.gte = minPrice;
      }

      if (maxPrice !== null) {
        where.price.lte = maxPrice;
      }
    }

    if (minArea !== null || maxArea !== null) {
      where.area = {};

      if (minArea !== null) {
        where.area.gte = minArea;
      }

      if (maxArea !== null) {
        where.area.lte = maxArea;
      }
    }

    if (maxPeople !== null) {
      where.maxPeople = {
        gte: maxPeople,
      };
    }

    if (availableOnly) {
      where.availableSlots = {
        gt: 0,
      };
    }

    if (maxRiskScore !== null) {
      where.riskScore = {
        lte: maxRiskScore,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { district: { contains: search } },
        { ward: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          address: true,
          district: true,
          ward: true,
          price: true,
          area: true,
          maxPeople: true,
          currentPeople: true,
          availableSlots: true,
          verificationStatus: true,
          riskScore: true,
          status: true,
          createdAt: true,
          images: {
            where: {
              isCover: true,
            },
            select: {
              imageUrl: true,
            },
            take: 1,
          },
          owner: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              reputationScore: true,
            },
          },
        },
      }),
      prisma.room.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/rooms failed:", error);

    if (error.message === "INVALID_NUMBER") {
      return NextResponse.json(
        {
          success: false,
          message: "Tham số lọc không hợp lệ",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi máy chủ",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      ownerId,
      title,
      description,
      address,
      district,
      ward,
      latitude,
      longitude,
      price,
      deposit,
      area,
      electricityFee,
      waterFee,
      wifiFee,
      parkingFee,
      otherFee,
      maxPeople,
      availableSlots,
      hasContract,
      minStayMonths,
      availableFrom,
    } = body;

    if (!ownerId || !title || !address || !district || !price) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc",
        },
        { status: 400 }
      );
    }

    const owner = await prisma.user.findUnique({
      where: { id: Number(ownerId) },
      select: { reputationScore: true }
    });

    const riskScore = calculateRoomRiskScore({
      price: Number(price),
      deposit: deposit ? Number(deposit) : 0,
      description: description,
      address: address,
      imageCount: 0,
      ownerReputation: owner ? owner.reputationScore : 5.0
    });

    const room = await prisma.room.create({
      data: {
        ownerId: Number(ownerId),
        title,
        description,
        address,
        district,
        ward,
        price: Number(price),
        deposit: deposit ? Number(deposit) : 0,
        area: area ? Number(area) : null,
        electricityFee: electricityFee ? Number(electricityFee) : 0,
        waterFee: waterFee ? Number(waterFee) : 0,
        wifiFee: wifiFee ? Number(wifiFee) : 0,
        parkingFee: parkingFee ? Number(parkingFee) : 0,
        otherFee: otherFee ? Number(otherFee) : 0,
        maxPeople: maxPeople ? Number(maxPeople) : 1,
        availableSlots: availableSlots ? Number(availableSlots) : 1,
        hasContract: Boolean(hasContract),
        minStayMonths: minStayMonths ? Number(minStayMonths) : 1,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        riskScore: riskScore,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng phòng thành công",
        data: room,
      },
      { status: 201 }
    );
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
