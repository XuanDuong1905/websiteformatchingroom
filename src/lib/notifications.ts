import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

type CreateNotificationInput = {
  userId: number;
  actorId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

/**
 * Tạo một thông báo mới cho một user.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    // Không tạo thông báo cho chính mình
    if (input.userId === input.actorId) return null;

    return await prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
      },
    });
  } catch (error) {
    console.error("[Notification] Failed to create:", error);
    return null;
  }
}

/**
 * Tạo thông báo khi có bình luận mới trên phòng trọ.
 * - Thông báo cho landlord (chủ phòng).
 * - Thông báo cho các user đã từng comment trên phòng đó.
 * - Loại trừ chính người vừa comment.
 * - Tránh duplicate thông báo cho cùng một user.
 */
export async function notifyOnRoomComment({
  roomId,
  reviewerId,
  reviewerName,
}: {
  roomId: number;
  reviewerId: number;
  reviewerName: string;
}) {
  try {
    // Lấy thông tin phòng (bao gồm landlord)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        title: true,
        landlordId: true,
      },
    });

    if (!room) return;

    const notifiedUserIds = new Set<number>();
    // Luôn loại trừ chính người comment
    notifiedUserIds.add(reviewerId);

    const link = `/room/${room.id}`;

    // 1. Thông báo cho landlord (chủ phòng)
    if (!notifiedUserIds.has(room.landlordId)) {
      notifiedUserIds.add(room.landlordId);
      await createNotification({
        userId: room.landlordId,
        actorId: reviewerId,
        type: "ROOM_COMMENT",
        title: "Bình luận mới trên phòng của bạn",
        message: `${reviewerName} đã bình luận về phòng "${room.title}"`,
        link,
      });
    }

    // 2. Thông báo cho tất cả user đã từng comment phòng này
    const previousReviewers = await prisma.review.findMany({
      where: {
        roomId,
        reviewType: "room",
        isVisible: true,
      },
      select: {
        reviewerId: true,
      },
      distinct: ["reviewerId"],
    });

    for (const prev of previousReviewers) {
      if (notifiedUserIds.has(prev.reviewerId)) continue;
      notifiedUserIds.add(prev.reviewerId);

      await createNotification({
        userId: prev.reviewerId,
        actorId: reviewerId,
        type: "COMMENTED_ROOM_COMMENT",
        title: "Bình luận mới trên phòng bạn theo dõi",
        message: `${reviewerName} cũng đã bình luận về phòng "${room.title}"`,
        link,
      });
    }

    // 3. Thông báo cho user đã yêu thích phòng này
    const favoritedUsers = await prisma.favoriteRoom.findMany({
      where: { roomId },
      select: { userId: true },
    });

    for (const fav of favoritedUsers) {
      if (notifiedUserIds.has(fav.userId)) continue;
      notifiedUserIds.add(fav.userId);

      await createNotification({
        userId: fav.userId,
        actorId: reviewerId,
        type: "COMMENTED_ROOM_COMMENT",
        title: "Bình luận mới trên phòng bạn yêu thích",
        message: `${reviewerName} đã bình luận về phòng "${room.title}" mà bạn yêu thích`,
        link,
      });
    }
  } catch (error) {
    console.error("[Notification] notifyOnRoomComment error:", error);
  }
}
