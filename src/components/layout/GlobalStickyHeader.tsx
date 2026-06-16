"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, LogOut, MessageCircle, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/api/authApi";

type AuthUser = {
  id?: number | string;
  fullName?: string;
  email?: string;
  role?: string;
};

type HeaderProps = {
  hideOnScroll?: boolean;
  scrollThreshold?: number;
};

function readStoredUser() {
  if (typeof window === "undefined") return null;

  const rawUser = window.localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as AuthUser;
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
}

function extractUser(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (record.user && typeof record.user === "object") {
    return record.user as AuthUser;
  }

  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    if (data.user && typeof data.user === "object") {
      return data.user as AuthUser;
    }
  }

  return null;
}

function persistUser(user: AuthUser) {
  window.localStorage.setItem("user", JSON.stringify(user));

  if (user.id) {
    window.localStorage.setItem("userId", String(user.id));
  }
}

function clearStoredAuth() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("userId");
}

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Cannot load current user");

  const data = await response.json().catch(() => null);
  return extractUser(data);
}

export default function GlobalStickyHeader({}: HeaderProps = {}) {
  const [keyword, setKeyword] = useState("");
  // Initialize to null to match server render and avoid hydration mismatch.
  // The useEffect below will populate auth state from /api/auth/me or localStorage after mount.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    function syncStoredAuth() {
      if (isMounted) {
        setCurrentUser(readStoredUser());
      }
    }

    window.addEventListener("storage", syncStoredAuth);
    window.addEventListener("auth-change", syncStoredAuth);

    void fetchCurrentUser()
      .then((user) => {
        if (!isMounted) return;

        if (user) {
          persistUser(user);
          setCurrentUser(user);
          return;
        }

        clearStoredAuth();
        setCurrentUser(null);
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(readStoredUser());
        }
      });

    return () => {
      isMounted = false;
      window.removeEventListener("storage", syncStoredAuth);
      window.removeEventListener("auth-change", syncStoredAuth);
    };
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const value = keyword.trim();
    if (value) {
      router.push(`/?search=${encodeURIComponent(value)}`);
    }
  };

  const handleComingSoon = (event: React.MouseEvent) => {
    event.preventDefault();
    alert("Tính năng đang phát triển.");
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout().catch(() => null);
      clearStoredAuth();
      setCurrentUser(null);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = currentUser?.fullName || currentUser?.email || "Tài khoản";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-100 bg-white shadow-sm">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="min-w-0 text-left text-xl font-extrabold tracking-tight text-cyan-600 transition hover:opacity-80 sm:text-2xl"
        >
          Ghép Trọ - Ghép Bạn
        </button>

        <div className="hidden max-w-2xl flex-1 md:flex">
          <form onSubmit={handleSearchSubmit} className="group relative w-full">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kiếm phòng trọ, khu vực, người ở ghép..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-5 pr-12 text-gray-800 placeholder-gray-400 transition-all focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 rounded-full bg-cyan-600 p-1.5 text-white transition hover:bg-cyan-700"
              aria-label="Tìm kiếm"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 text-gray-500 lg:flex">
            <button
              type="button"
              onClick={handleComingSoon}
              className="relative transition hover:text-red-500"
              aria-label="Yêu thích"
            >
              <Heart size={22} />
            </button>
            <button
              type="button"
              onClick={handleComingSoon}
              className="relative transition hover:text-cyan-600"
              aria-label="Thông báo"
            >
              <Bell size={22} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                2
              </span>
            </button>
            <button
              type="button"
              onClick={handleComingSoon}
              className="transition hover:text-cyan-600"
              aria-label="Tin nhắn"
            >
              <MessageCircle size={22} />
            </button>
          </div>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-cyan-50 hover:text-cyan-700 md:inline-flex"
              >
                Hồ sơ
              </button>
              <button
                type="button"
                onClick={() => router.push("/matches")}
                className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-cyan-50 hover:text-cyan-700 md:inline-flex"
              >
                Matching
              </button>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex min-w-0 items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 py-1.5 pl-2 pr-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300"
                title={displayName}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-cyan-700">
                  <User size={17} />
                </span>
                <span className="hidden max-w-32 truncate sm:inline">
                  {displayName}
                </span>
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">
                  {isLoggingOut ? "Đang thoát..." : "Đăng xuất"}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="hidden items-center rounded-xl border border-cyan-600 px-4 py-2 font-medium text-cyan-600 transition-all hover:bg-cyan-50 active:scale-95 sm:flex"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="hidden items-center rounded-xl bg-cyan-600 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow active:scale-95 sm:flex"
              >
                Đăng ký
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 transition hover:border-cyan-400 sm:hidden"
                aria-label="Đăng nhập"
              >
                <User size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
