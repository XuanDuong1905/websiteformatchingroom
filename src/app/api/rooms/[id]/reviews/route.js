import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const roomId = Number(params.id);
    if (!Number.isInteger(roomId) || roomId < 1) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        roomId: roomId,
        reviewType: "room",
        isVisible: true
      },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { fullName: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const roomId = Number(params.id);
    const body = await request.json();
    
    // Tạm thời nhận reviewerId từ body. (Sau này thay bằng auth token)
    const { reviewerId, rating, comment } = body;

    if (!reviewerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Thiếu dữ liệu hoặc rating sai" }, { status: 400 });
    }

    const roomExists = await prisma.room.findUnique({ where: { id: roomId } });
    if (!roomExists) return NextResponse.json({ success: false, message: "Phòng không tồn tại" }, { status: 404 });

    const newReview = await prisma.review.create({
      data: {
        reviewerId: Number(reviewerId),
        roomId: roomId,
        rating: Number(rating),
        comment: comment || null,
        reviewType: "room", 
      }
    });

    return NextResponse.json({ success: true, message: "Đánh giá thành công", data: newReview }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}