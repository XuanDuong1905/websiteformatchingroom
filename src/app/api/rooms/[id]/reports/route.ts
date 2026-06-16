import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const roomId = Number(id);
    const body = await request.json();

    const { reporterId, riskType, description } = body;

    if (!reporterId || !riskType || !description) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin báo cáo" },
        { status: 400 },
      );
    }

    const report = await prisma.riskReport.create({
      data: {
        reporterId: Number(reporterId),
        roomId,
        riskType,
        description,
        severity: "medium", // Default severity
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi gửi báo cáo" },
      { status: 500 },
    );
  }
}
