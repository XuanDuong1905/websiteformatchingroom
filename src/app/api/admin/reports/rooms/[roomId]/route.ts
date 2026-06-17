import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== UserRole.ADMIN) {
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

    // Fetch the room with landlord details and reports
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        title: true,
        address: true,
        district: true,
        city: true,
        status: true,
        price: true,
        createdAt: true,
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        riskReports: {
          select: {
            id: true,
            riskType: true,
            description: true,
            evidenceUrl: true,
            severity: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            reporter: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            handler: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy phòng trọ." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("GET /api/admin/reports/rooms/[roomId] failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải chi tiết báo cáo phòng trọ." },
      { status: 500 }
    );
  }
}
