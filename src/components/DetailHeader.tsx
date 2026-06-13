'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

interface DetailHeaderProps {
  /** Scroll threshold in px before the detail header appears. Default: 120 */
  scrollThreshold?: number;
}

const DetailHeader = ({ scrollThreshold = 120 }: DetailHeaderProps) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-md border-b transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Thumbnail + Summary */}
        <div className="flex items-center space-x-3 max-w-xs md:max-w-sm">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=100&auto=format&fit=crop"
            alt="Thumbnail phòng"
            className="w-10 h-10 rounded-lg object-cover hidden sm:block shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">Phòng trọ ban công siêu thoáng mát...</span>
            <span className="text-sm font-bold text-red-500">3.500.000 đ / tháng</span>
          </div>
        </div>

        {/* Center: Anchor navigation tabs */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-gray-500">
          {['Tổng quan', 'Đặc điểm', 'Mô tả', 'Bản đồ', 'Đánh giá'].map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-5 border-b-2 transition-colors ${i === 0
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-800 hover:border-gray-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right: Contact CTA buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 active:scale-95 transition-all text-sm shadow-sm">
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Chat ngay</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-sm">
            <Phone size={16} />
            <span className="hidden sm:inline">0901***999</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default DetailHeader;