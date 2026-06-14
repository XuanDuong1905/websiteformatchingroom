import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const roomId = Number(params.id);
    const reviewId = Number(params.reviewId);
    
    // Tạm thời lấy ID của người đang thực hiện hành động xóa từ Body
    const body = await request.json();
    const { currentUserId } = body;

    if (!currentUserId || !reviewId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin user hoặc review" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review || review.roomId !== roomId || review.isVisible === false) {
      return NextResponse.json({ success: false, message: "Đánh giá không tồn tại hoặc đã bị xóa" }, { status: 404 });
    }

    // Chỉ người viết ra bình luận đó mới có quyền xóa
    // Trừ khi họ là admin (tính năng mở rộng sau này)
    if (review.reviewerId !== Number(currentUserId)) {
      return NextResponse.json({ success: false, message: "Bạn không có quyền xóa đánh giá của người khác" }, { status: 403 });
    }

    // Soft Delete (Ẩn bình luận)
    await prisma.review.update({
      where: { id: reviewId },
      data: { isVisible: false }
    });

    return NextResponse.json({ success: true, message: "Đã xóa đánh giá thành công" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}