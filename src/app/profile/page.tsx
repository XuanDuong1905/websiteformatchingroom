"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { getStoredUserId } from "@/lib/auth/storage";

export default function ProfilePage() {
  const [hasUserId, setHasUserId] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasUserId(Boolean(getStoredUserId()));
      setIsCheckingAuth(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-normal text-cyan-600 transition-colors hover:text-cyan-700"
          >
            ← Trang chủ
          </Link>
          <span className="text-xs font-medium tracking-normal text-slate-400">
            Ghép Trọ - Ghép Bạn
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Page header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-xl font-bold tracking-normal text-slate-900 sm:text-2xl">
            Hồ sơ ở ghép
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Cung cấp thông tin về ngân sách, khu vực mong muốn và thói quen
            sinh hoạt để hệ thống tìm người ở ghép phù hợp.
          </p>
        </div>

        {isCheckingAuth && (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
            Đang kiểm tra phiên đăng nhập...
          </div>
        )}

        {/* Not logged in */}
        {!isCheckingAuth && !hasUserId && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50">
              <svg
                className="h-7 w-7 text-cyan-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Bạn cần đăng nhập để tạo hồ sơ
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Đăng nhập để hệ thống lưu hồ sơ ở ghép và gợi ý người phù hợp cho bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold tracking-normal text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-sky-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        )}

        {/* Logged in — show the form */}
        {!isCheckingAuth && hasUserId && <ProfileForm />}
      </main>
    </div>
  );
}
