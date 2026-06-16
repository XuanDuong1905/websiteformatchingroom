import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

// GET /api/favorites/rooms - Lấy danh sách phòng yêu thích
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favoriteRoom.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: favorites.map((f: typeof favorites[number]) => ({
        id: f.id,
        roomId: f.room.id,
        createdAt: f.createdAt,
        room: {
          id: f.room.id,
          title: f.room.title,
          price: f.room.price,
          area: f.room.area,
          district: f.room.district,
          ward: f.room.ward,
          address: f.room.address,
          status: f.room.status,
          images: f.room.images,
        },
      })),
    });
  } catch (error) {
    console.error("[Favorites GET]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi tải danh sách yêu thích" },
      { status: 500 }
    );
  }
}

// POST /api/favorites/rooms - Thêm phòng yêu thích
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { roomId } = body;

    if (!roomId || typeof roomId !== "number") {
      return NextResponse.json(
        { success: false, message: "roomId không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra room tồn tại
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, landlordId: true },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Phòng không tồn tại" },
        { status: 404 }
      );
    }

    // Không cho landlord tự favorite phòng của chính mình
    if (room.landlordId === user.id) {
      return NextResponse.json(
        { success: false, message: "Không thể yêu thích phòng của chính bạn" },
        { status: 400 }
      );
    }

    // Tạo favorite (upsert để tránh duplicate error)
    const favorite = await prisma.favoriteRoom.upsert({
      where: {
        userId_roomId: {
          userId: user.id,
          roomId,
        },
      },
      update: {}, // Nếu đã tồn tại thì giữ nguyên
      create: {
        userId: user.id,
        roomId,
      },
    });

    return NextResponse.json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    console.error("[Favorites POST]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi thêm yêu thích" },
      { status: 500 }
    );
  }
}
