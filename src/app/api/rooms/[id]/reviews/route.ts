import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const roomId = Number(id);

    const reviews = await prisma.review.findMany({
      where: {
        roomId,
        reviewType: "room",
        isVisible: true,
      },
      include: {
        reviewer: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi tải đánh giá phòng" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const roomId = Number(id);
    const body = await request.json();

    const { reviewerId, rating, comment } = body;

    if (!reviewerId || !rating) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đánh giá" },
        { status: 400 },
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: Number(reviewerId),
        roomId,
        rating: Number(rating),
        comment,
        reviewType: "room",
      },
      include: {
        reviewer: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi tạo đánh giá phòng" },
      { status: 500 },
    );
  }
}
