import React from 'react';
import { MapPin, Heart } from 'lucide-react';

const RoomCard = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group relative flex flex-col h-full">

            {/* Nút lưu tin góc phải trên (Heart Icon) */}
            <button className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition z-10 shadow-sm">
                <Heart size={18} />
            </button>

            {/* Ảnh phòng (Tạm dùng ảnh mạng để demo) */}
            <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop"
                    alt="Hình ảnh phòng trọ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded font-medium shadow">
                    Phòng trọ
                </span>
            </div>

            {/* Thông tin chi tiết */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Tiêu đề giới hạn 2 dòng */}
                <h3 className="font-semibold text-gray-800 text-base mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
                    Phòng trọ ban công siêu thoáng mát, full nội thất mới 100%, giờ giấc tự do
                </h3>

                {/* Mức giá in đậm, màu nổi bật */}
                <div className="text-xl font-bold text-red-500 mb-2">
                    3.500.000 đ<span className="text-sm font-normal text-gray-500">/tháng</span>
                </div>

                {/* Thông số kỹ thuật */}
                <div className="flex items-center text-sm text-gray-600 mb-3 space-x-2 font-medium">
                    <span>25m²</span>
                    <span className="text-gray-300">•</span>
                    <span>1 PN</span>
                    <span className="text-gray-300">•</span>
                    <span>1 WC</span>
                </div>

                {/* Vị trí luôn nằm ở dưới cùng */}
                <div className="mt-auto flex items-start text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">Đường Trần Hưng Đạo, Phường 1, Quận 5, TP.HCM</span>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;