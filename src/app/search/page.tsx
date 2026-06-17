"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RoomCard, { RoomSummary } from "@/components/home/RoomCard";
import MatchCard from "@/components/MatchCard";
import { MatchItem } from "@/lib/api/matchApi";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"rooms" | "profiles">("rooms");
  const [isLoading, setIsLoading] = useState(!!query);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [profiles, setProfiles] = useState<MatchItem[]>([]);
   
  const [parsedQuery, setParsedQuery] = useState<any>(null);

  useEffect(() => {
    async function fetchSearch() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          // Map profiles to match MatchCard structure (which expects MatchItem)
          // The search API returns User, we need to map it nicely
          // MatchCard expects: user: {id, fullName, gender, school, reputationScore}, matchScore, scores, reasons
           
          const mappedProfiles = json.data.profiles.map((p: any) => ({
            user: {
              id: p.id,
              fullName: p.fullName,
              gender: p.gender,
              school: p.profile?.schoolName || "Không rõ",
              reputationScore: p.reputationScore,
            },
            matchScore: 0, // Placeholder
            scores: {
              sleepScore: 0,
              cleaningScore: 0,
              privacyScore: 0,
              noiseScore: 0,
              guestScore: 0,
              cookingScore: 0,
            },
            reasons: ["Gợi ý từ tìm kiếm thông minh"],
          }));

          setRooms(json.data.rooms);
          setProfiles(mappedProfiles);
          setParsedQuery(json.data.parsedQuery);

          if (json.data.rooms.length === 0 && mappedProfiles.length > 0) {
            setActiveTab("profiles");
          } else {
            setActiveTab("rooms");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (query) {
      fetchSearch();
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Kết quả tìm kiếm cho: <span className="text-cyan-600">&quot;{query}&quot;</span>
          </h1>
          {parsedQuery && (
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              <span>Đã phân tích:</span>
              {parsedQuery.district && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">Khu vực: {parsedQuery.district}</span>
              )}
              {parsedQuery.maxPrice && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">Giá tối đa: {parsedQuery.maxPrice.toLocaleString('vi-VN')} đ</span>
              )}
              {parsedQuery.gender && parsedQuery.gender !== "any" && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">Giới tính: {parsedQuery.gender === "male" ? "Nam" : "Nữ"}</span>
              )}
              {parsedQuery.amenities?.length > 0 && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">Tiện ích: {parsedQuery.amenities.join(", ")}</span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "rooms"
                ? "border-cyan-600 text-cyan-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Phòng trọ ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab("profiles")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "profiles"
                ? "border-cyan-600 text-cyan-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Người ở ghép ({profiles.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {activeTab === "rooms" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <RoomCard key={room.id} room={room} viewMode="grid" />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    Không tìm thấy phòng trọ nào phù hợp với yêu cầu.
                  </div>
                )}
              </div>
            )}

            {activeTab === "profiles" && (
              <div className="space-y-4 max-w-3xl">
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => (
                    <MatchCard key={profile.user.id} match={profile} index={index} />
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    Không tìm thấy người ở ghép nào phù hợp.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
