import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function toTimeDate(value: string | null | undefined) {
  if (!value) return undefined;
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = Number(body.userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Thiếu userId" },
        { status: 400 },
      );
    }

    const [userProfile, lifestyleProfile] = await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId },
        update: {
          schoolName: body.schoolName,
          major: body.major,
          birthYear: body.birthYear === undefined ? undefined : Number(body.birthYear),
          currentAddress: body.currentAddress,
          preferredDistrict: body.preferredDistrict,
          bio: body.bio,
          privacyLevel: body.privacyLevel,
        },
        create: {
          userId,
          schoolName: body.schoolName,
          major: body.major,
          birthYear: body.birthYear === undefined ? undefined : Number(body.birthYear),
          currentAddress: body.currentAddress,
          preferredDistrict: body.preferredDistrict,
          bio: body.bio,
          privacyLevel: body.privacyLevel ?? "unknown",
        },
      }),
      prisma.lifestyleProfile.upsert({
        where: { userId },
        update: {
          budgetMin: body.budgetMin === undefined ? undefined : Number(body.budgetMin),
          budgetMax: body.budgetMax === undefined ? undefined : Number(body.budgetMax),
          preferredGender: body.preferredGender,
          sleepTime: toTimeDate(body.sleepTime),
          wakeTime: toTimeDate(body.wakeTime),
          cleaningFrequency: body.cleaningFrequency,
          noiseTolerance: body.noiseTolerance ?? body.noiseLevel,
          privacyPreference: body.privacyPreference ?? body.privacyLevel,
          smoking: body.smoking,
          acceptSmoking: body.acceptSmoking,
          petFriendly: body.petFriendly,
          guestFrequency: body.guestFrequency,
          cookingFrequency: body.cookingFrequency,
        },
        create: {
          userId,
          budgetMin: body.budgetMin === undefined ? null : Number(body.budgetMin),
          budgetMax: body.budgetMax === undefined ? null : Number(body.budgetMax),
          preferredGender: body.preferredGender ?? "any",
          sleepTime: toTimeDate(body.sleepTime),
          wakeTime: toTimeDate(body.wakeTime),
          cleaningFrequency: body.cleaningFrequency ?? "unknown",
          noiseTolerance: body.noiseTolerance ?? body.noiseLevel ?? "unknown",
          privacyPreference: body.privacyPreference ?? body.privacyLevel ?? "unknown",
          smoking: Boolean(body.smoking),
          acceptSmoking: Boolean(body.acceptSmoking),
          petFriendly: Boolean(body.petFriendly),
          guestFrequency: body.guestFrequency ?? "unknown",
          cookingFrequency: body.cookingFrequency ?? "unknown",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        userProfile,
        lifestyleProfile,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu hồ sơ người ở ghép",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
