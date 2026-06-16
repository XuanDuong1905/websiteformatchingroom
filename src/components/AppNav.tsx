"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/api/authApi";

const guestNavItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/login", label: "Đăng nhập" },
  { href: "/register", label: "Đăng ký" },
];

const userNavItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/profile/me", label: "Thông tin cá nhân" },
];

const matchingNavItems = [
  ...userNavItems,
  { href: "/profile", label: "Hồ sơ ở ghép" },
  { href: "/matches", label: "Kết quả matching" },
];

const landlordNavItems = [
  ...userNavItems,
  { href: "/landlord/rooms/new", label: "Đăng phòng" },
  { href: "/rooms", label: "Danh sách phòng" },
];

const adminNavItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/admin", label: "Quản lý hệ thống" },
  { href: "/admin/landlords", label: "Duyệt chủ trọ" },
  { href: "/profile/me", label: "Thông tin cá nhân" },
];

function getStoredRole() {
  if (typeof window === "undefined") return null;
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as { role?: unknown };
    return typeof user.role === "string" ? user.role : null;
  } catch {
    return null;
  }
}

function canUseMatching() {
  return true; // Temporary bypass for demo purposes
}

function hasStoredAuth() {
  if (typeof window === "undefined") return false;

  return Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userId"),
  );
}

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
}

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    function handleStorageChange() {
      setIsLoggedIn(hasStoredAuth());
      setUserRole(getStoredRole());
    }

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout().catch(() => null);
      clearStoredAuth();
      setIsLoggedIn(false);
      setUserRole(null);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navItems = isLoggedIn
    ? userRole === "ADMIN"
      ? adminNavItems
      : userRole === "LANDLORD"
      ? landlordNavItems
      : canUseMatching()
      ? matchingNavItems
      : userNavItems
    : guestNavItems;

  if (pathname === "/" || pathname.startsWith("/room/") || pathname.startsWith("/messages")) {
    return null;
  }

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-slate-900 transition hover:text-cyan-700"
        >
          Ghép Trọ - Ghép Bạn
        </Link>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              {item.label}
            </Link>
          ))}

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
