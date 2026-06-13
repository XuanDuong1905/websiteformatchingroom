"use client";

import React, { useState } from 'react';
import { Star, User, Send } from 'lucide-react';

const ReviewSection = () => {
    const [newComment, setNewComment] = useState("");
    // Manage review list (initialized with one sample review)
    const [comments, setComments] = useState([
        {
            id: 1,
            name: "Trần Thị B",
            time: "2 ngày trước",
            text: "Phòng y chang hình, chú chủ nhà rất nhiệt tình và rõ ràng tiền bạc. Hôm qua mình đến xem thấy ưng ý nên đã cọc luôn rồi mọi người nhé.",
            stars: 5
        }
    ]);

    const handleSendComment = () => {
        if (!newComment.trim()) return;

        // Create new review object
        const newReview = {
            id: Date.now(),
            name: "Bạn (Chưa đăng nhập)",
            time: "Vừa xong",
            text: newComment,
            stars: 5 // Default to 5 stars for mock purposes
        };

        // Prepend new review and reset input textarea
        setComments([newReview, ...comments]);
        setNewComment("");

        // Alert user of mockup status and future integration
        alert("Bình luận đã hiển thị! (Luồng lưu vào Database sẽ được kích hoạt sau khi ghép API Đăng nhập của TV5)");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá & Thảo luận</h2>

            <div className="space-y-6">

                {/* Render review list */}
                {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4 border-b border-gray-100 pb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                                <span className="text-xs text-gray-500 ml-4">{comment.time}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(comment.stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
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
                            className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition"
                            rows={3}
                            placeholder="Viết đánh giá hoặc đặt câu hỏi về phòng trọ này... (Nhấn Enter để gửi)"
                        ></textarea>
                        <button
                            onClick={handleSendComment}
                            className="absolute right-3 bottom-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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