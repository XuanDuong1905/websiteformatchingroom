"use client";

import React, { useEffect, useState } from "react";
import { getConversations } from "@/lib/api/chatApi";
import { getStoredUserId } from "@/lib/auth/storage";
import GlobalStickyHeader from "@/components/layout/GlobalStickyHeader";
import ConversationList from "@/components/chat/ConversationList";
import { ChatConversation } from "@/components/chat/ConversationItem";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const id = getStoredUserId();
    if (!id) {
      window.location.href = "/login";
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserId(id);

    const loadData = async () => {
      try {
        const res = await getConversations();
        if (res.success) {
          setConversations(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Avoid hydration error
  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      <GlobalStickyHeader />
      
      <main className="flex-1 overflow-hidden flex">
        {/* Left Column (Sidebar) - Full width on mobile, 350px on desktop */}
        <div className="w-full md:w-[350px] lg:w-[400px] h-full flex-shrink-0">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            currentUserId={userId || 0}
          />
        </div>

        {/* Right Column (Main Area) - Hidden on mobile, flex on desktop */}
        <div className="hidden md:flex flex-1 h-full bg-slate-50 items-center justify-center border-l border-gray-200 shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)]">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <MessageCircle className="w-10 h-10 text-cyan-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tin nhắn của bạn</h2>
            <p className="text-gray-500 max-w-sm">
              Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
