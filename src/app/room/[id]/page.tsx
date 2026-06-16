"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import GlobalStickyHeader from "@/components/layout/GlobalStickyHeader";
import DetailHeader from "@/components/room/DetailHeader";
import MediaGallery from "@/components/room/MediaGallery";
import RoomSpecs from "@/components/room/RoomSpecs";
import DescriptionMap from "@/components/room/DescriptionMap";
import ReviewSection from "@/components/room/ReviewSection";
import AuthorSidebar from "@/components/room/AuthorSidebar";
import axiosClient from "@/lib/axiosClient";

interface RoomDetailData {
    id: number;
    title: string;
    price: number;
    area: number | string;
    deposit?: number | null;
    maxPeople: number;
    address: string;
    district: string;
    ward: string;
    description: string;
    electricityFee?: number | null;
    waterFee?: number | null;
    hasContract?: boolean;
    minStayMonths?: number | null;
    riskScore: number;
    images: { imageUrl: string }[];
    owner: {
        fullName: string;
        phone: string;
        avatarUrl: string;
    };
}

export default function RoomDetail() {
    const params = useParams(); // Get room ID from URL params
    const [room, setRoom] = useState<RoomDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setIsLoading(true);
                // Call GET /api/rooms/:id to fetch specific room details
                const response = await axiosClient.get(`/api/rooms/${params.id}`);

                if (response.data.success) {
                    setRoom(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết phòng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchRoomDetail();
        }
    }, [params.id]);

    // Loading state
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    // Error state if room is not found
    if (!room) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Không tìm thấy thông tin phòng!</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Global header: visible initially, slides up when scrolled */}
            <GlobalStickyHeader hideOnScroll scrollThreshold={120} />

            {/* Detail header: hidden initially, slides down when scrolled */}
            <DetailHeader scrollThreshold={120} room={room} />

            <div className="container mx-auto px-4 md:px-16 lg:px-40 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main content area (Left) */}
                    <div className="lg:col-span-2">
                        <div id="overview"><MediaGallery images={room.images} /></div>
                        <div id="features"><RoomSpecs room={room} /></div>
                        <div id="description">
                            <DescriptionMap
                                description={room.description}
                                address={room.address}
                                district={room.district}
                                ward={room.ward}
                            />
                        </div>
                        <div id="reviews"><ReviewSection roomId={room.id} /></div>
                    </div>

                    {/* Sidebar area (Right) */}
                    <div className="hidden lg:block relative">
                        {/* Real owner information and risk score passed to sidebar */}
                        <AuthorSidebar roomId={room.id} riskScore={room.riskScore} owner={room.owner} />
                    </div>

                </div>
            </div>
        </main>
    );
}
