"use client";

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface SortProps {
    total: number;
    sort: string;
    setSort: (val: string) => void;
    isGridView: boolean;
    setIsGridView: (val: boolean) => void;
}

const SortToolbar = ({ total, sort, setSort, isGridView, setIsGridView }: SortProps) => {
    return (
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">Hiển thị {total} kết quả</span>

            <div className="flex items-center space-x-4">
                {/* Sort options dropdown */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                >
                    <option value="newest">Tin mới nhất</option>
                    <option value="price_asc">Giá: Thấp đến cao</option>
                    <option value="price_desc">Giá: Cao đến thấp</option>
                </select>

                {/* View mode toggler (Grid/List) */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`p-1.5 transition ${isGridView ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        title="Dạng lưới"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`p-1.5 border-l transition ${!isGridView ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
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