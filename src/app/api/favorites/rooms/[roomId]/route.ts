import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ roomId: string }>;
};

// DELETE /api/favorites/rooms/[roomId] - Bỏ yêu thích
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { roomId: roomIdStr } = await params;
    const roomId = Number(roomIdStr);

    if (!roomId || isNaN(roomId)) {
      return NextResponse.json(
        { success: false, message: "roomId không hợp lệ" },
        { status: 400 }
      );
    }

    await prisma.favoriteRoom.deleteMany({
      where: {
        userId: user.id,
        roomId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Favorites DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi bỏ yêu thích" },
      { status: 500 }
    );
  }
}
