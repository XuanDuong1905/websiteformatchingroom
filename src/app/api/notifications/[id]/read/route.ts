import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = Number(id);

    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    // Chỉ cho phép đánh dấu notification của chính mình
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        isRead: true,
      },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông báo" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notifications mark read]", error);
    return NextResponse.json(
      { success: false, message: "Lỗi cập nhật thông báo" },
      { status: 500 }
    );
  }
}
