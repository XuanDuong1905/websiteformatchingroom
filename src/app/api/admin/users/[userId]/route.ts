import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
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

    // Fetch user details along with profiles, warnings, reports received, and posted rooms
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        status: true,
        reputationScore: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          select: {
            university: true,
          },
        },
        landlordProfile: {
          select: {
            businessName: true,
            businessLicenseImage: true,
            verifiedAt: true,
          },
        },
        profile: {
          select: {
            schoolName: true,
            major: true,
            occupation: true,
          },
        },
        warnings: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        reportsReceived: {
          select: {
            id: true,
            riskType: true,
            description: true,
            severity: true,
            status: true,
            createdAt: true,
            reporter: {
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
        rooms: {
          select: {
            id: true,
            title: true,
            address: true,
            status: true,
            price: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // Determine user block history if inactive
    let blockReason = "";
    if (!user.isActive) {
      const blockRecord = await prisma.userBlock.findUnique({
        where: { email: user.email },
      });
      if (blockRecord) {
        blockReason = blockRecord.reason;
      }
    }

    const { profile, ...userWithoutProfile } = user;

    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutProfile,
        userProfile: profile,
        blockReason,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/[userId] failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải chi tiết người dùng." },
      { status: 500 }
    );
  }
}
