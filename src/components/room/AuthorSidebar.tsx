"use client";
import React, { useState } from 'react';
import { Phone, MessageCircle, ShieldCheck, ShieldAlert, AlertTriangle, User, Flag, X } from 'lucide-react';
import { getStoredUserId } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { createConversation } from '@/lib/api/chatApi';

interface AuthorSidebarProps {
    roomId: number;
    riskScore: number;
    owner: {
        id: number;
        fullName: string;
        phone: string;
        avatarUrl: string;
    };
}

const AuthorSidebar = ({ roomId, riskScore, owner }: AuthorSidebarProps) => {
    const [showPhone, setShowPhone] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("fake_post");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const router = useRouter();

    const getRiskLevel = (score: number) => {
        if (score >= 70) return { label: "Rủi ro cao", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: <AlertTriangle className="w-5 h-5" /> };
        if (score >= 50) return { label: "Cảnh báo", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <ShieldAlert className="w-5 h-5" /> };
        return { label: "An toàn", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: <ShieldCheck className="w-5 h-5" /> };
    };

    const risk = getRiskLevel(riskScore);

    const displayPhone = () => {
        if (!owner?.phone) return "Chưa cập nhật số";
        if (showPhone) return owner.phone;
        return owner.phone.slice(0, 4) + " *** ***";
    };

    const handleReport = async () => {
        const reporterId = getStoredUserId();
        if (!reporterId) {
            alert("Bạn cần đăng nhập để báo cáo!");
            return;
        }
        if (!reportDescription.trim()) {
            alert("Vui lòng nhập mô tả chi tiết.");
            return;
        }

        setIsReporting(true);
        try {
            const res = await fetch(`/api/rooms/${roomId}/reports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reporterId,
                    riskType: reportReason,
                    description: reportDescription,
                }),
            });
            const json = await res.json();
            if (json.success) {
                alert("Đã gửi báo cáo thành công. Cảm ơn bạn!");
                setShowReportModal(false);
                setReportDescription("");
            } else {
                alert(json.message || "Gửi báo cáo thất bại.");
            }
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi khi gửi báo cáo.");
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {/* Author Profile */}
            <div className="flex items-center space-x-4 mb-5">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    {owner?.avatarUrl ? (
                        <img src={owner.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-gray-400" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">{owner?.fullName || "Chưa cập nhật"}</h3>
                    <p className="text-sm text-gray-500">Chủ trọ</p>
                </div>
            </div>

            {/* Call To Actions */}
            <div className="space-y-3 mb-6">
                <button
                    onClick={() => setShowPhone(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                >
                    <Phone className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col items-center">
                        <span className="leading-tight">{displayPhone()}</span>
                        {!showPhone && (
                            <span className="text-[10px] font-normal opacity-85 leading-none mt-0.5">
                                (Bấm để hiện chi tiết)
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={async () => {
                        const currentUserId = getStoredUserId();
                        if (!currentUserId) {
                            alert("Bạn cần đăng nhập để nhắn tin!");
                            router.push("/login");
                            return;
                        }
                        if (currentUserId === owner.id) {
                            alert("Bạn không thể chat với chính mình.");
                            return;
                        }
                        
                        setIsStartingChat(true);
                        try {
                            const res = await createConversation(owner.id, roomId);
                            if (res.success && res.data?.id) {
                                router.push(`/messages/${res.data.id}`);
                            }
                        } catch {
                            alert("Không thể tạo cuộc trò chuyện");
                        } finally {
                            setIsStartingChat(false);
                        }
                    }}
                    disabled={isStartingChat}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {isStartingChat ? "Đang kết nối..." : "Chat ngay"}
                </button>
            </div>

            {/* Risk Assessment System */}
            <div className={`p-4 rounded-lg border ${risk.bg} ${risk.border} mb-4`}>
                <div className={`flex items-center font-semibold mb-1 ${risk.color}`}>
                    {risk.icon}
                    <span className="ml-2">Điểm rủi ro: {riskScore}/100</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                    {riskScore >= 70 ? "Phát hiện nhiều dấu hiệu lừa đảo. Tuyệt đối không chuyển cọc."
                        : riskScore >= 50 ? "Thiếu một số thông tin xác thực. Cần cẩn trọng."
                            : "Hệ thống đánh giá tin đăng này an toàn."}
                </p>
            </div>

            <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-red-500 transition mt-2"
            >
                <Flag className="w-4 h-4 mr-2" />
                Báo cáo tin đăng
            </button>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Báo cáo tin đăng</h2>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do báo cáo</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="fake_post">Tin giả mạo</option>
                                    <option value="wrong_information">Sai thông tin</option>
                                    <option value="hidden_cost">Chi phí ẩn</option>
                                    <option value="unclear_contract">Hợp đồng mập mờ</option>
                                    <option value="deposit_scam">Lừa đảo tiền cọc</option>
                                    <option value="unsafe_location">Môi trường không an toàn</option>
                                    <option value="other">Lý do khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Mô tả rõ hơn vấn đề bạn gặp phải..."
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReport}
                                    disabled={isReporting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorSidebar;