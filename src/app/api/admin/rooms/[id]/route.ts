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
        { success: false, message: "ID phòng không hợp lệ" },
        { status: 400 },
      );
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phòng trọ" },
        { status: 404 },
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa phòng trọ khỏi database",
    });
  } catch (error) {
    console.error("DELETE /api/admin/rooms/[id] failed:", error);

    return NextResponse.json(
      { success: false, message: "Không thể xóa phòng trọ" },
      { status: 500 },
    );
  }
}
