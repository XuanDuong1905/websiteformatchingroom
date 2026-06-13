"use client";

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FiltersProps {
    district: string;
    setDistrict: (val: string) => void;
    priceRange: string;
    setPriceRange: (val: string) => void;
}

const FiltersBar = ({ district, setDistrict, priceRange, setPriceRange }: FiltersProps) => {
    return (
        <div className="bg-white border-b py-3 shadow-sm sticky top-16 z-40">
            <div className="container mx-auto px-4 flex flex-wrap items-center gap-3">

                {/* Location Filter */}
                <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                    <option value="">Tất cả khu vực</option>
                    <option value="Thủ Đức">Thủ Đức</option>
                    <option value="Quận 5">Quận 5</option>
                    <option value="Quận 10">Quận 10</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                </select>

                {/* Price Range Filter */}
                <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                    <option value="">Tất cả mức giá</option>
                    <option value="0-2000000">Dưới 2 triệu</option>
                    <option value="2000000-4000000">2 triệu - 4 triệu</option>
                    <option value="4000000-99999999">Trên 4 triệu</option>
                </select>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* Advanced Filters (Coming Soon) */}
                <button
                    onClick={() => alert("Bộ lọc nâng cao đang phát triển!")}
                    className="flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition"
                >
                    <SlidersHorizontal size={16} className="mr-2" />
                    Lọc thêm
                </button>

            </div>
        </div>
    );
};

export default FiltersBar;