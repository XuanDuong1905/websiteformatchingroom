import { Prisma, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { personalProfileSchema } from "@/lib/validations/personalProfile";

export const runtime = "nodejs";

function errorResponse(message: string, status: number, errors?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

function toDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function toNullableDate(value?: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function findProfile(userId: number) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      gender: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          schoolName: true,
          dateOfBirth: true,
          occupation: true,
          currentAddress: true,
          preferredDistrict: true,
          bio: true,
        },
      },
      studentProfile: {
        select: {
          university: true,
        },
      },
      landlordProfile: {
        select: {
          businessName: true,
          businessLicenseImage: true,
          identityNumber: true,
          verifiedAt: true,
        },
      },
    },
  });
}

function serializeProfile(user: NonNullable<Awaited<ReturnType<typeof findProfile>>>) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    gender: user.gender,
    dateOfBirth: toDateInput(user.profile?.dateOfBirth),
    avatarUrl: user.avatarUrl ?? "",
    role: user.role,
    status: user.status,
    school: user.profile?.schoolName ?? user.studentProfile?.university ?? "",
    occupation: user.profile?.occupation ?? "",
    address: user.profile?.currentAddress ?? "",
    district: user.profile?.preferredDistrict ?? "",
    bio: user.profile?.bio ?? "",
    landlord: user.landlordProfile
      ? {
          businessName: user.landlordProfile.businessName,
          businessLicenseImage: user.landlordProfile.businessLicenseImage,
          identityNumber: user.landlordProfile.identityNumber ?? "",
          verificationStatus: user.status,
          verifiedAt: user.landlordProfile.verifiedAt,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return errorResponse("Vui lòng đăng nhập", 401);
    }

    const user = await findProfile(authUser.id);

    if (!user) {
      return errorResponse("Tài khoản không tồn tại", 404);
    }

    return NextResponse.json({
      success: true,
      data: serializeProfile(user),
    });
  } catch (error) {
    console.error("GET /api/profile/me failed:", error);
    return errorResponse("Không thể tải thông tin cá nhân", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return errorResponse("Vui lòng đăng nhập", 401);
    }

    const body = await request.json().catch(() => null);
    const parsed = personalProfileSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        "Thông tin cá nhân không hợp lệ",
        400,
        parsed.error.flatten(),
      );
    }

    const input = parsed.data;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: {
          id: authUser.id,
        },
        data: {
          fullName: input.fullName,
          phone: input.phone ?? null,
          gender: input.gender,
          avatarUrl: input.avatarUrl ?? null,
        },
      });

      await tx.userProfile.upsert({
        where: {
          userId: authUser.id,
        },
        update: {
          schoolName: input.school ?? null,
          dateOfBirth: toNullableDate(input.dateOfBirth),
          occupation: input.occupation ?? null,
          currentAddress: input.address ?? null,
          preferredDistrict: input.district ?? null,
          bio: input.bio ?? null,
        },
        create: {
          userId: authUser.id,
          schoolName: input.school ?? null,
          dateOfBirth: toNullableDate(input.dateOfBirth),
          occupation: input.occupation ?? null,
          currentAddress: input.address ?? null,
          preferredDistrict: input.district ?? null,
          bio: input.bio ?? null,
        },
      });

      if (authUser.role === UserRole.STUDENT && input.school) {
        await tx.studentProfile.updateMany({
          where: {
            userId: authUser.id,
          },
          data: {
            university: input.school,
          },
        });
      }

      if (authUser.role === UserRole.LANDLORD) {
        const existingLandlordProfile = await tx.landlordProfile.findUnique({
          where: {
            userId: authUser.id,
          },
        });

        if (existingLandlordProfile) {
          await tx.landlordProfile.update({
            where: {
              userId: authUser.id,
            },
            data: {
              businessName: input.businessName ?? existingLandlordProfile.businessName,
              identityNumber: input.identityNumber ?? null,
            },
          });
        } else if (input.businessName || input.identityNumber) {
          await tx.landlordProfile.create({
            data: {
              userId: authUser.id,
              businessName: input.businessName ?? authUser.fullName,
              businessLicenseImage: "",
              identityNumber: input.identityNumber ?? null,
            },
          });
        }
      }
    });

    const user = await findProfile(authUser.id);

    if (!user) {
      return errorResponse("Tài khoản không tồn tại", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
      data: serializeProfile(user),
    });
  } catch (error) {
    console.error("PUT /api/profile/me failed:", error);
    return errorResponse("Không thể cập nhật thông tin cá nhân", 500);
  }
}
