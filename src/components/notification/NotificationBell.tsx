"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, MessageSquare, Users, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/api/notificationApi";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
};

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (res.success) {
        setUnreadCount(res.count);
      }
    } catch {
      // Ignore errors for polling
    }
  }, []);

  // Polling unread count every 30s and listening to custom event
  useEffect(() => {
     
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const handleNotificationsRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener("notifications-read", handleNotificationsRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-read", handleNotificationsRead);
    };
  }, [fetchUnreadCount]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await getNotifications({ limit: 5 });
        if (res.success) {
          setNotifications(res.data);
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickNotification = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignore
      }
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ROOM_COMMENT":
      case "COMMENTED_ROOM_COMMENT":
        return <MessageSquare className="w-4 h-4" />;
      case "MATCH_REQUEST":
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative transition hover:text-cyan-600 flex items-center justify-center"
        aria-label="Thông báo"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-0.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Bạn chưa có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 transition-colors border-b border-gray-50 last:border-0 ${
                    n.isRead
                      ? "bg-white hover:bg-gray-50"
                      : "bg-cyan-50/50 hover:bg-cyan-50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.isRead
                        ? "bg-gray-100 text-gray-400"
                        : "bg-cyan-100 text-cyan-600"
                    }`}
                  >
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        n.isRead ? "text-gray-600" : "text-gray-900 font-medium"
                      }`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
              className="w-full px-4 py-3 text-sm text-cyan-600 hover:bg-cyan-50 transition font-medium flex items-center justify-center gap-1"
            >
              Xem tất cả thông báo
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
