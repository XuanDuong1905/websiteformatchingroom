import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const roomId = Number(resolvedParams.id);

    const body = await request.json();
    
    const { reporterId, riskType, description, severity } = body;

    if (!reporterId || !riskType || !description) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin báo cáo" }, { status: 400 });
    }

    const roomExists = await prisma.room.findUnique({ where: { id: roomId } });
    if (!roomExists) return NextResponse.json({ success: false, message: "Phòng không tồn tại" }, { status: 404 });

    const newReport = await prisma.riskReport.create({
      data: {
        reporterId: Number(reporterId),
        roomId: roomId,
        riskType: riskType, 
        description: description,
        severity: severity || "medium",
        status: "pending"
      }
    });

    return NextResponse.json({ success: true, message: "Đã gửi báo cáo cho Quản trị viên hệ thống xử lý", data: newReport }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}