import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID sinh viên không hợp lệ" },
        { status: 400 },
      );
    }

    const student = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.STUDENT,
      },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sinh viên" },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa sinh viên khỏi database",
    });
  } catch (error) {
    console.error("DELETE /api/admin/students/[id] failed:", error);

    return NextResponse.json(
      { success: false, message: "Không thể xóa sinh viên" },
      { status: 500 },
    );
  }
}
