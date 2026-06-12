import React from 'react';
import { Phone, MessageCircle, ShieldCheck, ShieldAlert, AlertTriangle, User, Flag } from 'lucide-react';

interface AuthorSidebarProps {
    riskScore?: number;
}

const AuthorSidebar = ({ riskScore = 15 }: AuthorSidebarProps) => {

    // Risk eval based on document specs: Higher score = Higher risk
    const getRiskLevel = (score: number) => {
        if (score >= 70) return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: <AlertTriangle className="w-5 h-5" /> };
        if (score >= 50) return { label: "Warning", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <ShieldAlert className="w-5 h-5" /> };
        return { label: "Safe", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: <ShieldCheck className="w-5 h-5" /> };
    };

    const risk = getRiskLevel(riskScore);

    return (
        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-sm p-5">

            {/* Author Profile */}
            <div className="flex items-center space-x-4 mb-5">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-900">Nguyễn Văn A</h3>
                    <p className="text-sm text-gray-500">Verified Landlord • Active 2h ago</p>
                </div>
            </div>

            {/* Call To Actions */}
            <div className="space-y-3 mb-6">
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition">
                    <Phone className="w-5 h-5 mr-2" />
                    0901 *** 999
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Live Chat
                </button>
            </div>

            {/* Risk Assessment System */}
            <div className={`p-4 rounded-lg border ${risk.bg} ${risk.border} mb-4`}>
                <div className={`flex items-center font-semibold mb-1 ${risk.color}`}>
                    {risk.icon}
                    <span className="ml-2">Risk Score: {riskScore}/100</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                    {riskScore >= 70 ? "Multiple risk factors detected. Avoid depositing money."
                        : riskScore >= 50 ? "Some info is missing. Proceed with caution."
                            : "System checks passed. Looks safe to proceed."}
                </p>
            </div>

            {/* Report Button */}
            <button className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-red-500 transition mt-2">
                <Flag className="w-4 h-4 mr-2" />
                Report this listing
            </button>

        </div>
    );
};

export default AuthorSidebar;