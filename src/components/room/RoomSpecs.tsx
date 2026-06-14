import React from 'react';
import { MapPin, BedDouble, Bath, Clock, Dog, Zap, Droplets } from 'lucide-react';

const RoomSpecs = ({ room }: { room: any }) => {
    if (!room) return null;

    const formattedPrice = new Intl.NumberFormat('vi-VN').format(room.price);
    const formattedDeposit = new Intl.NumberFormat('vi-VN').format(room.deposit || 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">

            {/* Header section: Title and Address */}
            <div className="mb-6 border-b pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {room.title}
                </h1>
                <div className="flex items-start text-gray-500">
                    <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{room.address}, {room.ward}, {room.district}</span>
                </div>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                    <p className="text-gray-500 text-sm mb-1">Mức giá</p>
                    <p className="text-xl font-bold text-red-500">{formattedPrice} ₫</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Diện tích</p>
                    <p className="text-lg font-semibold text-gray-900">{room.area} m²</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Tiền cọc</p>
                    <p className="text-lg font-semibold text-gray-900">{formattedDeposit} ₫</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Sức chứa</p>
                    <p className="text-lg font-semibold text-gray-900">{room.maxPeople} Người</p>
                </div>
            </div>

            {/* Detailed Features & Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Zap className="w-4 h-4 mr-2" /> Điện</div>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(room.electricityFee || 0)} ₫/kWh</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Droplets className="w-4 h-4 mr-2" /> Nước</div>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(room.waterFee || 0)} ₫</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><BedDouble className="w-4 h-4 mr-2" /> Hợp đồng</div>
                    <span className="font-medium">{room.hasContract ? "Có" : "Không"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-2" /> Ở tối thiểu</div>
                    <span className="font-medium">{room.minStayMonths} tháng</span>
                </div>
            </div>

        </div>
    );
};

export default RoomSpecs;