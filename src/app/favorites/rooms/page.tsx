"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Trash2, Eye } from "lucide-react";
import GlobalStickyHeader from "@/components/layout/GlobalStickyHeader";
import { getFavoriteRooms, removeFavoriteRoom } from "@/lib/api/favoriteApi";
import { getStoredUserId } from "@/lib/auth/storage";

type FavoriteItem = {
  id: number;
  roomId: number;
  createdAt: string;
  room: {
    id: number;
    title: string;
    price: number;
    area: string | number;
    district: string;
    ward: string;
    address: string;
    status: string;
    images: { imageUrl: string }[];
  };
};

export default function FavoriteRoomsPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const userId = getStoredUserId();
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    const loadFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getFavoriteRooms();
        if (res.success) {
          setFavorites(res.data);
        }
      } catch {
        setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isMounted]);

  const handleRemove = async (roomId: number) => {
    setRemovingId(roomId);
    try {
      await removeFavoriteRoom(roomId);
      setFavorites((prev) => prev.filter((f) => f.roomId !== roomId));
    } catch {
      alert("Lỗi khi bỏ yêu thích. Vui lòng thử lại.");
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " triệu/tháng";
    }
    return new Intl.NumberFormat("vi-VN").format(price) + " đ/tháng";
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalStickyHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Phòng yêu thích</h1>
          {!isLoading && favorites.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {favorites.length} phòng
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 animate-pulse">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bạn chưa yêu thích phòng trọ nào.
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Hãy khám phá các phòng trọ và bấm biểu tượng trái tim để lưu lại nhé!
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
            >
              Khám phá phòng trọ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => {
              const coverImage =
                fav.room.images?.length > 0
                  ? fav.room.images[0].imageUrl
                  : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=300&auto=format&fit=crop";

              return (
                <div
                  key={fav.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div
                      className="w-full sm:w-40 h-40 sm:h-auto bg-gray-200 flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/room/${fav.room.id}`)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImage}
                        alt={fav.room.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3
                          className="font-semibold text-gray-900 text-base mb-1 line-clamp-2 hover:text-cyan-600 cursor-pointer transition"
                          onClick={() => router.push(`/room/${fav.room.id}`)}
                        >
                          {fav.room.title}
                        </h3>
                        <p className="text-lg font-bold text-red-500 mb-2">
                          {formatPrice(fav.room.price)}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {fav.room.address || fav.room.ward || fav.room.district}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => router.push(`/room/${fav.room.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
                        >
                          <Eye size={14} />
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleRemove(fav.room.id)}
                          disabled={removingId === fav.room.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {removingId === fav.room.id ? "Đang xóa..." : "Bỏ yêu thích"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
