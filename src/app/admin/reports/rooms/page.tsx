"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getReportedRooms } from "@/lib/api/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";

type ReportedRoom = {
  id: number;
  title: string;
  address: string;
  district: string;
  city: string;
  status: string;
  price: number;
  landlord: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  totalReports: number;
  pendingReportsCount: number;
  reviewingReportsCount: number;
  maxSeverity: string;
  latestReportDate: string;
};

export default function ReportedRoomsPage() {
  const [rooms, setRooms] = useState<ReportedRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReportedRooms = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getReportedRooms();
      if (response && response.success) {
        setRooms(response.data || []);
      } else {
        throw new Error(response.message || "Không thể tải danh sách phòng bị báo cáo.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi kết nối máy chủ.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReportedRooms();
  }, []);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-7xl">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <nav className="flex mb-3 text-sm text-slate-500 gap-2">
            <Link href="/admin" className="hover:text-cyan-700 hover:underline">
              Quản trị
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Báo cáo vi phạm phòng trọ</span>
          </nav>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Báo cáo vi phạm phòng trọ
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Theo dõi và xử lý các tin đăng phòng trọ bị người dùng báo cáo vi phạm chính sách.
              </p>
            </div>
            
            <button
              onClick={() => void loadReportedRooms()}
              disabled={isLoading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Đang tải..." : "Tải lại dữ liệu"}
            </button>
          </div>
        </div>

        {/* Status Alerts or Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Phòng bị báo cáo</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{rooms.length}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Chờ xử lý</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {rooms.reduce((acc, room) => acc + room.pendingReportsCount, 0)}
            </p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Cần ưu tiên (Nghiêm trọng)</h3>
            <p className="text-3xl font-bold text-rose-600 mt-2">
              {rooms.filter((room) => room.maxSeverity === "high").length}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Đang tải danh sách phòng trọ bị report...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-base font-semibold text-slate-950">Chưa có phòng trọ bị report</h3>
              <p className="mt-2 text-sm text-slate-500">
                Hệ thống chưa nhận được báo cáo vi phạm phòng trọ nào, hoặc tất cả đã được giải quyết.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Phòng trọ</th>
                    <th className="px-6 py-4 font-semibold">Người đăng</th>
                    <th className="px-6 py-4 font-semibold">Giá thuê</th>
                    <th className="px-6 py-4 text-center font-semibold">Số report</th>
                    <th className="px-6 py-4 font-semibold">Mức nghiêm trọng</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái phòng</th>
                    <th className="px-6 py-4 font-semibold">Báo cáo gần nhất</th>
                    <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{room.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{room.address}, {room.district}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/users/${room.landlord.id}`}
                          className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
                        >
                          {room.landlord.fullName}
                        </Link>
                        <div className="mt-0.5 text-xs text-slate-500">{room.landlord.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(room.price)}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                          {room.totalReports} báo cáo
                        </span>
                        {room.pendingReportsCount > 0 && (
                          <div className="mt-1 text-[10px] text-amber-600 font-semibold">
                            {room.pendingReportsCount} chưa xử lý
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge type="severity" value={room.maxSeverity} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge type="room" value={room.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(room.latestReportDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/reports/rooms/${room.id}`}
                          className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-cyan-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
