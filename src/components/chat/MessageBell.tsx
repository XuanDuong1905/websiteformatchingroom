"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MessageBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations/unread-count");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUnreadCount(json.count);
        }
      }
    } catch {
      // Ignore errors for polling
    }
  }, []);

  // Polling unread count every 30s and listening to custom events
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener("messages-read", handleMessagesRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener("messages-read", handleMessagesRead);
    };
  }, [fetchUnreadCount]);

  return (
    <button
      type="button"
      onClick={() => router.push("/messages")}
      className="relative transition hover:text-cyan-600 flex items-center justify-center"
      aria-label="Tin nhắn"
    >
      <MessageCircle size={22} />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-0.5">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
