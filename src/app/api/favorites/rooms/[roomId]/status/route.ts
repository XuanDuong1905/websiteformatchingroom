import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ roomId: string }>;
};

// GET /api/favorites/rooms/[roomId]/status - Kiểm tra trạng thái yêu thích
export async function GET(req: NextRequest, { params }: Params) {
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

    const favorite = await prisma.favoriteRoom.findUnique({
      where: {
        userId_roomId: {
          userId: user.id,
          roomId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error("[Favorites status GET]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi kiểm tra trạng thái" },
      { status: 500 }
    );
  }
}
