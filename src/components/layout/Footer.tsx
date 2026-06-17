import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
            <div className="container mx-auto px-4 md:px-16 lg:px-40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm text-gray-500 leading-relaxed">
                    <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-cyan-600 mb-4">Ghép Trọ - Ghép Bạn</h3>
                        <p className="mb-4">
                            Nền tảng tìm kiếm phòng trọ và người ở ghép minh bạch, an toàn dành cho sinh viên.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">Về chúng tôi</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Giới thiệu dự án</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Quy chế hoạt động</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">Hỗ trợ</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Trung tâm trợ giúp</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Quy định đăng tin</a></li>
                            <li><a href="#" className="hover:text-cyan-600 transition-colors">Liên hệ: contact@us.vn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center pt-6 border-t border-gray-100 text-gray-400 text-xs">
                    © {new Date().getFullYear()} Đồ án Môn học - Nhóm 5. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;