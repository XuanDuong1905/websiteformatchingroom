import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/server";

// GET: Lấy danh sách conversation của user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      include: {
        userOne: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        userTwo: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        room: {
          select: { id: true, title: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error("GET /api/conversations Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi lấy danh sách chat" },
      { status: 500 }
    );
  }
}

// POST: Tạo hoặc lấy conversation đã tồn tại
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const currentUserId = user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { targetUserId, roomId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Thiếu targetUserId" },
        { status: 400 }
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Không thể chat với chính mình" },
        { status: 400 }
      );
    }

    // Kiểm tra xem targetUser có thật sự tồn tại trong DB không
    // (Phòng trường hợp đây là dữ liệu mẫu/giả không có trong bảng User)
    const targetUserExists = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });

    if (!targetUserExists) {
      return NextResponse.json(
        { success: false, message: "Người dùng này không tồn tại hoặc là dữ liệu mẫu." },
        { status: 404 }
      );
    }

    // Sort to avoid duplicate conversations like (A,B) and (B,A)
    const userOneId = Math.min(currentUserId, targetUserId);
    const userTwoId = Math.max(currentUserId, targetUserId);

    let conversation = await prisma.conversation.findFirst({
      where: {
        userOneId,
        userTwoId,
        roomId: roomId || null,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userOneId,
          userTwoId,
          roomId: roomId || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error: unknown) {
    console.error("POST /api/conversations Error:", error);
    return NextResponse.json(
      { success: false, message: `Lỗi khởi tạo chat: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
