import { UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { generateToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

const TOKEN_COOKIE_NAME = "token";
const TOKEN_EXPIRES_IN = "7d";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const INVALID_LOGIN_MESSAGE = "Email hoặc mật khẩu không đúng";
const WAITING_APPROVAL_MESSAGE = "Tài khoản đang chờ quản trị viên xét duyệt.";
const REJECTED_MESSAGE = "Tài khoản đã bị từ chối. Vui lòng liên hệ quản trị viên.";

function validationErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      success: false,
      message: "Dữ liệu đăng nhập không hợp lệ",
      errors:
        error && typeof error === "object" && "flatten" in error
          ? (error as { flatten: () => unknown }).flatten()
          : null,
    },
    { status: 400 },
  );
}

function invalidLoginResponse() {
  return NextResponse.json(
    {
      success: false,
      message: INVALID_LOGIN_MESSAGE,
    },
    { status: 401 },
  );
}

function blockedAccountResponse(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 },
  );
}

function getBlockedAccountMessage(role: UserRole, status: UserStatus) {
  if (status === UserStatus.APPROVED) {
    return null;
  }

  if (role === UserRole.LANDLORD && status === UserStatus.PENDING) {
    return WAITING_APPROVAL_MESSAGE;
  }

  if (status === UserStatus.REJECTED) {
    return REJECTED_MESSAGE;
  }

  return WAITING_APPROVAL_MESSAGE;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        password: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            university: true,
          },
        },
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

    if (!user) {
      return invalidLoginResponse();
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return invalidLoginResponse();
    }

    const blockedMessage = getBlockedAccountMessage(user.role, user.status);

    if (blockedMessage) {
      return blockedAccountResponse(blockedMessage);
    }

    const token = await generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      { expiresIn: TOKEN_EXPIRES_IN },
    );

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      landlordProfile: user.landlordProfile,
    };
    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: safeUser,
      },
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể đăng nhập",
      },
      { status: 500 },
    );
  }
}
