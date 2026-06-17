import React from "react";

export function ConversationListSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center shadow-sm">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="ml-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-6">
        <div className="flex justify-start">
          <div className="w-2/3 h-16 bg-gray-200 rounded-2xl rounded-bl-none"></div>
        </div>
        <div className="flex justify-end">
          <div className="w-1/2 h-12 bg-cyan-100 rounded-2xl rounded-br-none"></div>
        </div>
        <div className="flex justify-start">
          <div className="w-3/4 h-20 bg-gray-200 rounded-2xl rounded-bl-none"></div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="h-12 bg-gray-200 rounded-full w-full"></div>
      </div>
    </div>
  );
}
