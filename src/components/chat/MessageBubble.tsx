import React from "react";

type MessageBubbleProps = {
  content: string;
  createdAt: string;
  isMe: boolean;
  showAvatar?: boolean;
  avatarUrl?: string | null;
};

export default function MessageBubble({
  content,
  createdAt,
  isMe,
  showAvatar,
  avatarUrl,
}: MessageBubbleProps) {
  const timeString = new Date(createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex w-full mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        {!isMe && (
          <div className={`w-8 h-8 rounded-full flex-shrink-0 hidden sm:block mb-1 ${showAvatar ? "bg-gray-200 border border-gray-100 overflow-hidden" : "opacity-0"}`}>
            {showAvatar && (
              avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
              )
            )}
          </div>
        )}

        <div className="flex flex-col group">
          <div
            className={`relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
              isMe
                ? "bg-cyan-600 text-white rounded-2xl rounded-br-sm"
                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
            }`}
          >
            {content}
          </div>
          
          <span
            className={`text-[10px] mt-1 font-medium transition-opacity opacity-0 group-hover:opacity-100 ${
              isMe ? "text-right text-gray-400 pr-1" : "text-left text-gray-400 pl-1"
            }`}
          >
            {timeString}
          </span>
        </div>
      </div>
    </div>
  );
}
