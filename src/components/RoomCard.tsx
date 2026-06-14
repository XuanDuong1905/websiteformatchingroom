import React from 'react';
import { MapPin, Heart, Star, Camera } from 'lucide-react';
import Link from 'next/link';

// Define the shape of the data based on TV3's API documentation
interface RoomCardProps {
    room: {
        id: number;
        title: string;
        price: number;
        area: string;
        maxPeople: number;
        district: string;
        ward: string;
        address: string;
        images: { imageUrl: string }[];
    };
    viewMode?: 'grid' | 'list';
}

const RoomCard = ({ room, viewMode = 'grid' }: RoomCardProps) => {
    const isList = viewMode === 'list';
    
    // Format price to millions if >= 1,000,000
    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            const millions = price / 1000000;
            // Use comma for decimals in Vietnamese
            return millions.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu';
        }
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };
    const formattedPrice = formatPrice(room.price);

    const coverImage = room.images && room.images.length > 0
        ? room.images[0].imageUrl
        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

    return (
        <Link
            href={`/room/${room.id}`}
            // List mode: use flex-row. Grid mode: use flex-col
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] transition-all group relative flex ${isList ? 'flex-col sm:flex-row' : 'flex-col h-full'} cursor-pointer`}
        >
            {/* Save/Favorite Button */}
            <button
                className="absolute top-3 right-3 p-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white hover:text-red-500 hover:bg-white transition z-10 shadow-sm"
                onClick={(e) => {
                    e.preventDefault();
                    alert("Tính năng Lưu tin đang phát triển!");
                }}
            >
                <Heart size={18} />
            </button>

            {/* Image Container */}
            <div
                // List mode: Fixed width image. Grid mode: Square image (aspect-square)
                className={`${isList ? 'w-full sm:w-2/5 md:w-1/3 h-48 sm:h-auto' : 'w-full aspect-square'} bg-gray-200 relative overflow-hidden flex-shrink-0`}
            >
                <img
                    src={coverImage}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom right photos count */}
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 font-medium">
                    <Camera size={12} />
                    {room.images?.length || 1}
                </span>
            </div>

            {/* Room Info Section */}
            <div className={`p-3 flex flex-col flex-grow ${isList ? 'justify-center' : ''}`}>
                <div className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Nội thất đầy đủ
                </div>
                
                <h3 className={`font-medium text-gray-800 mb-1 leading-snug group-hover:text-cyan-600 transition-colors ${isList ? 'text-lg line-clamp-2' : 'text-sm line-clamp-2'}`}>
                    {room.title}
                </h3>

                <div className="flex items-end gap-2 mb-2 mt-0.5">
                    <span className="text-base font-bold text-red-500">{formattedPrice}/tháng</span>
                    <span className="text-[13px] font-medium text-cyan-700 mb-[2px]">{room.area} m²</span>
                </div>

                <div className="mt-auto flex items-start text-[12px] text-gray-500 pt-2 border-t border-gray-100">
                    <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{room.address || room.ward || room.district}</span>
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;