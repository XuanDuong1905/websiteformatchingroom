"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getRoomReportDetail, resolveRoomReport } from "@/lib/api/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";

type ReportItem = {
  id: number;
  riskType: string;
  description: string;
  evidenceUrl: string | null;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  handler: {
    id: number;
    fullName: string;
  } | null;
};

type RoomDetail = {
  id: number;
  title: string;
  address: string;
  district: string;
  city: string;
  status: string;
  price: number;
  createdAt: string;
  landlord: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  riskReports: ReportItem[];
};

const RISK_TYPE_LABELS: Record<string, string> = {
  fake_post: "Tin đăng ảo / không có thật",
  wrong_information: "Thông tin phòng sai thực tế",
  hidden_cost: "Chi phí ẩn / không minh bạch",
  unclear_contract: "Hợp đồng mập mờ / không rõ ràng",
  deposit_scam: "Lừa đảo đặt cọc",
  bad_roommate_behavior: "Hành vi xấu từ người ở ghép",
  unsafe_location: "Khu vực không an toàn",
  other: "Lý do khác",
};

export default function RoomReportDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const loadRoomDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getRoomReportDetail(roomId);
      if (response && response.success) {
        setRoom(response.data);
      } else {
        throw new Error(response.message || "Không thể tải chi tiết phòng trọ.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi kết nối máy chủ.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     
    void loadRoomDetails();
     
  }, [roomId]);

  const handleResolve = async (action: "dismiss" | "warn" | "hide") => {
    let confirmMsg = "";
    if (action === "dismiss") {
      confirmMsg = "Bạn chắc chắn muốn bác bỏ tất cả báo cáo và tiếp tục hiển thị phòng trọ này bình thường?";
    } else if (action === "warn") {
      confirmMsg = "Bạn chắc chắn muốn đánh dấu cảnh báo phòng trọ này? Phòng vẫn hiển thị nhưng có nhãn cảnh báo.";
    } else if (action === "hide") {
      confirmMsg = "Bạn chắc chắn muốn ẩn/gỡ phòng trọ này? Người dùng sẽ không thể tìm thấy phòng này nữa.";
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      setError("");
      setSuccessMessage("");

      const response = await resolveRoomReport(roomId, {
        action,
        note: adminNote,
      });

      if (response && response.success) {
        setSuccessMessage(response.message || "Xử lý báo cáo thành công!");
        setAdminNote("");
        // Reload details after short delay
        setTimeout(() => {
          void loadRoomDetails();
        }, 1500);
      } else {
        throw new Error(response.message || "Không thể xử lý yêu cầu.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi xử lý.";
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  function formatCurrency(value: number | undefined) {
    if (value === undefined) return "0 ₫";
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu chi tiết phòng trọ...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy dữ liệu</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/admin/reports/rooms"
            className="mt-4 inline-flex rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
          >
            Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  if (!room) return null;

  const pendingReports = room.riskReports.filter((r) => r.status === "pending" || r.status === "reviewing");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex mb-3 text-sm text-slate-500 gap-2">
          <Link href="/admin" className="hover:text-cyan-700 hover:underline">
            Quản trị
          </Link>
          <span>/</span>
          <Link href="/admin/reports/rooms" className="hover:text-cyan-700 hover:underline">
            Báo cáo vi phạm phòng trọ
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Chi tiết phòng #{room.id}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Chi tiết báo cáo phòng trọ
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Mã phòng trọ: <span className="font-semibold">#{room.id}</span> · Đăng lúc: {formatDate(room.createdAt)}
            </p>
          </div>
          <Link
            href="/admin/reports/rooms"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Quay lại danh sách
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-750 font-medium">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Card Info */}
            <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900">{room.title}</h2>
                <StatusBadge type="room" value={room.status} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <span className="text-slate-500">Địa chỉ:</span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {room.address}, {room.district}, {room.city}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Giá thuê:</span>
                  <p className="font-semibold text-rose-600 mt-0.5 text-base">
                    {formatCurrency(room.price)}/tháng
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Chủ trọ / Người đăng:</span>
                  <div className="mt-0.5 font-medium text-slate-800">
                    <Link 
                      href={`/admin/users/${room.landlord.id}`}
                      className="text-cyan-700 hover:text-cyan-800 hover:underline"
                    >
                      {room.landlord.fullName}
                    </Link>
                    <p className="text-xs text-slate-500 font-normal">
                      Email: {room.landlord.email} {room.landlord.phone && `· SĐT: ${room.landlord.phone}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Reports */}
            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Danh sách báo cáo vi phạm ({room.riskReports.length})
                </h3>
              </div>

              {room.riskReports.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Không có bản ghi báo cáo vi phạm nào cho phòng trọ này.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {room.riskReports.map((report) => (
                    <div key={report.id} className="p-6 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-rose-700 text-sm bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            {RISK_TYPE_LABELS[report.riskType] || report.riskType}
                          </span>
                          <StatusBadge type="severity" value={report.severity} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Báo cáo bởi:</span>
                          <Link 
                            href={`/admin/users/${report.reporter.id}`}
                            className="font-medium text-cyan-700 hover:text-cyan-850 hover:underline"
                          >
                            {report.reporter.fullName}
                          </Link>
                          <span>· {formatDate(report.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 bg-slate-50 rounded-md p-3 leading-relaxed">
                        {report.description}
                      </p>

                      {/* Evidence Link */}
                      {report.evidenceUrl && (
                        <div className="text-sm">
                          <span className="text-slate-500 font-medium">Bằng chứng / Hình ảnh:</span>
                          <a
                            href={report.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-semibold hover:underline"
                          >
                            🖼️ Xem ảnh bằng chứng đính kèm
                          </a>
                        </div>
                      )}

                      {/* Report Handling status */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Trạng thái report:</span>
                          <StatusBadge type="report" value={report.status} />
                        </div>
                        {report.handler && (
                          <span className="text-slate-500 font-normal">
                            Xử lý bởi: <span className="font-medium text-slate-800">{report.handler.fullName}</span> vào {formatDate(report.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Control Panel (Right 1/3) */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Bảng điều khiển xử lý
              </h3>

              {/* Note input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Ghi chú xử lý của Admin (tùy chọn)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập lý do hoặc ghi chú giải quyết..."
                  rows={3}
                  className="w-full text-sm rounded-md border border-slate-300 bg-white p-2.5 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  disabled={isProcessing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleResolve("dismiss")}
                  disabled={isProcessing || pendingReports.length === 0}
                  className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  🟢 Tiếp tục hiển thị (Bác bỏ report)
                </button>

                <button
                  onClick={() => handleResolve("warn")}
                  disabled={isProcessing || pendingReports.length === 0}
                  className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  🟡 Thêm nhãn cảnh báo
                </button>

                <button
                  onClick={() => handleResolve("hide")}
                  disabled={isProcessing || pendingReports.length === 0}
                  className="w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  🔴 Ẩn/gỡ phòng trọ này
                </button>
              </div>

              {/* Helper guide */}
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed space-y-1">
                <p>💡 <span className="font-semibold text-slate-700">Tiếp tục hiển thị:</span> Dùng khi phát hiện report sai lệch, thiếu bằng chứng.</p>
                <p>💡 <span className="font-semibold text-slate-700">Thêm cảnh báo:</span> Thêm nhãn cảnh báo lên trọ, vẫn giữ lại tin đăng.</p>
                <p>💡 <span className="font-semibold text-slate-700">Ẩn/gỡ phòng trọ:</span> Dùng khi phát hiện vi phạm nghiêm trọng (lừa đảo cọc, địa chỉ ảo).</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
