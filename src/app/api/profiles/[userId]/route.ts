import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

function toTimeDate(value: string | null | undefined) {
  if (!value) return undefined;
  return new Date(`1970-01-01T${value}:00.000Z`);
}

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      fullName: true,
      email: true,
      gender: true,
      reputationScore: true,
      profile: true,
      lifestyleProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Không tìm thấy người dùng" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
}

export async function PUT(request: Request, { params }: Params) {
  const { userId } = await params;
  const body = await request.json();
  const id = Number(userId);

  const [userProfile, lifestyleProfile] = await prisma.$transaction([
    prisma.userProfile.upsert({
      where: { userId: id },
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
        userId: id,
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
      where: { userId: id },
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
        userId: id,
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
}
