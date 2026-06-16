import { UserRole, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const TOKEN_COOKIE_NAME = "token";

export type AuthenticatedUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;

  return header.slice("bearer ".length).trim();
}

export async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value ?? getBearerToken(request);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  return prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  });
}

export async function requireApprovedLandlord(request: NextRequest): Promise<
  | {
      user: AuthenticatedUser;
      response?: never;
    }
  | {
      user?: never;
      response: NextResponse;
    }
> {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return {
        response: jsonError("Vui lòng đăng nhập", 401),
      };
    }

    if (user.role !== UserRole.LANDLORD) {
      return {
        response: jsonError("Chỉ chủ trọ mới có quyền quản lý phòng", 403),
      };
    }

    if (user.status === UserStatus.PENDING) {
      return {
        response: jsonError("Tài khoản chủ trọ đang chờ quản trị viên xét duyệt.", 403),
      };
    }

    if (user.status === UserStatus.REJECTED) {
      return {
        response: jsonError("Tài khoản chủ trọ đã bị từ chối.", 403),
      };
    }

    if (user.status !== UserStatus.APPROVED) {
      return {
        response: jsonError("Tài khoản chủ trọ chưa được phê duyệt", 403),
      };
    }

    return { user };
  } catch {
    return {
      response: jsonError("Phiên đăng nhập không hợp lệ", 401),
    };
  }
}
