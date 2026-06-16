"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { MatchItem } from "@/lib/api/matchApi";
import ScoreBar, { ScoreBadge } from "@/components/ScoreBar";

type Message = {
  id: string;
  text: string;
  sentAt: Date;
  isMe: boolean;
};

type MatchProfileModalProps = {
  match: MatchItem;
  index?: number;
  onClose: () => void;
};

const avatarGradients = [
  "from-cyan-400 to-sky-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
];

export default function MatchProfileModal({ match, index = 0, onClose }: MatchProfileModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, matchScore, scores, reasons } = match;
  const safeMatchScore = Number.isFinite(matchScore) ? matchScore : 0;
  const displayScore = Math.round(safeMatchScore);
  const safeReasons = Array.isArray(reasons) ? reasons : [];

  const fullName = user.fullName || "Người dùng chưa cập nhật tên";
  const firstName = fullName.split(" ").slice(-1)[0];
  const initials = firstName.charAt(0).toUpperCase();
  const gradient = avatarGradients[index % avatarGradients.length];

  const genderLabel =
    user.gender === "male" ? "Nam" :
    user.gender === "female" ? "Nữ" :
    "Chưa cập nhật";

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  // Khoá scroll body khi modal mở
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Auto-scroll tin nhắn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || isSending) return;
    const text = messageText.trim();
    setMessageText("");
    setIsSending(true);

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text,
      sentAt: new Date(),
      isMe: true,
    }]);

    // Giả lập phản hồi hệ thống (tính năng chat thời gian thực sẽ tích hợp sau)
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Tin nhắn của bạn đã được gửi đến ${firstName}. Khi họ trả lời, bạn sẽ nhận được thông báo.`,
        sentAt: new Date(),
        isMe: false,
      }]);
      setIsSending(false);
      inputRef.current?.focus();
    }, 1200);
  };

  const handleConfirm = async () => {
    setConfirmed(true);
    // TODO: PATCH /api/matches để cập nhật status → "accepted"
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Hồ sơ của ${fullName}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full sm:max-w-lg max-h-[94vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* ── HEADER gradient ── */}
        <div className={`relative shrink-0 bg-gradient-to-br ${gradient} px-6 pt-6 pb-5 text-white`}>
          {/* Nút đóng */}
          <button
            id="modal-close-btn"
            onClick={handleClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition text-white font-bold text-xl leading-none"
          >
            ×
          </button>

          {/* Avatar + tên */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/25 flex items-center justify-center text-2xl font-extrabold shadow-lg select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight truncate">{fullName}</h2>
              <p className="text-sm text-white/80 mt-0.5 truncate">
                {genderLabel} · {user.school || "Chưa cập nhật trường"}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs text-white/70">Uy tín</span>
                <span className="text-xs font-bold tabular-nums">
                  {Number(user.reputationScore ?? 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Điểm tổng + badge */}
          <div className="mt-4 flex items-stretch gap-3">
            <div className="flex-1 rounded-2xl bg-white/15 border border-white/20 px-4 py-2.5 text-center">
              <p className="text-xs text-white/70 mb-0.5">Độ phù hợp</p>
              <p className="text-3xl font-extrabold tabular-nums tracking-tight leading-none">
                {displayScore}<span className="text-lg ml-0.5 font-bold">%</span>
              </p>
            </div>
            <div className="flex items-center">
              {confirmed ? (
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-400/30 border border-emerald-300/50 px-4 py-2 text-xs font-bold text-white">
                  ✓ Đã xác nhận
                </span>
              ) : (
                <ScoreBadge score={safeMatchScore} />
              )}
            </div>
          </div>
        </div>

        {/* ── BODY scrollable ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Điểm chi tiết */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Điểm chi tiết
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <ScoreBar label="Giờ giấc"  value={scores?.sleepScore} />
              <ScoreBar label="Dọn dẹp"   value={scores?.cleaningScore} />
              <ScoreBar label="Riêng tư"  value={scores?.privacyScore} />
              <ScoreBar label="Tiếng ồn"  value={scores?.noiseScore} />
              <ScoreBar label="Có khách"  value={scores?.guestScore} />
              <ScoreBar label="Nấu ăn"    value={scores?.cookingScore} />
            </div>
          </section>

          {/* Điểm tương đồng */}
          {safeReasons.length > 0 && (
            <section>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Điểm tương đồng
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeReasons.map((reason, i) => (
                  <span
                    key={`${reason}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 ring-1 ring-cyan-100"
                  >
                    <span className="text-cyan-500">✓</span>
                    {reason}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Nhắn tin */}
          <section>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Nhắn tin cho {firstName}
            </h3>

            {/* Lịch sử tin nhắn */}
            {messages.length > 0 && (
              <div className="mb-3 max-h-44 overflow-y-auto space-y-2 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        msg.isMe
                          ? "bg-cyan-600 text-white rounded-br-md shadow-sm"
                          : "bg-white text-slate-600 ring-1 ring-slate-100 rounded-bl-md shadow-sm"
                      }`}
                    >
                      {msg.text}
                      <p className={`text-[10px] mt-1 ${msg.isMe ? "text-cyan-200" : "text-slate-400"}`}>
                        {msg.sentAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Ô nhập tin nhắn */}
            <div className="flex gap-2 items-end">
              <input
                id="match-message-input"
                ref={inputRef}
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                placeholder={`Nhắn tin cho ${firstName}...`}
                disabled={isSending}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100/60 transition disabled:opacity-60"
              />
              <button
                id="match-message-send-btn"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                className="shrink-0 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Gửi
                  </span>
                ) : "Gửi"}
              </button>
            </div>
          </section>
        </div>

        {/* ── FOOTER – Xác nhận ghép đôi ── */}
        <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
          {confirmed ? (
            <div
              id="match-confirmed-banner"
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 py-3.5 text-sm font-semibold text-emerald-700"
            >
              <span className="text-base">✓</span>
              Đã xác nhận ghép đôi với {firstName}!
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                id="match-confirm-btn"
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-cyan-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-700 active:scale-[0.98]"
              >
                ✓ Xác nhận ghép đôi
              </button>
              <button
                id="match-dismiss-btn"
                onClick={handleClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                Bỏ qua
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
