"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';

interface FiltersProps {
    district: string;
    setDistrict: (val: string) => void;
    priceRange: string;
    setPriceRange: (val: string) => void;
}

const LOCATIONS = ["Thủ Đức", "Quận 1", "Quận 3", "Quận 5", "Quận 10", "Bình Thạnh", "Gò Vấp", "Tân Bình"];

const FiltersBar = ({ district, setDistrict, priceRange, setPriceRange }: FiltersProps) => {
    const [activePopover, setActivePopover] = useState<'location' | 'price' | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Local states for Price
    const [localMin, setLocalMin] = useState<string>("");
    const [localMax, setLocalMax] = useState<string>("");

    // Local state for Location search
    const [locSearch, setLocSearch] = useState("");

    // Sync local state when popover opens
    useEffect(() => {
        if (activePopover === 'price') {
            if (priceRange) {
                const parts = priceRange.split('-');
                if (parts.length === 2) {
                    setLocalMin(parts[0] !== '0' ? parts[0] : "");
                    setLocalMax(parts[1] !== '99999999' ? parts[1] : "");
                }
            } else {
                setLocalMin("");
                setLocalMax("");
            }
        }
    }, [activePopover, priceRange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleApplyPrice = () => {
        const min = localMin ? parseInt(localMin.replace(/\D/g, ''), 10) : 0;
        const max = localMax ? parseInt(localMax.replace(/\D/g, ''), 10) : 99999999;
        setPriceRange(`${min}-${max}`);
        setActivePopover(null);
    };

    const handleClearPrice = () => {
        setLocalMin("");
        setLocalMax("");
        setPriceRange("");
        setActivePopover(null);
    };

    const formatCurrency = (val: string) => {
        const num = val.replace(/\D/g, '');
        if (!num) return "";
        return new Intl.NumberFormat('vi-VN').format(parseInt(num, 10));
    };

    const filteredLocations = LOCATIONS.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase()));

    const getPriceLabel = () => {
        if (!priceRange) return "Mức giá";
        const [min, max] = priceRange.split('-');
        if (min === '0' && max === '99999999') return "Mức giá";
        if (min === '0') return `Dưới ${formatCurrency(max)}đ`;
        if (max === '99999999') return `Trên ${formatCurrency(min)}đ`;
        return `${formatCurrency(min)}đ - ${formatCurrency(max)}đ`;
    };

    return (
        <div className="bg-white border-b py-3 shadow-sm sticky top-16 z-40">
            <div className="container mx-auto px-4 md:px-16 lg:px-40 flex flex-wrap items-center gap-3" ref={popoverRef}>

                {/* Location Popover */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'location' ? null : 'location')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all ${activePopover === 'location' || district ? 'border-cyan-600 text-cyan-600 bg-cyan-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        {district || "Khu vực"}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${activePopover === 'location' ? 'rotate-180' : ''}`} />
                    </button>
                    {activePopover === 'location' && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Khu vực</h3>
                                <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-3">
                                <div className="relative mb-3">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Nhập tìm khu vực"
                                        value={locSearch}
                                        onChange={e => setLocSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-600/30 transition-all"
                                    />
                                </div>
                                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {filteredLocations.map(loc => (
                                        <label key={loc} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition">
                                            <span className="text-gray-700 text-sm">{loc}</span>
                                            <input
                                                type="radio"
                                                name="district"
                                                checked={district === loc}
                                                onChange={() => {
                                                    setDistrict(loc);
                                                    setActivePopover(null);
                                                }}
                                                className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 focus:ring-cyan-600 accent-cyan-600 cursor-pointer"
                                            />
                                        </label>
                                    ))}
                                    {filteredLocations.length === 0 && (
                                        <p className="text-center text-sm text-gray-500 py-4">Không tìm thấy khu vực.</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-3 border-t border-gray-100">
                                <button
                                    onClick={() => { setDistrict(""); setActivePopover(null); }}
                                    className="w-full py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Xóa lọc
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Popover */}
                <div className="relative">
                    <button
                        onClick={() => setActivePopover(activePopover === 'price' ? null : 'price')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all ${activePopover === 'price' || priceRange ? 'border-cyan-600 text-cyan-600 bg-cyan-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        {getPriceLabel()}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${activePopover === 'price' ? 'rotate-180' : ''}`} />
                    </button>
                    {activePopover === 'price' && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Khoảng giá</h3>
                                <button onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <label className="block text-xs text-gray-500 mb-1">Giá thuê tối thiểu</label>
                                        <input
                                            type="text"
                                            value={formatCurrency(localMin)}
                                            onChange={e => setLocalMin(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
                                        />
                                        <span className="absolute right-3 bottom-2 text-gray-500 text-sm font-medium">đ</span>
                                    </div>
                                    <span className="text-gray-400 mt-4">-</span>
                                    <div className="flex-1 relative">
                                        <label className="block text-xs text-gray-500 mb-1">Giá thuê tối đa</label>
                                        <input
                                            type="text"
                                            value={formatCurrency(localMax)}
                                            onChange={e => setLocalMax(e.target.value)}
                                            placeholder="100.000.000"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
                                        />
                                        <span className="absolute right-3 bottom-2 text-gray-500 text-sm font-medium">đ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={handleClearPrice}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Xóa lọc
                                </button>
                                <button
                                    onClick={handleApplyPrice}
                                    className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition shadow-sm"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* Advanced Filters (Coming Soon) */}
                <button
                    onClick={() => alert("Bộ lọc nâng cao đang phát triển!")}
                    className="flex items-center px-4 py-2 border border-cyan-200 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium hover:bg-cyan-100 transition"
                >
                    <SlidersHorizontal size={16} className="mr-2" />
                    Lọc thêm
                </button>

            </div>
        </div>
    );
};

export default FiltersBar;