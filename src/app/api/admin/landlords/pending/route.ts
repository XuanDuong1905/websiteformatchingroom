import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PendingLandlord = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  landlordProfile: {
    businessName: string;
    businessLicenseImage: string;
  } | null;
};

export async function GET() {
  try {
    const landlords = (await prisma.user.findMany({
      where: {
        role: UserRole.LANDLORD,
        status: UserStatus.PENDING,
        landlordProfile: {
          isNot: null,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        landlordProfile: {
          select: {
            businessName: true,
            businessLicenseImage: true,
          },
        },
      },
    })) as PendingLandlord[];

    return NextResponse.json({
      success: true,
      data: landlords.map((landlord) => ({
        id: landlord.id,
        fullName: landlord.fullName,
        email: landlord.email,
        phone: landlord.phone,
        businessName: landlord.landlordProfile?.businessName ?? "",
        businessLicenseImage: landlord.landlordProfile?.businessLicenseImage ?? "",
        createdAt: landlord.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/landlords/pending failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the tai danh sach chu tro dang cho duyet",
      },
      { status: 500 },
    );
  }
}
