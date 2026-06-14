"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) setIsVisible(true);
            else setIsVisible(false);
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-600 transition-all z-50 focus:outline-none"
            title="Lên đầu trang"
        >
            <ArrowUp size={20} />
        </button>
    );
};

export default ScrollToTop;