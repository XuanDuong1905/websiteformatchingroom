import React from "react";
import Link from "next/link";
import { User } from "lucide-react";

export type ChatConversation = {
  id: number;
  userOneId: number;
  userTwoId: number;
  userOne: { id: number; fullName: string; avatarUrl: string | null };
  userTwo: { id: number; fullName: string; avatarUrl: string | null };
  room: { id: number; title: string; price?: number; address?: string } | null;
  messages: { id: number; senderId: number; content: string; createdAt: string }[];
};

type ConversationItemProps = {
  conversation: ChatConversation;
  currentUserId: number;
  isActive?: boolean;
};

export default function ConversationItem({ conversation, currentUserId, isActive }: ConversationItemProps) {
  const isUserOne = conversation.userOneId === currentUserId;
  const otherUser = isUserOne ? conversation.userTwo : conversation.userOne;
  const lastMessage = conversation.messages?.[conversation.messages.length - 1] || conversation.messages?.[0]; // In case it's sorted asc or desc, we want the most recent. The API usually orders by createdAt asc, so the last is the newest.

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays < 7) {
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    }
  };

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`block transition-colors duration-200 border-b border-gray-50 last:border-0 ${
        isActive ? "bg-cyan-50" : "hover:bg-gray-50 bg-white"
      }`}
    >
      <div className="flex items-center p-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          {/* Active indicator placeholder (could be green dot if online) */}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`text-sm sm:text-base font-semibold truncate ${isActive ? "text-cyan-800" : "text-gray-900"}`}>
              {otherUser?.fullName || "Người dùng ẩn danh"}
            </h3>
            {lastMessage && (
              <span className={`text-[10px] sm:text-xs flex-shrink-0 ml-2 ${isActive ? "text-cyan-600 font-medium" : "text-gray-400"}`}>
                {formatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          
          {conversation.room && (
            <p className="text-[10px] sm:text-xs font-medium text-cyan-600 mb-1 truncate">
              Phòng: {conversation.room.title}
            </p>
          )}

          <p className={`text-xs sm:text-sm truncate ${isActive ? "text-cyan-700" : "text-gray-500"}`}>
            {lastMessage ? (
              <>
                {lastMessage.senderId === currentUserId ? "Bạn: " : ""}
                {lastMessage.content}
              </>
            ) : (
              <span className="italic text-gray-400">Chưa có tin nhắn nào</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
