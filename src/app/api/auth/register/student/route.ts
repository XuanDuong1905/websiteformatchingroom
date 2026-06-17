import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { studentRegisterSchema } from "@/lib/validations/auth";


export const runtime = "nodejs";

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
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("email")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = studentRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { fullName, email, password, university } = parsed.data;

    // Check if email has been verified with OTP in database
    const verification = await prisma.emailVerification.findUnique({
      where: {
        email_purpose: {
          email,
          purpose: "verify_email",
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng xác minh OTP trước khi đăng ký.",
        },
        { status: 400 }
      );
    }

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
        password: hashedPassword,
        role: UserRole.STUDENT,
        status: UserStatus.APPROVED,
        studentProfile: {
          create: {
            university,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            university: true,
          },
        },
      },
    });

    // Clear verification record after successful registration to make it single-use
    await prisma.emailVerification.delete({
      where: {
        email_purpose: {
          email,
          purpose: "verify_email",
        },
      },
    }).catch((err: any) => {
      console.error("Failed to delete email verification record:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Dang ky tai khoan sinh vien thanh cong",
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

    console.error("POST /api/auth/register/student failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the dang ky tai khoan sinh vien",
      },
      { status: 500 },
    );
  }
}
