import React from 'react';
import { MapPin, ChevronDown, SlidersHorizontal } from 'lucide-react';

const FiltersBar = () => {
    return (
        <div className="bg-white border-b py-3 shadow-sm">
            <div className="container mx-auto px-4 flex flex-wrap items-center gap-3">

                {/* Nút lọc khu vực */}
                <button className="flex items-center px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    Khu vực
                    <ChevronDown size={16} className="ml-2 text-gray-400" />
                </button>

                {/* Nút lọc mức giá */}
                <button className="flex items-center px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Mức giá
                    <ChevronDown size={16} className="ml-2 text-gray-400" />
                </button>

                {/* Nút lọc loại phòng */}
                <button className="flex items-center px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    Loại phòng
                    <ChevronDown size={16} className="ml-2 text-gray-400" />
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* Nút Bộ lọc nâng cao */}
                <button className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition">
                    <SlidersHorizontal size={16} className="mr-2" />
                    Lọc thêm
                </button>

            </div>
        </div>
    );
};

export default FiltersBar;