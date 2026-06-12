import React from 'react';
import { Play } from 'lucide-react';

const MediaGallery = () => {
    // Temporary image paths
    const images = [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=300&auto=format&fit=crop"
    ];

    return (
        <div className="w-full mb-6">
            {/* Main large image */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 rounded-xl overflow-hidden group cursor-pointer mb-3">
                <img
                    src={images[0]}
                    alt="Ảnh chính phòng trọ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Mock video badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center text-sm font-medium">
                    <Play size={14} className="mr-1.5 fill-white" />
                    Video
                </div>
            </div>

            {/* Thumbnails carousel */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                    <div key={index} className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent hover:border-gray-300'} transition`}>
                        <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MediaGallery;