import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole, RoomStatus, ReportStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const adminUser = await getAuthenticatedUser(request);
    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền thực hiện hành động này." },
        { status: 403 }
      );
    }

    const { roomId: roomIdStr } = await params;
    const roomId = parseInt(roomIdStr, 10);
    if (isNaN(roomId)) {
      return NextResponse.json(
        { success: false, message: "Mã phòng trọ không hợp lệ." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin hành động xử lý." },
        { status: 400 }
      );
    }

    const { action } = body;

    // Check if the room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phòng trọ cần xử lý." },
        { status: 404 }
      );
    }

    // Perform database updates depending on action
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (action === "dismiss") {
        // Dismiss reports: Room status remains, reports marked as rejected
        await tx.riskReport.updateMany({
          where: {
            roomId: roomId,
            status: { in: [ReportStatus.pending, ReportStatus.reviewing] },
          },
          data: {
            status: ReportStatus.rejected,
            handledBy: adminUser.id,
          },
        });
      } else if (action === "warn") {
        // Warn: Set room status to WARNING, mark reports as resolved
        await tx.room.update({
          where: { id: roomId },
          data: { status: RoomStatus.WARNING },
        });

        await tx.riskReport.updateMany({
          where: {
            roomId: roomId,
            status: { in: [ReportStatus.pending, ReportStatus.reviewing] },
          },
          data: {
            status: ReportStatus.resolved,
            handledBy: adminUser.id,
          },
        });
      } else if (action === "hide") {
        // Hide: Set room status to HIDDEN, mark reports as resolved
        await tx.room.update({
          where: { id: roomId },
          data: { status: RoomStatus.HIDDEN },
        });

        await tx.riskReport.updateMany({
          where: {
            roomId: roomId,
            status: { in: [ReportStatus.pending, ReportStatus.reviewing] },
          },
          data: {
            status: ReportStatus.resolved,
            handledBy: adminUser.id,
          },
        });
      } else {
        throw new Error("Hành động xử lý không hợp lệ.");
      }
    });

    return NextResponse.json({
      success: true,
      message: "Xử lý báo cáo phòng trọ thành công.",
    });
  } catch (error) {
    const err = error as Error;
    console.error(`PATCH /api/admin/reports/rooms/resolve failed:`, err);
    return NextResponse.json(
      { success: false, message: err.message || "Không thể xử lý báo cáo phòng trọ." },
      { status: 500 }
    );
  }
}
