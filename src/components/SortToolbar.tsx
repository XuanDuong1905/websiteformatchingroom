import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const SortToolbar = () => {
    return (
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-gray-600 text-sm font-medium">Hiển thị 123 kết quả</span>

            <div className="flex items-center space-x-4">
                {/* Sort dropdown */}
                <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer bg-white">
                    <option>Tin mới nhất</option>
                    <option>Giá: Thấp đến cao</option>
                    <option>Giá: Cao đến thấp</option>
                </select>

                {/* View toggle (List/Grid) */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                    <button className="p-1.5 text-blue-600 bg-gray-50 hover:bg-gray-100 transition" title="Dạng lưới">
                        <LayoutGrid size={18} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition border-l" title="Dạng danh sách">
                        <List size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SortToolbar;