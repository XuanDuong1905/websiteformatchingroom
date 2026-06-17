import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(req);
    const currentUserId = user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const conversationId = parseInt(id, 10);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userOne: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        userTwo: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        room: {
          select: { id: true, title: true, price: true, address: true, images: { take: 1 } },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy cuộc trò chuyện" },
        { status: 404 }
      );
    }

    if (conversation.userOneId !== currentUserId && conversation.userTwoId !== currentUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Mark messages from the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error("GET /api/conversations/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi lấy chi tiết chat" },
      { status: 500 }
    );
  }
}
