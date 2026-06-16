import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN_COOKIE_NAME = "token";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Dang xuat thanh cong",
  });

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
