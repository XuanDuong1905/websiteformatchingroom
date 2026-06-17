"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { addFavoriteRoom, removeFavoriteRoom, getFavoriteRoomStatus } from "@/lib/api/favoriteApi";
import { getStoredUserId } from "@/lib/auth/storage";

type FavoriteRoomButtonProps = {
  roomId: number;
  /** Hiển thị dạng nhỏ (trên card) hoặc dạng đầy đủ (trên detail page) */
  variant?: "icon" | "full";
  /** CSS class tùy chỉnh */
  className?: string;
};

export default function FavoriteRoomButton({
  roomId,
  variant = "icon",
  className = "",
}: FavoriteRoomButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await getFavoriteRoomStatus(roomId);
      if (res.success) {
        setIsFavorited(res.isFavorited);
      }
    } catch {
      // Ignore - user not logged in
    } finally {
      setIsChecked(true);
    }
  }, [roomId]);

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChecked(true);
      return;
    }
    checkStatus();
  }, [checkStatus]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = getStoredUserId();
    if (!userId) {
      router.push("/login");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isFavorited) {
        await removeFavoriteRoom(roomId);
        setIsFavorited(false);
      } else {
        await addFavoriteRoom(roomId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until we've checked status to avoid flash
  if (!isChecked) return null;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
          isFavorited
            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            : "bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
        } disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <Heart
          size={18}
          className={`transition-all ${isLoading ? "animate-pulse" : ""} ${
            isFavorited ? "fill-red-500 text-red-500" : ""
          }`}
        />
        {isFavorited ? "Đã yêu thích" : "Yêu thích"}
      </button>
    );
  }

  // Icon variant (for cards)
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`transition z-20 disabled:opacity-60 ${className}`}
      aria-label={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
    >
      <Heart
        size={18}
        className={`transition-all ${isLoading ? "animate-pulse" : ""} ${
          isFavorited
            ? "fill-red-500 text-red-500"
            : "text-gray-500 hover:text-red-500"
        }`}
      />
    </button>
  );
}
