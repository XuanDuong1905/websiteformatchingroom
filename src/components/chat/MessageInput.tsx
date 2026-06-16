"use client";

import React, { useRef, useEffect } from "react";
import { Send } from "lucide-react";

type MessageInputProps = {
  messageText: string;
  setMessageText: (val: string) => void;
  onSend: () => void;
  isSending: boolean;
};

export default function MessageInput({
  messageText,
  setMessageText,
  onSend,
  isSending,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim() && !isSending) {
        onSend();
      }
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex-shrink-0 relative z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-400 transition-all">
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 max-h-[120px] bg-transparent px-4 py-2.5 text-[15px] resize-none focus:outline-none placeholder-gray-400 min-h-[44px] overflow-y-auto"
          rows={1}
          disabled={isSending}
        />
        
        <button
          onClick={onSend}
          disabled={!messageText.trim() || isSending}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all mb-0.5 ${
            messageText.trim() && !isSending
              ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm hover:shadow active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Gửi tin nhắn"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-1.5 px-4 text-center sm:text-left">
        <span className="text-[10px] text-gray-400 hidden sm:inline">
          Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng.
        </span>
      </div>
    </div>
  );
}
