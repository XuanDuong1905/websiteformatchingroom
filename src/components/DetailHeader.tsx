import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const DetailHeader = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Left: Summary info */}
                <div className="flex items-center space-x-3 max-w-xs md:max-w-sm">
                    <img
                        src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=100&auto=format&fit=crop"
                        alt="Thumbnail"
                        className="w-10 h-10 rounded object-cover hidden sm:block"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800 truncate">Phòng trọ ban công siêu thoáng mát...</span>
                        <span className="text-sm font-bold text-red-500">3.500.000 đ</span>
                    </div>
                </div>

                {/* Center: Anchor tabs (Hidden on mobile) */}
                <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-500">
                    <button className="text-blue-600 border-b-2 border-blue-600 py-5">Tổng quan</button>
                    <button className="hover:text-gray-800 py-5">Đặc điểm</button>
                    <button className="hover:text-gray-800 py-5">Mô tả</button>
                    <button className="hover:text-gray-800 py-5">Bản đồ</button>
                </div>

                {/* Right: CTA buttons */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition text-sm">
                        <MessageCircle size={16} className="mr-1.5" />
                        <span className="hidden sm:inline">Chat ngay</span>
                    </button>
                    <button className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm">
                        <Phone size={16} className="mr-1.5" />
                        <span className="hidden sm:inline">0901***999</span>
                    </button>
                </div>

            </div>
        </header>
    );
};

export default DetailHeader;