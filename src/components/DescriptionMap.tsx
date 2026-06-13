import React from 'react';
import { Map, MapPin } from 'lucide-react';

const DescriptionMap = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">

            {/* Description Section */}
            <div className="mb-8 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
                <div className="text-gray-700 leading-relaxed space-y-3 text-sm">
                    <p>
                        Phòng trọ mới xây, sạch sẽ, an ninh cực tốt. Nằm ngay khu vực sầm uất, an toàn cho sinh viên.
                        Xung quanh bán kính 500m có đầy đủ chợ, cửa hàng tiện lợi và các quán ăn sinh viên giá rẻ.
                    </p>
                    <p>
                        - Vị trí đắc địa: Cách Ký túc xá Khu B ĐHQG chỉ tầm 5 phút đi xe máy, rất thuận tiện cho các bạn đi học tại các trường trong khối.
                        <br />
                        - Giờ giấc tự do, cấp chìa khóa riêng và sử dụng khóa vân tay cổng chính.
                        <br />
                        - Không chung chủ, chỗ để xe rộng rãi miễn phí dưới tầng trệt.
                    </p>
                </div>
                <button className="text-blue-600 font-medium mt-3 hover:underline text-sm transition">
                    Xem thêm
                </button>
            </div>

            {/* Map Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Map className="w-5 h-5 mr-2 text-gray-500" />
                    Bản đồ khu vực
                </h2>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" />
                    Khu phố 6, Phường Linh Trung, TP. Thủ Đức
                </div>

                {/* Placeholder for actual Map integration */}
                <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-300">
                    <Map className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm font-medium">[ Google Maps Integration Placeholder ]</span>
                </div>
            </div>

        </div>
    );
};

export default DescriptionMap;