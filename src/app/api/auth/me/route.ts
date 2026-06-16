import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const TOKEN_COOKIE_NAME = "token";

function unauthorizedResponse(message = "Chua dang nhap") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 },
  );
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return unauthorizedResponse();
    }

    const payload = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
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
      const response = unauthorizedResponse("Tai khoan khong ton tai");
      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me failed:", error);

    const response = unauthorizedResponse("Phien dang nhap khong hop le");
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}
