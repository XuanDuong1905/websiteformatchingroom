import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-10 pb-6 mt-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm text-gray-600">
                    <div>
                        <h3 className="font-bold text-lg text-blue-600 mb-4 tracking-tight">Ghép Trọ - Ghép Bạn</h3>
                        <p className="mb-2">Nền tảng tìm kiếm phòng trọ và người ở ghép an toàn, minh bạch dành cho sinh viên.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Về chúng tôi</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-600 transition">Giới thiệu dự án</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Quy chế hoạt động</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Hỗ trợ</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-600 transition">Trung tâm trợ giúp</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Quy định đăng tin</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Liên hệ: contact@gheptrto.vn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center pt-6 border-t border-gray-100 text-gray-500 text-xs">
                    © {new Date().getFullYear()} Đồ án Môn học - Nhóm 6. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;