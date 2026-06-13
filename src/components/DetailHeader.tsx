"use client";

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const DetailHeader = ({ scrollThreshold = 120 }: any) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  // Smooth scroll handler for anchor sections
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Subtract 100px offset so the sticky header does not block content headers
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left side: Summary Info */}
        <div className="flex items-center space-x-3 max-w-xs md:max-w-sm">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 truncate">Chi tiết phòng trọ</span>
          </div>
        </div>

        {/* Center: Anchor navigation tabs with scroll behavior */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-500">
          <button onClick={() => scrollToSection('overview')} className="hover:text-blue-600 py-5 transition">Tổng quan</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 py-5 transition">Đặc điểm</button>
          <button onClick={() => scrollToSection('description')} className="hover:text-blue-600 py-5 transition">Mô tả & Bản đồ</button>
          <button onClick={() => scrollToSection('reviews')} className="hover:text-blue-600 py-5 transition">Đánh giá</button>
        </div>

        {/* Right side: Call-To-Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button onClick={() => alert("Tính năng chat đang phát triển!")} className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition text-sm">
            <MessageCircle size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Chat ngay</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default DetailHeader;