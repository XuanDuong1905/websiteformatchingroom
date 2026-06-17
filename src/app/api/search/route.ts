import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSearchQuery } from "@/lib/utils/searchParser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit")) || 20;

    const parsed = parseSearchQuery(q);

    // 1. Build Room query
     
    const roomWhere: any = {
      status: "ACTIVE",
    };

    if (parsed.district) {
      roomWhere.OR = [
        { district: { contains: parsed.district } },
        { address: { contains: parsed.district } },
      ];
    }

    if (parsed.maxPrice) {
      roomWhere.price = { lte: parsed.maxPrice };
    }

    if (parsed.keyword) {
      const keywordFilter = { contains: parsed.keyword };
      if (roomWhere.OR) {
        roomWhere.AND = [
          {
            OR: [
              { title: keywordFilter },
              { description: keywordFilter },
              { address: keywordFilter },
            ],
          },
        ];
      } else {
        roomWhere.OR = [
          { title: keywordFilter },
          { description: keywordFilter },
          { address: keywordFilter },
        ];
      }
    }

    if (parsed.amenities.length > 0) {
      // Find rooms that have all requested amenities (by name in Amenity table)
      roomWhere.amenities = {
        some: {
          amenity: {
            name: { in: parsed.amenities },
          },
        },
      };
    }

    const rooms = await prisma.room.findMany({
      where: roomWhere,
      take: limit,
      include: {
        images: true,
        landlord: {
          select: { fullName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Build Profile query
     
    const profileWhere: any = {
      isActive: true,
      role: { in: ["STUDENT", "ADMIN"] }, // only students look for roommates
    };

    if (parsed.gender && parsed.gender !== "any") {
      profileWhere.gender = parsed.gender;
    }

    if (parsed.district) {
      profileWhere.profile = {
        ...profileWhere.profile,
        preferredDistrict: { contains: parsed.district },
      };
    }

    if (parsed.maxPrice) {
      profileWhere.lifestyleProfile = {
        ...profileWhere.lifestyleProfile,
        budgetMin: { lte: parsed.maxPrice },
      };
    }

    if (parsed.keyword) {
      profileWhere.OR = [
        { fullName: { contains: parsed.keyword } },
        { profile: { schoolName: { contains: parsed.keyword } } },
      ];
    }

    const profiles = await prisma.user.findMany({
      where: profileWhere,
      take: limit,
      select: {
        id: true,
        fullName: true,
        gender: true,
        avatarUrl: true,
        reputationScore: true,
        profile: {
          select: {
            schoolName: true,
            preferredDistrict: true,
            bio: true,
          },
        },
        lifestyleProfile: {
          select: {
            budgetMin: true,
            budgetMax: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        rooms,
        profiles,
        total: rooms.length + profiles.length,
        parsedQuery: parsed,
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi tìm kiếm" },
      { status: 500 },
    );
  }
}
