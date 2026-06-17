"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, ExternalLink, ShieldCheck } from "lucide-react";
import { ChatConversation } from "./ConversationItem";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import MatchProfileModal from "@/components/MatchProfileModal";
import type { MatchItem } from "@/lib/api/matchApi";

type ChatWindowProps = {
  conversation: ChatConversation;
  currentUserId: number;
  messageText: string;
  setMessageText: (val: string) => void;
  onSend: () => void;
  isSending: boolean;
};

export default function ChatWindow({
  conversation,
  currentUserId,
  messageText,
  setMessageText,
  onSend,
  isSending,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMatchProfile, setShowMatchProfile] = useState(false);
  const [matchData, setMatchData] = useState<MatchItem | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const isUserOne = conversation.userOneId === currentUserId;
  const otherUser = isUserOne ? conversation.userTwo : conversation.userOne;

  const handleViewProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`/api/matches/${currentUserId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const found = data.data.find((m: any) => m.user.id === otherUser?.id);
        if (found) {
          setMatchData(found);
          setShowMatchProfile(true);
        } else {
          alert("Không tìm thấy thông tin độ phù hợp cho người dùng này (Có thể do không phù hợp tiêu chí cơ bản hoặc khác giới tính).");
        }
      } else {
        alert("Không thể tải dữ liệu.");
      }
    } catch (error) {
      alert("Lỗi kết nối khi tải thông tin.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages?.length]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center flex-1 min-w-0">
          <Link
            href="/messages"
            className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition text-gray-500 md:hidden flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          
          <div className="ml-3 flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate flex items-center gap-1.5">
              {otherUser?.fullName || "Người dùng ẩn danh"}
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 hidden sm:inline" />
            </h2>
            {conversation.room ? (
              <Link 
                href={`/room/${conversation.room.id}`} 
                className="text-xs sm:text-sm text-cyan-600 hover:text-cyan-700 hover:underline truncate inline-flex items-center max-w-full gap-1"
                title={conversation.room.title}
              >
                Phòng: {conversation.room.title}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">Thành viên Ghép Trọ</p>
                <span className="text-xs text-gray-300">•</span>
                <button 
                  onClick={handleViewProfile}
                  disabled={isLoadingProfile}
                  className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {isLoadingProfile ? "Đang tải..." : "Xem hồ sơ"} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
        <div className="max-w-4xl mx-auto space-y-1">
          {conversation.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">👋</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Hãy gửi lời chào!</h3>
              <p className="text-sm text-gray-500">Bắt đầu cuộc trò chuyện với {otherUser?.fullName || "người dùng này"}</p>
            </div>
          ) : (
            conversation.messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUserId;
              
              // Optional logic: Only show avatar on the last message of a cluster
              // For simplicity, we can pass showAvatar=true to all or conditionally
              const nextMsg = conversation.messages[idx + 1];
              const showAvatar = !nextMsg || nextMsg.senderId !== msg.senderId;

              return (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  createdAt={msg.createdAt}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  avatarUrl={otherUser?.avatarUrl}
                />
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        onSend={onSend}
        isSending={isSending}
      />

      {/* Match Profile Modal */}
      {showMatchProfile && matchData && (
        <MatchProfileModal
          match={matchData}
          onClose={() => setShowMatchProfile(false)}
        />
      )}
    </div>
  );
}
