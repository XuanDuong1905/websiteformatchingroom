import React from 'react';
import { MapPin, BedDouble, Bath, Clock, Dog, Zap, Droplets } from 'lucide-react';

const RoomSpecs = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">

            {/* Header section: Title and Address */}
            <div className="mb-6 border-b pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    Phòng trọ ban công siêu thoáng mát, full nội thất mới 100%, giờ giấc tự do
                </h1>
                <div className="flex items-start text-gray-500">
                    <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Đường Trần Hưng Đạo, Phường 1, Quận 5, TP.HCM</span>
                </div>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                    <p className="text-gray-500 text-sm mb-1">Price</p>
                    <p className="text-xl font-bold text-red-500">3.500.000 ₫</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Area</p>
                    <p className="text-lg font-semibold text-gray-900">25 m²</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Deposit</p>
                    <p className="text-lg font-semibold text-gray-900">1 Month</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Capacity</p>
                    <p className="text-lg font-semibold text-gray-900">2 People</p>
                </div>
            </div>

            {/* Detailed Features & Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><BedDouble className="w-4 h-4 mr-2" /> Bedrooms</div>
                    <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Bath className="w-4 h-4 mr-2" /> Bathrooms</div>
                    <span className="font-medium">1 (Private)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-2" /> Curfew</div>
                    <span className="font-medium">Flexible</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Dog className="w-4 h-4 mr-2" /> Pets</div>
                    <span className="font-medium">Allowed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Zap className="w-4 h-4 mr-2" /> Electricity</div>
                    <span className="font-medium">3.500 ₫/kWh</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center text-gray-600"><Droplets className="w-4 h-4 mr-2" /> Water</div>
                    <span className="font-medium">100.000 ₫/person</span>
                </div>
            </div>

        </div>
    );
};

export default RoomSpecs;