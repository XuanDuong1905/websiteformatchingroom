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

    const body = await request.json().catch(() => null);
    if (!body || !body.reason) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập lý do khóa tài khoản." },
        { status: 400 }
      );
    }

    const { reason } = body;

    // Fetch user to block
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    if (user.role === UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: "Không thể khóa tài khoản quản trị viên." },
        { status: 400 }
      );
    }

    // Perform transaction to block user and write to block table
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await tx.userBlock.upsert({
        where: { email: user.email },
        update: {
          phone: user.phone,
          reason,
        },
        create: {
          email: user.email,
          phone: user.phone,
          reason,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Khóa tài khoản người dùng thành công.",
    });
  } catch (error) {
    console.error("POST /api/admin/users/[userId]/block failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể khóa tài khoản người dùng." },
      { status: 500 }
    );
  }
}
