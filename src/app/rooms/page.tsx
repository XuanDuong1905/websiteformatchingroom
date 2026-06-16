"use client";

import { useEffect, useState } from "react";

import RoomCard, { type RoomSummary } from "@/components/home/RoomCard";

type RoomsResponse = {
  success?: boolean;
  data?: RoomSummary[];
  message?: string;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/rooms", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as RoomsResponse | null;

        if (!response.ok) {
          throw new Error(data?.message || "Không thể tải danh sách phòng.");
        }

        if (isMounted) {
          setRooms(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải danh sách phòng.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-cyan-700">Phòng trọ</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Danh sách phòng đang hoạt động
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Các phòng đã được chủ trọ đăng và đang sẵn sàng cho sinh viên tìm kiếm.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            Đang tải danh sách phòng...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Chưa có phòng phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
