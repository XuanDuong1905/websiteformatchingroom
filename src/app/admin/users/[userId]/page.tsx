"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getUserDetail, updateUserStatus, blockUser, unblockUser } from "@/lib/api/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";

type UserWarning = {
  id: number;
  reason: string;
  createdAt: string;
};

type RiskReport = {
  id: number;
  riskType: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  reporter: {
    id: number;
    fullName: string;
  };
};

type RoomItem = {
  id: number;
  title: string;
  address: string;
  status: string;
  price: number;
  createdAt: string;
};

type UserDetailData = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string;
  role: string;
  status: string;
  reputationScore: number;
  isActive: boolean;
  createdAt: string;
  studentProfile: {
    university: string;
  } | null;
  landlordProfile: {
    businessName: string;
    businessLicenseImage: string;
    verifiedAt: string | null;
  } | null;
  userProfile: {
    schoolName: string | null;
    major: string | null;
    occupation: string | null;
  } | null;
  warnings: UserWarning[];
  reportsReceived: RiskReport[];
  rooms: RoomItem[];
  blockReason?: string;
};

const RISK_TYPE_LABELS: Record<string, string> = {
  fake_post: "Tin đăng ảo",
  wrong_information: "Thông tin sai thực tế",
  hidden_cost: "Chi phí ẩn",
  unclear_contract: "Hợp đồng không rõ ràng",
  deposit_scam: "Lừa đảo đặt cọc",
  bad_roommate_behavior: "Hành vi xấu",
  unsafe_location: "Khu vực không an toàn",
  other: "Khác",
};

