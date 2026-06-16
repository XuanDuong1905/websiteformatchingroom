import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { landlordRegisterSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

const PENDING_REVIEW_MESSAGE = "Tài khoản đang chờ quản trị viên xét duyệt.";

function validationErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      success: false,
      message: "Du lieu dang ky khong hop le",
      errors:
        error && typeof error === "object" && "flatten" in error
          ? (error as { flatten: () => unknown }).flatten()
          : null,
    },
    { status: 400 },
  );
}

function isUniqueEmailError(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = error.meta?.target;

  return (
    (Array.isArray(target) && target.includes("email")) ||
    (typeof target === "string" && target.includes("email"))
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = landlordRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const {
      fullName,
      email,
      phone,
      password,
      businessName,
      businessLicenseImage,
    } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email da duoc su dung",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
        role: UserRole.LANDLORD,
        status: UserStatus.PENDING,
        landlordProfile: {
          create: {
            businessName,
            businessLicenseImage,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
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

    return NextResponse.json(
      {
        success: true,
        message: PENDING_REVIEW_MESSAGE,
        data: {
          user,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email da duoc su dung",
        },
        { status: 409 },
      );
    }

    console.error("POST /api/auth/register/landlord failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the dang ky tai khoan chu tro",
      },
      { status: 500 },
    );
  }
}
