"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MatchCard from "@/components/MatchCard";
import MatchProfileModal from "@/components/MatchProfileModal";
import { getMatches, type MatchItem } from "@/lib/api/matchApi";
import { saveStoredUser } from "@/lib/auth/storage";

type CurrentUser = {
  id?: number | string;
  role?: string | null;
  status?: string | null;
};

type PageState =
  | { kind: "loading" }
  | { kind: "no-auth" }
  | { kind: "no-access"; role?: string | null }
  | { kind: "no-profile" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "results"; matches: MatchItem[] };

function extractUser(payload: unknown): CurrentUser | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (record.user && typeof record.user === "object") {
    return record.user as CurrentUser;
  }

  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    if (data.user && typeof data.user === "object") {
      return data.user as CurrentUser;
    }
  }

  return null;
}

async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : "Không thể kiểm tra phiên đăng nhập.";
    throw new Error(message);
  }

  return extractUser(data);
}

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

function isMatchingRole(role?: string | null) {
  return role === "STUDENT" || role === "ADMIN";
}

function isProfileNotFoundError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("404") ||
    message.includes("profile") ||
    message.includes("hồ sơ") ||
    message.includes("chưa có")
  );
}

function StateCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-10">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export default function MatchesPage() {
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMatches() {
      try {
        const user = await getCurrentUser();
        const userId = Number(user?.id);

        if (!user || !Number.isFinite(userId) || userId <= 0) {
          if (isMounted) setState({ kind: "no-auth" });
          return;
        }

        saveStoredUser(user);

        if (!isMatchingRole(user.role)) {
          if (isMounted) {
            setState({ kind: "no-access", role: user.role });
          }
          return;
        }

        const result = await getMatches(userId);
        const matches = sortMatches(getMatchesData(result));

        if (!isMounted) return;
        setState(matches.length > 0 ? { kind: "results", matches } : { kind: "empty" });
      } catch (error) {
        if (!isMounted) return;

        if (isProfileNotFoundError(error)) {
          setState({ kind: "no-profile" });
          return;
        }

        setState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách người phù hợp.",
        });
      }
    }

    void fetchMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/40">
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/profile"
            className="text-sm font-semibold tracking-normal text-cyan-600 transition-colors hover:text-cyan-700"
          >
            ← Hồ sơ ở ghép
          </Link>
          <span className="text-xs font-medium tracking-normal text-slate-400">
            Ghép Trọ - Ghép Bạn
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-xl font-bold tracking-normal text-slate-900 sm:text-2xl">
            Kết quả matching
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            Danh sách người ở ghép phù hợp dựa trên ngân sách, khu vực và thói
            quen sinh hoạt của bạn.
          </p>
        </div>

        {state.kind === "loading" && (
          <StateCard
            title="Đang tải kết quả..."
            description="Vui lòng chờ trong giây lát."
          />
        )}

        {state.kind === "no-auth" && (
          <StateCard
            title="Bạn cần đăng nhập để xem kết quả matching"
            description="Đăng nhập để hệ thống tìm người ở ghép phù hợp với hồ sơ của bạn."
          >
            <Link
              href="/login?next=/matches"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-700"
            >
              Đăng nhập
            </Link>
          </StateCard>
        )}

        {state.kind === "no-access" && (
          <StateCard
            title="Matching dành cho tài khoản sinh viên"
            description="Tài khoản hiện tại không dùng được hồ sơ ở ghép. Bạn có thể xem danh sách phòng hoặc cập nhật thông tin cá nhân."
          >
            <Link
              href="/rooms"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-700"
            >
              Xem phòng trọ
            </Link>
            <Link
              href="/profile/me"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Thông tin cá nhân
            </Link>
          </StateCard>
        )}

        {state.kind === "no-profile" && (
          <StateCard
            title="Bạn chưa có hồ sơ ở ghép"
            description="Tạo hồ sơ để hệ thống phân tích ngân sách, khu vực và thói quen sinh hoạt của bạn."
          >
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-700"
            >
              Tạo hồ sơ
            </Link>
          </StateCard>
        )}

        {state.kind === "error" && (
          <StateCard title="Không thể tải kết quả" description={state.message}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Thử lại
            </button>
          </StateCard>
        )}

        {state.kind === "empty" && (
          <StateCard
            title="Chưa tìm thấy người ở ghép phù hợp"
            description="Bạn có thể cập nhật hồ sơ hoặc quay lại sau khi có thêm người dùng phù hợp."
          >
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-700"
            >
              Cập nhật hồ sơ
            </Link>
          </StateCard>
        )}

        {state.kind === "results" && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-100">
                {state.matches.length} kết quả phù hợp
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-700 ring-1 ring-cyan-100/60">
                Sắp xếp theo điểm phù hợp
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-100/60">
                Nhấp vào thẻ để xem hồ sơ đầy đủ
              </div>
            </div>

            <div className="space-y-4">
              {state.matches.map((match, index) => (
                <MatchCard
                  key={match.user.id}
                  match={match}
                  index={index}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>

            {/* Modal hồ sơ chi tiết */}
            {selectedMatch && (
              <MatchProfileModal
                match={selectedMatch}
                index={state.matches.indexOf(selectedMatch)}
                onClose={() => setSelectedMatch(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