export default function UserModerationPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reasonInput, setReasonInput] = useState("");

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getUserDetail(userId);
      if (response && response.success) {
        setUser(response.data);
      } else {
        throw new Error(response.message || "Không thể tải chi tiết thông tin người dùng.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi kết nối máy chủ.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     
    void loadUserDetails();
     
  }, [userId]);

  const handleWarnUser = async () => {
    if (!reasonInput.trim()) {
      alert("Vui lòng nhập lý do cảnh cáo.");
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn gửi cảnh báo vi phạm tới người dùng này?")) return;

    try {
      setIsProcessing(true);
      setError("");
      setSuccessMessage("");

      const response = await updateUserStatus(userId, { reason: reasonInput });
      if (response && response.success) {
        setSuccessMessage("Đã lưu cảnh báo vi phạm cho người dùng thành công.");
        setReasonInput("");
        void loadUserDetails();
      } else {
        throw new Error(response.message || "Không thể gửi cảnh cáo.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gặp lỗi khi lưu cảnh báo.";
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockUser = async () => {
    if (!reasonInput.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản.");
      return;
    }

    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ bị chặn đăng nhập và email/phone sẽ bị chặn tạo tài khoản mới.")) return;

    try {
      setIsProcessing(true);
      setError("");
      setSuccessMessage("");

      const response = await blockUser(userId, { reason: reasonInput });
      if (response && response.success) {
        setSuccessMessage("Khóa tài khoản thành công và đã thêm email/SĐT vào danh sách chặn.");
        setReasonInput("");
        void loadUserDetails();
      } else {
        throw new Error(response.message || "Không thể khóa tài khoản.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gặp lỗi khi khóa tài khoản.";
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!window.confirm("Bạn chắc chắn muốn MỞ KHÓA tài khoản này?")) return;

    try {
      setIsProcessing(true);
      setError("");
      setSuccessMessage("");

      const response = await unblockUser(userId, { note: reasonInput });
      if (response && response.success) {
        setSuccessMessage("Mở khóa tài khoản thành công và đã xóa khỏi danh sách chặn.");
        setReasonInput("");
        void loadUserDetails();
      } else {
        throw new Error(response.message || "Không thể mở khóa tài khoản.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gặp lỗi khi mở khóa tài khoản.";
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

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

  function getGenderLabel(gender: string) {
    const genders: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      unknown: "Chưa xác định",
    };
    return genders[gender] || gender;
  }

  function getRoleLabel(role: string) {
    const roles: Record<string, string> = {
      STUDENT: "Sinh viên",
      LANDLORD: "Chủ trọ",
      ADMIN: "Quản trị viên",
    };
    return roles[role] || role;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">Đang tải chi tiết thông tin người dùng...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy thông tin</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link
            href="/admin"
            className="mt-4 inline-flex rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
          >
            Quay lại dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex mb-3 text-sm text-slate-500 gap-2">
          <Link href="/admin" className="hover:text-cyan-700 hover:underline">
            Quản trị
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Chi tiết người dùng #{user.id}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {user.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Vai trò: <span className="font-semibold text-slate-800">{getRoleLabel(user.role)}</span> · Tham gia lúc: {formatDate(user.createdAt)}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Quay lại dashboard
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
          {/* Left Column - User Info, Warnings & Reports */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Profile Card */}
            <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Thông tin tài khoản</h3>
                <StatusBadge type="userActive" value={user.isActive} />
              </div>

              {/* Blocked Alert Banner */}
              {!user.isActive && user.blockReason && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  ⚠️ <span className="font-semibold">Lý do tài khóa khóa:</span> {user.blockReason}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <span className="text-slate-500">Mã ID người dùng:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">#{user.id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Họ và tên:</span>
                  <p className="font-semibold text-slate-850 mt-0.5">{user.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email đăng nhập:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{user.phone || "Chưa thiết lập"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Giới tính:</span>
                  <p className="font-medium text-slate-800 mt-0.5">{getGenderLabel(user.gender)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Điểm uy tín:</span>
                  <p className="font-bold mt-0.5 text-cyan-700 text-base">{user.reputationScore}</p>
                </div>

                {/* Password display requirement V */}
                <div>
                  <span className="text-slate-500">Mật khẩu:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">🔒 Đã thiết lập</span>
                  </div>
                </div>

                {/* Profile specific information based on Student/Landlord role */}
                {user.studentProfile && (
                  <div>
                    <span className="text-slate-500">Trường đại học:</span>
                    <p className="font-semibold text-slate-850 mt-0.5">{user.studentProfile.university}</p>
                  </div>
                )}
                {user.landlordProfile && (
                  <>
                    <div>
                      <span className="text-slate-500">Tên cơ sở kinh doanh:</span>
                      <p className="font-semibold text-slate-850 mt-0.5">{user.landlordProfile.businessName}</p>
                    </div>
                    {user.landlordProfile.businessLicenseImage && (
                      <div>
                        <span className="text-slate-500">Giấy phép kinh doanh:</span>
                        <a
                          href={user.landlordProfile.businessLicenseImage}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs font-bold text-cyan-700 hover:underline hover:text-cyan-800"
                        >
                          🖼️ Xem hình ảnh giấy phép
                        </a>
                      </div>
                    )}
                  </>
                )}
                {user.userProfile && (user.userProfile.schoolName || user.userProfile.major) && (
                  <div>
                    <span className="text-slate-500">Thông tin học tập:</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {user.userProfile.schoolName} {user.userProfile.major && `· Ngành: ${user.userProfile.major}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings History List */}
            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-amber-50/20">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  ⚠️ Lịch sử cảnh cáo vi phạm ({user.warnings.length})
                </h3>
              </div>

              {user.warnings.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Người dùng chưa từng bị cảnh cáo vi phạm chính sách.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {user.warnings.map((warning) => (
                    <div key={warning.id} className="p-4 flex justify-between items-start gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{warning.reason}</p>
                        <span className="text-xs text-slate-500 mt-1 block">Ghi nhận vào: {formatDate(warning.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Reports Received */}
            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Các báo cáo vi phạm liên quan ({user.reportsReceived.length})
                </h3>
              </div>

              {user.reportsReceived.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Không có báo cáo vi phạm nào gửi tới tài khoản này.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {user.reportsReceived.map((report) => (
                    <div key={report.id} className="p-5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-rose-700 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            {RISK_TYPE_LABELS[report.riskType] || report.riskType}
                          </span>
                          <StatusBadge type="severity" value={report.severity} />
                          <StatusBadge type="report" value={report.status} />
                        </div>
                        <span className="text-xs text-slate-500">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-md p-3 leading-relaxed">
                        {report.description}
                      </p>
                      <div className="text-xs text-slate-500">
                        Báo cáo bởi: <span className="font-medium text-slate-800">{report.reporter.fullName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column - User Moderation & Posted Rooms */}
          <div className="space-y-6">
            
            {/* Account Moderation Actions */}
            <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Xử lý tài khoản
              </h3>

              {/* Reason input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nhập lý do cảnh báo / khóa tài khoản
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Lý do khóa tài khoản hoặc lý do gửi cảnh cáo..."
                  rows={3}
                  className="w-full text-sm rounded-md border border-slate-300 bg-white p-2.5 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                  disabled={isProcessing}
                />
              </div>

              {/* Control buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => void handleWarnUser()}
                  disabled={isProcessing}
                  className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >
                  ⚠️ Gửi cảnh cáo tài khoản
                </button>

                {user.isActive ? (
                  <button
                    onClick={() => void handleBlockUser()}
                    disabled={isProcessing}
                    className="w-full rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                  >
                    🚫 Khóa tài khoản (Block)
                  </button>
                ) : (
                  <button
                    onClick={() => void handleUnblockUser()}
                    disabled={isProcessing}
                    className="w-full rounded-md bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✅ Gỡ chặn tài khoản (Unblock)
                  </button>
                )}
              </div>
            </div>

            {/* List of Posted Rooms */}
            <div className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Phòng trọ đã đăng ({user.rooms.length})
                </h3>
              </div>

              {user.rooms.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Người dùng chưa đăng tải phòng trọ nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {user.rooms.map((room) => (
                    <div key={room.id} className="p-4 space-y-1.5 hover:bg-slate-50/50">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/admin/reports/rooms/${room.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-cyan-700 transition"
                        >
                          {room.title}
                        </Link>
                        <StatusBadge type="room" value={room.status} />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{room.address}</p>
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="font-semibold text-rose-650">{formatCurrency(room.price)}</span>
                        <span className="text-slate-400">{formatDate(room.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
      {/* internal debug info / security guidelines comment */}
      {/* 
        TODO: Mật khẩu người dùng được mã hóa bằng bcrypt tại backend. 
        Admin không thể xem mật khẩu gốc của người dùng vì lý do bảo mật thông tin.
      */}
    </main>
  );
}
