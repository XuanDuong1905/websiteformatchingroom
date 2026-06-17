import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole, RoomStatus, ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

type LandlordSelect = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
};

type RiskReportSelect = {
  id: number;
  severity: "low" | "medium" | "high";
  status: "pending" | "reviewing" | "resolved" | "rejected";
  createdAt: Date;
};

type RoomWithReports = {
  id: number;
  title: string;
  address: string;
  district: string;
  city: string;
  status: RoomStatus;
  price: number;
  createdAt: Date;
  landlord: LandlordSelect;
  riskReports: RiskReportSelect[];
};

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền thực hiện hành động này." },
        { status: 403 }
      );
    }

    // Fetch rooms with at least 1 risk report
    const rooms = await prisma.room.findMany({
      where: {
        riskReports: {
          some: {},
        },
      },
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
            severity: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }) as unknown as RoomWithReports[];

    // Process and calculate report metrics for each room
    const processedRooms = rooms.map((room: RoomWithReports) => {
      const reports = room.riskReports;
      const totalReports = reports.length;
      
      // Calculate latest report date
      let latestReportDate = room.createdAt;
      if (reports.length > 0) {
        const dates = reports.map((r: RiskReportSelect) => new Date(r.createdAt).getTime());
        latestReportDate = new Date(Math.max(...dates));
      }

      // Determine max severity
      let maxSeverity = "low";
      const severities = reports.map((r: RiskReportSelect) => r.severity);
      if (severities.includes("high")) {
        maxSeverity = "high";
      } else if (severities.includes("medium")) {
        maxSeverity = "medium";
      }

      // Count report statuses
      const pendingCount = reports.filter((r: RiskReportSelect) => r.status === ReportStatus.pending).length;
      const reviewingCount = reports.filter((r: RiskReportSelect) => r.status === ReportStatus.reviewing).length;

      return {
        id: room.id,
        title: room.title,
        address: room.address,
        district: room.district,
        city: room.city,
        status: room.status,
        price: room.price,
        landlord: room.landlord,
        totalReports,
        pendingReportsCount: pendingCount,
        reviewingReportsCount: reviewingCount,
        maxSeverity,
        latestReportDate,
      };
    });

    return NextResponse.json({
      success: true,
      data: processedRooms,
    });
  } catch (error) {
    console.error("GET /api/admin/reports/rooms failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải danh sách phòng bị báo cáo." },
      { status: 500 }
    );
  }
}
