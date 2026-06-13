'use client';

import React from 'react';
import { Search, Heart, Bell, MessageCircle } from 'lucide-react';

interface GlobalStickyHeaderProps {
  /** If true, the header will hide itself when user scrolls past a threshold (used on detail page) */
  hideOnScroll?: boolean;
  /** Scroll threshold in px before the header hides. Default: 120 */
  scrollThreshold?: number;
}

const GlobalStickyHeader = ({ hideOnScroll = false, scrollThreshold = 120 }: GlobalStickyHeaderProps) => {
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      setHidden(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, scrollThreshold]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white shadow-sm border-b transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Logo + Slogan */}
        <div className="flex flex-col cursor-pointer hover:opacity-80 transition leading-tight">
          <span className="text-xl font-extrabold text-blue-600 tracking-tight">Ghép Trọ</span>
          <span className="text-[10px] font-medium text-gray-400 tracking-wide hidden sm:block">Ghép Bạn · Ghép Tổ Ấm</span>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Tìm kiếm phòng trọ, khu vực, người ở ghép..."
              className="w-full pl-5 pr-12 py-2.5 bg-gray-50 rounded-full border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right: Icons and CTA */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-gray-500">
            <button className="hover:text-red-500 transition relative">
              <Heart size={24} />
            </button>
            <button className="hover:text-blue-600 transition relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">2</span>
            </button>
            <button className="hover:text-blue-600 transition">
              <MessageCircle size={24} />
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

          <button className="hidden sm:flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow">
            Đăng nhập
          </button>
        </div>

      </div>
    </header>
  );
};

export default GlobalStickyHeader;