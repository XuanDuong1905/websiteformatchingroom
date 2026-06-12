import React from 'react';

const GlobalStickyHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Bên trái: Logo */}
        <div className="flex items-center cursor-pointer">
          <span className="text-2xl font-bold text-blue-600">Ghép Trọ</span>
        </div>

        {/* Ở giữa: Thanh tìm kiếm */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm phòng trọ, người ở ghép..." 
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500">
              {/* Icon Kính lúp (Tạm thời dùng text, sau cài thư viện icon sẽ thay) */}
              🔍
            </button>
          </div>
        </div>

        {/* Phải: Icons và Nút CTA */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-blue-600">❤️</button>
          <button className="text-gray-600 hover:text-blue-600">🔔</button>
          <button className="text-gray-600 hover:text-blue-600">💬</button>
          <button className="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition">
            Đăng tin mới
          </button>
        </div>

      </div>
    </header>
  );
};

export default GlobalStickyHeader;