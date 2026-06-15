"use client";
import React, { useState } from 'react';
import { Phone, MessageCircle, ShieldCheck, ShieldAlert, AlertTriangle, User, Flag } from 'lucide-react';

interface AuthorSidebarProps {
    riskScore: number;
    owner: {
        fullName: string;
        phone: string;
        avatarUrl: string;
    };
}

const AuthorSidebar = ({ riskScore, owner }: AuthorSidebarProps) => {
    // Manage phone visibility
    const [showPhone, setShowPhone] = useState(false);

    const getRiskLevel = (score: number) => {
        if (score >= 70) return { label: "Rủi ro cao", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: <AlertTriangle className="w-5 h-5" /> };
        if (score >= 50) return { label: "Cảnh báo", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <ShieldAlert className="w-5 h-5" /> };
        return { label: "An toàn", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: <ShieldCheck className="w-5 h-5" /> };
    };

    const risk = getRiskLevel(riskScore);

    // Formatter to mask phone number initially
    const displayPhone = () => {
        if (!owner?.phone) return "Chưa cập nhật số";
        if (showPhone) return owner.phone;
        return owner.phone.slice(0, 4) + " *** ***";
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
                    onClick={() => alert("Tính năng chat đang phát triển!")}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat ngay
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
                onClick={() => alert("Tính năng đang phát triển!")}
                className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-red-500 transition mt-2"
            >
                <Flag className="w-4 h-4 mr-2" />
                Báo cáo tin đăng
            </button>

        </div>
    );
};

export default AuthorSidebar;