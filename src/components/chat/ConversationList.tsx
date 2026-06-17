"use client";

import React, { useState, useEffect } from "react";
import { Search, MessageSquare } from "lucide-react";
import ConversationItem, { ChatConversation } from "./ConversationItem";
import { ConversationListSkeleton } from "./ChatSkeleton";

type ConversationListProps = {
  conversations: ChatConversation[];
  isLoading: boolean;
  currentUserId: number;
  activeConversationId?: number;
};

export default function ConversationList({
  conversations,
  isLoading,
  currentUserId,
  activeConversationId,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredConversations = conversations.filter((conv) => {
    if (!debouncedSearch.trim()) return true;
    
    const isUserOne = conv.userOneId === currentUserId;
    const otherUser = isUserOne ? conv.userTwo : conv.userOne;
    const searchLower = debouncedSearch.toLowerCase();
    
    const nameMatch = otherUser?.fullName?.toLowerCase().includes(searchLower);
    const roomMatch = conv.room?.title?.toLowerCase().includes(searchLower);
    
    return nameMatch || roomMatch;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-cyan-600" />
          Tin nhắn
        </h1>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm">Bạn chưa có cuộc trò chuyện nào.</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500 text-sm">
            Không tìm thấy kết quả phù hợp.
          </div>
        ) : (
          <div className="divide-y divide-transparent">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                isActive={conv.id === activeConversationId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
