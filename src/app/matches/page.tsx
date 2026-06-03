"use client";

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import { getMatches, type MatchItem } from "@/lib/api/matchApi";
import { getStoredUserId } from "@/lib/auth/storage";

type MatchesState = {
  userId: number | null;
  matches: MatchItem[];
  isLoading: boolean;
  error: string;
};

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

export default function MatchesPage() {
  const [state, setState] = useState<MatchesState>({
    userId: null,
    matches: [],
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    async function fetchMatches() {
      const currentUserId = getStoredUserId();

      if (!currentUserId) {
        setState({
          userId: null,
          matches: [],
          isLoading: false,
          error:
            "Chưa tìm thấy mã người dùng. Vui lòng đăng nhập hoặc tạo hồ sơ trước.",
        });
        return;
      }

      try {
        const result = await getMatches(currentUserId);

        setState({
          userId: currentUserId,
          matches: sortMatches(getMatchesData(result)),
          isLoading: false,
          error: "",
        });
      } catch (err) {
        setState({
          userId: currentUserId,
          matches: [],
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách người phù hợp.",
        });
      }
    }

    fetchMatches();
  }, []);

  const { userId, matches, isLoading, error } = state;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Ghép bạn ở cùng
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Kết quả matching
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Danh sách người ở ghép phù hợp được tính dựa trên ngân sách, khu
            vực, giới tính, thú cưng, hút thuốc và thói quen sinh hoạt.
          </p>
        </div>

        {userId && (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Đang xem kết quả cho userId:{" "}
            <span className="font-semibold">{userId}</span>
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-gray-900">
              Đang tải danh sách người phù hợp...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="font-semibold">Không thể tải kết quả</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && matches.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Chưa tìm thấy người ở ghép phù hợp
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Hãy kiểm tra lại hồ sơ hoặc thử thay đổi ngân sách, khu vực và
              thói quen sinh hoạt.
            </p>
          </div>
        )}

        {!isLoading && !error && matches.length > 0 && (
          <div className="grid gap-5">
            {matches.map((match) => (
              <MatchCard key={match.user.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
