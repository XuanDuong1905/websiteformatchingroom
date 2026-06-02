"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isLoggedIn, setIsLoggedIn] = useState(hasStoredAuth);

  useEffect(() => {
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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    router.push("/login");
  }

  const navItems = isLoggedIn ? userNavItems : guestNavItems;

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold text-blue-600">
          Ghép Trọ - Ghép Bạn
        </Link>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-700"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
