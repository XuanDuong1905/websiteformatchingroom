import React from 'react';
import { MapPin, Camera } from 'lucide-react';
import Link from 'next/link';
import FavoriteRoomButton from '@/components/FavoriteRoomButton';

// Define the shape of the data based on TV3's API documentation
export interface RoomSummary {
        id: number;
        title: string;
        price: number;
        area: string;
        maxPeople: number;
        district: string;
        ward: string;
        address: string;
        images: { imageUrl: string }[];
        _count?: { images: number };
}

interface RoomCardProps {
    room: RoomSummary;
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
            className={
                isList
                    ? "bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors group relative flex flex-row items-start py-4 gap-4 cursor-pointer hover:shadow-[0_0_15px_rgba(0,0,0,0.06)] hover:z-10"
                    : "bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] transition-all group relative flex flex-col h-full cursor-pointer hover:z-10"
            }
        >
            {/* Image Container */}
            <div
                className={`${isList ? 'w-[160px] h-[160px] rounded-md' : 'w-full aspect-square'} bg-gray-200 relative overflow-hidden flex-shrink-0 z-0`}
            >
                <img
                    src={coverImage}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom right photos count */}
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 font-medium">
                    <Camera size={10} />
                    {room._count?.images || room.images?.length || 1}
                </span>
            </div>

            {/* Save/Favorite Button */}
            <div
                className={`absolute ${isList ? 'bottom-4 right-4' : 'top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm'} z-20`}
            >
                <FavoriteRoomButton roomId={room.id} variant="icon" />
            </div>

            {/* Room Info Section */}
            <div className={`flex flex-col flex-grow ${isList ? 'py-0.5 pr-8' : 'p-3'}`}>
                <div className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Nội thất đầy đủ
                </div>
                
                <h3 className={`font-medium text-gray-800 mb-1 leading-snug group-hover:text-cyan-600 transition-colors ${isList ? 'text-base line-clamp-2' : 'text-sm line-clamp-2'}`}>
                    {room.title}
                </h3>

                <div className="flex items-end gap-2 mb-2 mt-0.5">
                    <span className="text-base font-bold text-red-500">{formattedPrice}/tháng</span>
                    <span className="text-[13px] font-medium text-cyan-700 mb-[2px]">{room.area} m²</span>
                </div>

                <div className={`flex items-start text-[12px] text-gray-500 ${isList ? 'mt-1' : 'mt-auto pt-2 border-t border-gray-100'}`}>
                    <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{room.address || room.ward || room.district}</span>
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;
