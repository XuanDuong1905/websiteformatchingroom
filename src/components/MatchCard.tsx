"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchItem } from "@/lib/api/matchApi";
import { createConversation } from "@/lib/api/chatApi";
import { getStoredUserId } from "@/lib/auth/storage";
import ScoreBar, { ScoreBadge } from "@/components/ScoreBar";
import { MessageCircle } from "lucide-react";

type MatchCardProps = {
  match: MatchItem;
  index?: number;
  onClick?: () => void;
};

const avatarGradients = [
  "from-cyan-400 to-sky-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
];

export default function MatchCard({ match, index = 0, onClick }: MatchCardProps) {
  const { user, matchScore, scores, reasons } = match;
  const safeMatchScore = Number.isFinite(matchScore) ? matchScore : 0;
  // matchScore từ API luôn là số nguyên 0-100 (calculateMatch đã nhân 100 rồi)
  // Không cần đoán format, round trực tiếp để tránh edge case score=1 hiển thị thành 100%
  const displayScore = Math.round(safeMatchScore);
  const safeReasons = Array.isArray(reasons) ? reasons : [];

  const router = useRouter();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const fullName = user.fullName || "Người dùng chưa cập nhật tên";
  const initials = fullName
    .split(" ")
    .slice(-1)[0]
    .charAt(0)
    .toUpperCase();

  const gradient = avatarGradients[index % avatarGradients.length];

  const genderLabel =
    user.gender === "male"
      ? "Nam"
      : user.gender === "female"
        ? "Nữ"
        : user.gender || "Chưa cập nhật";

  return (
    <article
      className="group rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100/80 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:ring-slate-200/80 sm:p-6 cursor-pointer select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={`Xem hồ sơ ${fullName}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left side – avatar + info */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-sm`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-normal text-slate-900">
              {fullName}
            </h3>
            <p className="mt-0.5 text-xs tracking-normal text-slate-500">
              {genderLabel} · {user.school || "Chưa cập nhật"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Uy tín</span>
              <span className="text-xs font-semibold tabular-nums text-slate-700">
                {user.reputationScore ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Right side – score + badge */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-slate-400">Tổng điểm</div>
            <div className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {displayScore}
            </div>
          </div>
          <ScoreBadge score={safeMatchScore} />
        </div>
      </div>

      {/* Score bars */}
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
        <ScoreBar label="Giờ giấc" value={scores?.sleepScore} />
        <ScoreBar label="Dọn dẹp" value={scores?.cleaningScore} />
        <ScoreBar label="Riêng tư" value={scores?.privacyScore} />
        <ScoreBar label="Tiếng ồn" value={scores?.noiseScore} />
        <ScoreBar label="Có khách" value={scores?.guestScore} />
        <ScoreBar label="Nấu ăn" value={scores?.cookingScore} />
      </div>

      {/* Reasons */}
      {safeReasons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-50 pt-4 mb-4">
          {safeReasons.map((reason, i) => (
            <span
              key={`${reason}-${i}`}
              className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium tracking-normal text-slate-600 ring-1 ring-slate-100/80"
            >
              {reason}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 border-t border-slate-50 pt-4 mb-4">
          <p className="text-xs text-slate-400">
            Chưa có lý do chi tiết từ hệ thống matching.
          </p>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={async () => {
          const currentUserId = getStoredUserId();
          if (!currentUserId) {
            alert("Bạn cần đăng nhập để nhắn tin!");
            router.push("/login");
            return;
          }
          if (currentUserId === user.id) {
            alert("Bạn không thể chat với chính mình.");
            return;
          }

          setIsStartingChat(true);
          try {
            const res = await createConversation(user.id); // no roomId
            if (res.success && res.data?.id) {
              router.push(`/messages/${res.data.id}`);
            }
          } catch {
            alert("Không thể tạo cuộc trò chuyện");
          } finally {
            setIsStartingChat(false);
          }
        }}
        disabled={isStartingChat}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 bg-cyan-50 text-cyan-700 rounded-xl font-medium hover:bg-cyan-100 transition disabled:opacity-50 text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        {isStartingChat ? "Đang kết nối..." : "Nhắn tin"}
      </button>
    </article>
  );
}
