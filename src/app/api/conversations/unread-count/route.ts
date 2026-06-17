import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ userOneId: userId }, { userTwoId: userId }],
        },
        senderId: { not: userId },
        readAt: null,
      },
    });

    return NextResponse.json({ success: true, count: unreadCount });
  } catch (error) {
    console.error("GET /api/conversations/unread-count Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi lấy số tin nhắn chưa đọc" }, { status: 500 });
  }
}
