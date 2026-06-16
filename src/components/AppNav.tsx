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
  { href: "/profile", label: "Hồ sơ ở ghép" },
  { href: "/matches", label: "Kết quả matching" },
];

function hasStoredAuth() {
  if (typeof window === "undefined") return false;

  return Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userId"),
  );
}

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Read auth state from localStorage only after mount to avoid hydration mismatch.
    setIsLoggedIn(hasStoredAuth());

    function handleStorageChange() {
      setIsLoggedIn(hasStoredAuth());
    }

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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navItems = isLoggedIn ? userNavItems : guestNavItems;

  if (pathname === "/" || pathname.startsWith("/room/")) {
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
