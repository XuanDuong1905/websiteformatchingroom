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
      return NextResponse.json(
        {
          success: false,
          message: "Khong tim thay tai khoan chu tro",
        },
        { status: 404 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: landlordId,
      },
      data: {
        status: UserStatus.REJECTED,
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
        landlordProfile: {
          select: {
            id: true,
            businessName: true,
            businessLicenseImage: true,
            verifiedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Da tu choi tai khoan chu tro",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/landlords/[id]/reject failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the tu choi tai khoan chu tro",
      },
      { status: 500 },
    );
  }
}
