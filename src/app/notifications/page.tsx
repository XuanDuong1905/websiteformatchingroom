"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Users, CheckCheck } from "lucide-react";
import GlobalStickyHeader from "@/components/layout/GlobalStickyHeader";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/api/notificationApi";
import { getStoredUserId } from "@/lib/auth/storage";

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

type TabType = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
     
    setIsMounted(true);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getNotifications({
        unreadOnly: activeTab === "unread",
        limit: 50,
      });
      if (res.success) {
        setNotifications(res.data);
      }
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isMounted) return;
    const userId = getStoredUserId();
    if (!userId) {
      window.location.href = "/login";
      return;
    }
     
    fetchNotifications();
  }, [isMounted, fetchNotifications]);

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        window.dispatchEvent(new Event("notifications-read"));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClick = async (notification: NotificationItem) => {
    await handleMarkAsRead(notification);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event("notifications-read"));
    } catch (err) {
      console.error(err);
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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ROOM_COMMENT":
      case "COMMENTED_ROOM_COMMENT":
        return <MessageSquare className="w-5 h-5" />;
      case "MATCH_REQUEST":
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ROOM_COMMENT":
        return "Bình luận phòng";
      case "COMMENTED_ROOM_COMMENT":
        return "Phòng bạn theo dõi";
      case "MATCH_REQUEST":
        return "Yêu cầu ghép trọ";
      default:
        return "Thông báo";
    }
  };

  if (!isMounted) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalStickyHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-600" />
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 transition"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === "unread"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Chưa đọc
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">
                {activeTab === "unread" ? "Không có thông báo chưa đọc" : "Bạn chưa có thông báo nào."}
              </h3>
              <p className="text-sm text-gray-500">
                {activeTab === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo rồi!"
                  : "Khi có người bình luận phòng hoặc gửi yêu cầu ghép trọ, bạn sẽ nhận được thông báo tại đây."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-6 py-4 flex gap-4 transition-colors ${
                    n.isRead
                      ? "bg-white hover:bg-gray-50"
                      : "bg-cyan-50/40 hover:bg-cyan-50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.isRead
                        ? "bg-gray-100 text-gray-400"
                        : "bg-cyan-100 text-cyan-600"
                    }`}
                  >
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          n.isRead
                            ? "bg-gray-100 text-gray-500"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {getTypeLabel(n.type)}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <h4
                      className={`text-sm ${
                        n.isRead ? "text-gray-700" : "text-gray-900 font-semibold"
                      }`}
                    >
                      {n.title}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
