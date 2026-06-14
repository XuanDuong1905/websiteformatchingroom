"use client";

import React, { useState } from 'react';
import { Search, Heart, Bell, MessageCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  hideOnScroll?: boolean;
  scrollThreshold?: number;
}

const GlobalStickyHeader = ({ hideOnScroll, scrollThreshold }: HeaderProps) => {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/?search=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Tính năng đang phát triển.");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-cyan-100 transition-transform duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition"
          onClick={() => router.push('/')}
        >
          <span className="text-2xl font-extrabold tracking-tight text-cyan-600">
            Ghép Trọ - Ghép Bạn
          </span>
        </div>

        {/* Center: Search bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm phòng trọ, khu vực, người ở ghép..."
              className="w-full pl-5 pr-12 py-2.5 bg-gray-50 text-gray-800 placeholder-gray-400 rounded-full border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600/30 focus:border-cyan-600 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Right: Icons, buttons, avatar */}
        <div className="flex items-center space-x-4">
          {/* Icon group */}
          <div className="flex items-center space-x-4 text-gray-500">
            <button onClick={handleComingSoon} className="hover:text-red-500 transition relative">
              <Heart size={24} />
            </button>
            <button onClick={handleComingSoon} className="hover:text-cyan-600 transition relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">2</span>
            </button>
            <button onClick={handleComingSoon} className="hover:text-cyan-600 transition">
              <MessageCircle size={24} />
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

          {/* Đăng nhập button */}
          <button
            onClick={() => router.push('/login')}
            className="hidden sm:flex items-center px-4 py-2 border border-cyan-600 text-cyan-600 rounded-xl font-medium hover:bg-cyan-50 active:scale-95 transition-all"
          >
            Đăng nhập
          </button>

          {/* Đăng ký button */}
          <button
            onClick={() => router.push('/register')}
            className="hidden sm:flex items-center px-4 py-2 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 active:scale-95 transition-all shadow-sm hover:shadow"
          >
            Đăng ký
          </button>

          {/* User Profile Avatar - rightmost */}
          <div className="flex items-center cursor-pointer ml-1" onClick={handleComingSoon}>
            <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center border border-cyan-200 hover:border-cyan-400 transition">
              <User size={18} className="text-cyan-600" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default GlobalStickyHeader;