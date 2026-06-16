// TODO: Next.js 16 deprecated the middleware.ts convention in favor of proxy.ts.
// Middleware still works but emits a console warning. Plan migration to proxy.ts
// when the auth rules are stable. See: https://nextjs.org/docs/app/api-reference/config/proxy
import { NextRequest, NextResponse } from "next/server";

import { verifyToken, type JwtPayload, type JwtRole } from "@/lib/jwt";

type Role = JwtRole;
type AuthRule = {
  roles: Role[];
  matches: (pathname: string, method: string) => boolean;
};

const TOKEN_COOKIE_NAME = "token";
const APPROVED_STATUS = "APPROVED";
const AUTH_ROLES = new Set<Role>(["ADMIN", "STUDENT", "LANDLORD"]);

const authRules: AuthRule[] = [
  {
    roles: ["ADMIN"],
    matches: (pathname) =>
      hasPathPrefix(pathname, "/admin") || hasPathPrefix(pathname, "/api/admin"),
  },
  {
    roles: ["LANDLORD"],
    matches: (pathname) =>
      hasPathPrefix(pathname, "/landlord") ||
      hasPathPrefix(pathname, "/api/landlord") ||
      pathname === "/api/upload/room-images",
  },
  {
    roles: ["LANDLORD"],
    matches: (pathname, method) =>
      pathname === "/api/rooms" && method === "POST",
  },
  {
    roles: ["LANDLORD"],
    matches: (pathname, method) =>
      isRoomDetailApi(pathname) && ["PATCH", "DELETE"].includes(method),
  },
  {
    roles: ["STUDENT"],
    matches: (pathname) =>
      hasPathPrefix(pathname, "/student") ||
      hasPathPrefix(pathname, "/profile") ||
      hasPathPrefix(pathname, "/matches") ||
      hasPathPrefix(pathname, "/api/matches") ||
      hasPathPrefix(pathname, "/api/profiles"),
  },
  {
    roles: ["STUDENT"],
    matches: (pathname, method) =>
      isStudentRoomActionApi(pathname) && method === "POST",
  },
];

function hasPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isRoomDetailApi(pathname: string) {
  return /^\/api\/rooms\/[^/]+$/.test(pathname);
}

function isStudentRoomActionApi(pathname: string) {
  return /^\/api\/rooms\/[^/]+\/(reports|reviews)$/.test(pathname);
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

function findAuthRule(pathname: string, method: string) {
  return authRules.find((rule) => rule.matches(pathname, method));
}

function isValidRole(role: unknown): role is Role {
  return typeof role === "string" && AUTH_ROLES.has(role as Role);
}

function canAccess(role: Role, allowedRoles: Role[]) {
  return role === "ADMIN" || allowedRoles.includes(role);
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

function apiError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${url.pathname}${url.search}`);

  return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

function unauthorizedResponse(request: NextRequest, message = "Chua dang nhap") {
  if (isApiRoute(request.nextUrl.pathname)) {
    return apiError(message, 401);
  }

  return redirectToLogin(request);
}

function forbiddenResponse(request: NextRequest, message = "Khong co quyen truy cap") {
  if (isApiRoute(request.nextUrl.pathname)) {
    return apiError(message, 403);
  }

  return redirectToHome(request);
}

function isApprovedPayload(payload: JwtPayload) {
  return payload.status === APPROVED_STATUS && isValidRole(payload.role);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const authRule = findAuthRule(pathname, method);

  if (!authRule) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse(request);
  }

  try {
    const payload = await verifyToken(token);

    if (!isApprovedPayload(payload)) {
      return clearAuthCookie(
        forbiddenResponse(request, "Tai khoan chua duoc phe duyet"),
      );
    }

    if (!canAccess(payload.role, authRule.roles)) {
      return forbiddenResponse(request);
    }

    return NextResponse.next();
  } catch {
    return clearAuthCookie(
      unauthorizedResponse(request, "Phien dang nhap khong hop le"),
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
