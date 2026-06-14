"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, List, ChevronDown, Check } from 'lucide-react';

interface SortProps {
    total: number;
    sort: string;
    setSort: (val: string) => void;
    isGridView: boolean;
    setIsGridView: (val: boolean) => void;
}

const sortOptions = [
    { value: 'newest', label: 'Tin mới nhất' },
    { value: 'price_asc', label: 'Giá: Thấp đến cao' },
    { value: 'price_desc', label: 'Giá: Cao đến thấp' },
];

const SortToolbar = ({ total, sort, setSort, isGridView, setIsGridView }: SortProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || 'Tin mới nhất';

    return (
        <div className="container mx-auto px-4 md:px-16 lg:px-40 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">Hiển thị {total} kết quả</span>

            <div className="flex items-center space-x-4">
                {/* Custom Sort Popover */}
                <div className="relative" ref={popoverRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all ${isOpen || sort !== 'newest' ? 'border-cyan-600 text-cyan-600 bg-cyan-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        {currentSortLabel}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-50">
                            <div className="py-2">
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => { setSort(option.value); setIsOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${sort === option.value ? 'text-cyan-600 font-medium bg-cyan-50/50' : 'text-gray-700'}`}
                                    >
                                        {option.label}
                                        {sort === option.value && <Check size={16} className="text-cyan-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* View mode toggler (Grid/List) */}
                <div className="flex border border-gray-300 rounded-full overflow-hidden bg-white shadow-sm p-0.5">
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`px-3 py-1.5 rounded-full transition-all ${isGridView ? 'text-cyan-600 bg-cyan-50 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        title="Dạng lưới"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`px-3 py-1.5 rounded-full transition-all ${!isGridView ? 'text-cyan-600 bg-cyan-50 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        title="Dạng danh sách"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SortToolbar;