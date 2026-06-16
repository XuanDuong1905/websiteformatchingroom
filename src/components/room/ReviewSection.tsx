"use client";

import React, { useState, useEffect } from 'react';
import { Star, User, Send } from 'lucide-react';
import { getStoredUserId } from '@/lib/auth/storage';

type Review = {
    id: number;
    reviewer: { fullName: string };
    createdAt: string;
    comment: string;
    rating: number;
};

const ReviewSection = ({ roomId }: { roomId: number }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch(`/api/rooms/${roomId}/reviews`);
                const json = await res.json();
                if (json.success) {
                    setComments(json.data);
                }
            } catch (error) {
                console.error("Failed to load reviews", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, [roomId]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        const reviewerId = getStoredUserId();
        if (!reviewerId) {
            alert("Bạn cần đăng nhập để viết bình luận!");
            return;
        }

        try {
            const res = await fetch(`/api/rooms/${roomId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewerId,
                    rating: 5, // Default to 5 stars for now
                    comment: newComment,
                })
            });

            const json = await res.json();
            if (json.success) {
                setComments([json.data, ...comments]);
                setNewComment("");
                alert("Đăng bình luận thành công!");
            } else {
                alert(json.message || "Không thể đăng bình luận.");
            }
        } catch (error) {
            console.error("Failed to post review", error);
            alert("Đã xảy ra lỗi khi đăng bình luận.");
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Bình luận</h2>

            <div className="space-y-6">

                {/* Render review list */}
                {isLoading ? (
                    <p className="text-gray-500 text-sm">Đang tải bình luận...</p>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Chưa có bình luận nào cho phòng này.</p>
                ) : comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4 border-b border-gray-100 pb-6">
                        <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{comment.reviewer?.fullName || "Người dùng ẩn danh"}</h4>
                                <span className="text-xs text-gray-500 ml-4">{formatDate(comment.createdAt)}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(comment.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                        </div>
                    </div>
                ))}

                {/* New review input form */}
                <div className="flex space-x-4 pt-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-grow relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendComment();
                                }
                            }}
                            className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 resize-none transition"
                            rows={3}
                            placeholder="Viết đánh giá hoặc đặt câu hỏi về phòng trọ này... (Nhấn Enter để gửi)"
                        ></textarea>
                        <button
                            onClick={handleSendComment}
                            className="absolute right-3 bottom-3 p-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReviewSection;