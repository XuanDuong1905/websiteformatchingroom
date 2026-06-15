"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryProps {
    images: { imageUrl: string }[];
}

const MediaGallery = ({ images }: GalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fallback placeholder if no images are available
    if (!images || images.length === 0) {
        return (
            <div className="w-full h-64 sm:h-96 bg-gray-100 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
                <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={40} className="mb-2" />
                    <p>Chưa có hình ảnh</p>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="w-full mb-6">

            {/* Main large image view */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-black rounded-xl overflow-hidden group mb-3">
                <img
                    src={images[currentIndex].imageUrl}
                    alt={`Hình ${currentIndex + 1}`}
                    className="w-full h-full object-contain transition-opacity duration-300"
                />

                {/* Navigation controls (Only visible if multiple images exist) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Image counter badge */}
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails list below */}
            {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition ${index === currentIndex ? 'border-blue-500 opacity-100' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}
                        >
                            <img
                                src={img.imageUrl}
                                alt={`Thu nhỏ ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaGallery;