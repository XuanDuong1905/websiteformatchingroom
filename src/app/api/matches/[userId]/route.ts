import { NextResponse } from "next/server";

import { findBestMatches, type MatchingUser } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

const userInclude = {
  profile: {
    select: {
      schoolName: true,
      preferredDistrict: true,
    },
  },
  lifestyleProfile: {
    select: {
      budgetMin: true,
      budgetMax: true,
      sleepTime: true,
      wakeTime: true,
      cleaningFrequency: true,
      noiseTolerance: true,
      privacyPreference: true,
      smoking: true,
      petFriendly: true,
      guestFrequency: true,
    },
  },
};

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await params;
  const id = Number(userId);

  const currentUser = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });

  if (!currentUser?.profile || !currentUser.lifestyleProfile) {
    return NextResponse.json(
      {
        success: false,
        message: "Người dùng chưa có đủ UserProfile và LifestyleProfile",
      },
      { status: 404 },
    );
  }

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: id },
      isActive: true,
      profile: { isNot: null },
      lifestyleProfile: { isNot: null },
    },
    include: userInclude,
  });

  const matches = findBestMatches(
    currentUser as MatchingUser,
    candidates as MatchingUser[],
  );

  await prisma.matchingResult.deleteMany({
    where: {
      userId: id,
      matchedUserId: {
        in: matches.map((match) => match.user.id),
      },
      roomId: null,
    },
  });

  await Promise.all(
    matches.map((match) =>
      prisma.matchingResult.create({
        data: {
          userId: id,
          matchedUserId: match.user.id,
          compatibilityScore: match.matchScore,
          lifestyleScore: match.matchScore,
          finalScore: match.matchScore,
          reason: match.reasons.join("; "),
        },
      }),
    ),
  );

  return NextResponse.json({
    success: true,
    data: matches,
  });
}
