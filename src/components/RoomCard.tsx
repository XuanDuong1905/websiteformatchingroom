import React from 'react';
import { MapPin, Heart } from 'lucide-react';
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
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(room.price);
    const coverImage = room.images && room.images.length > 0
        ? room.images[0].imageUrl
        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

    return (
        <Link
            href={`/room/${room.id}`}
            // List mode: use flex-row on larger screens. Grid mode: use flex-col
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group relative flex ${isList ? 'flex-col sm:flex-row' : 'flex-col h-full'} cursor-pointer`}
        >

            {/* Save/Favorite Button */}
            <button
                className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition z-10 shadow-sm"
                onClick={(e) => {
                    e.preventDefault();
                    alert("Tính năng Lưu tin đang phát triển!");
                }}
            >
                <Heart size={18} />
            </button>

            {/* Image Container */}
            <div
                // List mode: Fixed width image on the left. Grid mode: Full width image on the top.
                className={`${isList ? 'w-full sm:w-2/5 md:w-1/3 h-48 sm:h-auto' : 'w-full h-48'} bg-gray-200 relative overflow-hidden flex-shrink-0`}
            >
                <img
                    src={coverImage}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded font-medium shadow">
                    Phòng trọ
                </span>
            </div>

            {/* Room Info Section */}
            <div className={`p-4 flex flex-col flex-grow ${isList ? 'justify-center' : ''}`}>
                <h3 className={`font-semibold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors ${isList ? 'text-lg line-clamp-2' : 'text-base line-clamp-2'}`}>
                    {room.title}
                </h3>

                <div className="text-xl font-bold text-red-500 mb-2">
                    {formattedPrice} ₫<span className="text-sm font-normal text-gray-500">/tháng</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3 space-x-2 font-medium">
                    <span>{room.area}m²</span>
                    <span className="text-gray-300">•</span>
                    <span>Tối đa {room.maxPeople} người</span>
                </div>

                <div className="mt-auto flex items-start text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{room.address}, {room.ward}, {room.district}</span>
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;