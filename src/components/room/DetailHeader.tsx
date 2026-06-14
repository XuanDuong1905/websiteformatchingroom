"use client";

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const DetailHeader = ({ scrollThreshold = 120, room }: any) => {
  const [visible, setVisible] = React.useState(false);
  const [showPhone, setShowPhone] = React.useState(false);

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

  if (!room) return null;

  const displayPhone = () => {
      if (!room.owner?.phone) return "Chưa cập nhật";
      if (showPhone) return room.owner.phone;
      return room.owner.phone.slice(0, 4) + " *** ***";
  };

  const formatPrice = (price: number) => {
      if (price >= 1000000) {
          return (price / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu';
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const coverImage = room.images && room.images.length > 0
      ? room.images[0].imageUrl
      : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

  return (
    <header className={`fixed top-0 z-50 w-full bg-white shadow-sm transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 md:px-16 lg:px-40 py-2 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left side: Summary Info */}
        <div className="flex items-center space-x-3 max-w-full sm:max-w-[50%] md:max-w-[60%]">
          <img src={coverImage} alt={room.title} className="w-12 h-12 rounded-md object-cover hidden sm:block" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-800 truncate">{room.title}</span>
            <div className="flex items-center text-xs mt-0.5">
              <span className="font-bold text-red-500 mr-2">{formatPrice(room.price)}/tháng</span>
              <span className="text-gray-500 hidden md:inline">Phòng trọ - Nội thất đầy đủ</span>
            </div>
          </div>
        </div>

        {/* Center: Anchor navigation tabs with scroll behavior - Hidden on small screens to save space */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-500">
          <button onClick={() => scrollToSection('overview')} className="hover:text-cyan-600 transition">Tổng quan</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-cyan-600 transition">Đặc điểm</button>
          <button onClick={() => scrollToSection('description')} className="hover:text-cyan-600 transition">Mô tả & Bản đồ</button>
          <button onClick={() => scrollToSection('reviews')} className="hover:text-cyan-600 transition">Đánh giá</button>
        </div>

        {/* Right side: Call-To-Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button onClick={() => alert("Tính năng chat đang phát triển!")} className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition text-sm">
            <MessageCircle size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button onClick={() => setShowPhone(true)} className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition text-sm">
            <Phone size={16} className="mr-1.5" />
            <span>{showPhone ? displayPhone() : `Hiện số ${displayPhone().slice(0, 4)}***`}</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default DetailHeader;