import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function parseLandlordId(rawId: string) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function invalidIdResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "ID chu tro khong hop le",
    },
    { status: 400 },
  );
}

function notFoundResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Khong tim thay tai khoan chu tro",
    },
    { status: 404 },
  );
}

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const landlordId = parseLandlordId(rawId);

    if (!landlordId) {
      return invalidIdResponse();
    }

    const landlord = await prisma.user.findFirst({
      where: {
        id: landlordId,
        role: UserRole.LANDLORD,
        landlordProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
      },
    });

    if (!landlord) {
      return notFoundResponse();
    }

    const verifiedAt = new Date();

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: landlordId,
        },
        data: {
          status: UserStatus.APPROVED,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.landlordProfile.update({
        where: {
          userId: landlordId,
        },
        data: {
          verifiedAt,
        },
        select: {
          id: true,
          businessName: true,
          businessLicenseImage: true,
          verifiedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Da phe duyet tai khoan chu tro",
      data: {
        user: {
          ...updatedUser,
          landlordProfile: updatedProfile,
        },
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/landlords/[id]/approve failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the phe duyet tai khoan chu tro",
      },
      { status: 500 },
    );
  }
}
