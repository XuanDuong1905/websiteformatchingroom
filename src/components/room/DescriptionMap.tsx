"use client";

import React, { useState } from 'react';
import { Map, MapPin } from 'lucide-react';

interface DescProps {
    description: string;
    address: string;
    district: string;
    ward: string;
}

const DescriptionMap = ({ description, address, district, ward }: DescProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Default description fallback if empty
    const text = description || "Chưa có mô tả cho phòng trọ này.";
    const isLongText = text.length > 250;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">

            {/* Detailed Description Section */}
            <div className="mb-8 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
                <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    <p className={!isExpanded && isLongText ? "line-clamp-4" : ""}>
                        {text}
                    </p>
                </div>
                {/* Toggle read more button if text exceeds 250 characters */}
                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-cyan-600 font-medium mt-3 hover:underline text-sm transition"
                    >
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                )}
            </div>

            {/* Map Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Map className="w-5 h-5 mr-2 text-gray-500" />
                    Bản đồ khu vực
                </h2>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" />
                    {address}, {ward}, {district}
                </div>

                <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative group">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${address}, ${ward}, ${district}, Việt Nam`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        title="Bản đồ vị trí phòng trọ"
                        className="absolute inset-0"
                    ></iframe>
                </div>
            </div>

        </div>
    );
};

export default DescriptionMap;