import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminUser = await getAuthenticatedUser(request);
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền thực hiện hành động này." },
        { status: 403 }
      );
    }

    const { userId: userIdStr } = await params;
    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Mã người dùng không hợp lệ." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.reason) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập lý do cảnh báo." },
        { status: 400 }
      );
    }

    const { reason } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // Create a new warning record
    const warning = await prisma.userWarning.create({
      data: {
        userId,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gửi cảnh cáo người dùng thành công.",
      data: warning,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[userId]/status failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể gửi cảnh cáo người dùng." },
      { status: 500 }
    );
  }
}
