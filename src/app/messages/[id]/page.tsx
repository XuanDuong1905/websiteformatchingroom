"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getConversations, getConversation, sendMessage } from "@/lib/api/chatApi";
import { getStoredUserId } from "@/lib/auth/storage";
import GlobalStickyHeader from "@/components/layout/GlobalStickyHeader";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { ChatWindowSkeleton } from "@/components/chat/ChatSkeleton";
import { ChatConversation } from "@/components/chat/ConversationItem";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [userId, setUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  
  const [isListLoading, setIsListLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(true);
  
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
     
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const init = async () => {
      const id = getStoredUserId();
      if (!id) {
        window.location.href = "/login";
        return;
      }
      setUserId(id);

      // Load both list and active chat
      const loadData = async () => {
        try {
          const [listRes, chatRes] = await Promise.all([
            getConversations(),
            getConversation(Number(params.id))
          ]);

          if (listRes.success) {
            setConversations(listRes.data);
          }
          if (chatRes.success) {
            setActiveConversation(chatRes.data);
          } else {
            alert("Không thể tải cuộc trò chuyện");
            router.push("/messages");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsListLoading(false);
          setIsChatLoading(false);
        }
      };

      // Background refresh only for active chat to avoid heavy network
      const refreshChat = async () => {
        try {
          const chatRes = await getConversation(Number(params.id));
          if (chatRes.success) {
            setActiveConversation(chatRes.data);
            // Also subtly update the list to reflect new message in sidebar
            setConversations(prev => {
               const updated = [...prev];
               const idx = updated.findIndex(c => c.id === Number(params.id));
               if (idx !== -1) {
                 updated[idx] = chatRes.data;
               }
               return updated;
            });
          }
        } catch {
          // Ignore background errors
        }
      };

      await loadData();
      intervalId = setInterval(refreshChat, 5000);
    };

    init();
    return () => clearInterval(intervalId);
  }, [params.id, router]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await sendMessage(Number(params.id), messageText);
      if (res.success) {
        // Optimistically update
        setActiveConversation((prev) => prev ? ({
          ...prev,
          messages: [...prev.messages, res.data],
        }) : prev);
        setMessageText("");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      <GlobalStickyHeader />
      
      <main className="flex-1 overflow-hidden flex">
        {/* Left Column (Sidebar) - Hidden on mobile when viewing a chat, fixed width on desktop */}
        <div className="hidden md:block w-[350px] lg:w-[400px] h-full flex-shrink-0">
          <ConversationList
            conversations={conversations}
            isLoading={isListLoading}
            currentUserId={userId || 0}
            activeConversationId={Number(params.id)}
          />
        </div>

        {/* Right Column (Chat Window) - Full width on mobile, flex on desktop */}
        <div className="w-full md:flex-1 h-full flex flex-col bg-slate-50 border-l border-gray-200">
          {isChatLoading ? (
            <ChatWindowSkeleton />
          ) : activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              currentUserId={userId || 0}
              messageText={messageText}
              setMessageText={setMessageText}
              onSend={handleSend}
              isSending={isSending}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Không tìm thấy cuộc trò chuyện.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
