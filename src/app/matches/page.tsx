"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import { getMatches, type MatchItem } from "@/lib/api/matchApi";
import { getStoredUserId } from "@/lib/auth/storage";

// Distinguish between "no userId", "no profile", "API error", and "no matches"
type PageState =
  | { kind: "loading" }
  | { kind: "no-auth" }
  | { kind: "no-profile" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "results"; matches: MatchItem[] };

function getMatchesData(result: unknown): MatchItem[] {
  if (Array.isArray(result)) return result as MatchItem[];
  if (!result || typeof result !== "object") return [];

  const record = result as Record<string, unknown>;
  const data = record.data || record.matches || record.results;

  if (Array.isArray(data)) return data as MatchItem[];

  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as MatchItem[];
    if (Array.isArray(nested.matches)) return nested.matches as MatchItem[];
    if (Array.isArray(nested.results)) return nested.results as MatchItem[];
  }

  return [];
}

function sortMatches(matches: MatchItem[]) {
  return [...matches].sort((a, b) => {
    const left = Number.isFinite(a.matchScore) ? a.matchScore : 0;
    const right = Number.isFinite(b.matchScore) ? b.matchScore : 0;
    return right - left;
  });
}

function isProfileNotFoundError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("profile") ||
    msg.includes("hồ sơ")
  );
}

export default function MatchesPage() {
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    async function fetchMatches() {
      const currentUserId = getStoredUserId();

      if (!currentUserId) {
        setState({ kind: "no-auth" });
        return;
      }

      try {
        const result = await getMatches(currentUserId);
        const matches = sortMatches(getMatchesData(result));

        if (matches.length === 0) {
          setState({ kind: "empty" });
        } else {
          setState({ kind: "results", matches });
        }
      } catch (err) {
        if (isProfileNotFoundError(err)) {
          setState({ kind: "no-profile" });
        } else {
          setState({
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Không thể tải danh sách người phù hợp.",
          });
        }
      }
    }

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/profile"
            className="text-sm font-semibold tracking-normal text-cyan-600 transition-colors hover:text-cyan-700"
          >
            ← Hồ sơ
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
            Kết quả matching
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            Danh sách người ở ghép phù hợp dựa trên ngân sách, khu vực và
            thói quen sinh hoạt của bạn.
          </p>
        </div>

        {/* Loading state */}
        {state.kind === "loading" && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-cyan-500" />
            <p className="text-sm font-semibold text-slate-800">
              Đang tải kết quả...
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        )}

        {/* Not logged in */}
        {state.kind === "no-auth" && (
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
              Bạn cần đăng nhập để xem kết quả matching
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Đăng nhập để hệ thống tìm người ở ghép phù hợp với hồ sơ của bạn.
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

        {/* No profile exists */}
        {state.kind === "no-profile" && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50">
              <svg
                className="h-7 w-7 text-sky-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Bạn chưa có hồ sơ ở ghép
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Tạo hồ sơ để hệ thống phân tích ngân sách, khu vực và thói quen
              sinh hoạt của bạn.
            </p>
            <div className="mt-6">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold tracking-normal text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-sky-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
              >
                Tạo hồ sơ
              </Link>
            </div>
          </div>
        )}

        {/* API error */}
        {state.kind === "error" && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-red-50">
              <svg
                className="h-7 w-7 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Không thể tải kết quả
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {state.message}
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-normal text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* No matches found (but profile exists) */}
        {state.kind === "empty" && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50">
              <svg
                className="h-7 w-7 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Chưa tìm thấy người ở ghép phù hợp
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Bạn có thể cập nhật hồ sơ hoặc quay lại sau khi có thêm người
              dùng phù hợp.
            </p>
            <div className="mt-6">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold tracking-normal text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-sky-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
              >
                Cập nhật hồ sơ
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {state.kind === "results" && (
          <>
            {/* Summary bar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-100">
                {state.matches.length} kết quả phù hợp
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-700 ring-1 ring-cyan-100/60">
                Sắp xếp theo điểm phù hợp
              </div>
            </div>

            {/* Match cards */}
            <div className="space-y-4">
              {state.matches.map((match, idx) => (
                <MatchCard key={match.user.id} match={match} index={idx} />
              ))}
            </div>

            {/* Bottom action */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-normal text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
              >
                Cập nhật hồ sơ
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
