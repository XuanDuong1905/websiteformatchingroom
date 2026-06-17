import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole, Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(
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

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // Perform transaction to unblock user
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      // Remove from user blocks if it exists
      await tx.userBlock.deleteMany({
        where: { email: user.email },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Mở khóa tài khoản người dùng thành công.",
    });
  } catch (error) {
    console.error("POST /api/admin/users/[userId]/unblock failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể mở khóa tài khoản người dùng." },
      { status: 500 }
    );
  }
}
