"use client"; // Required for Next.js to use React Hooks (useEffect, useState)

import { useEffect, useState } from 'react';
import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import FiltersBar from "@/components/FiltersBar";
import SortToolbar from "@/components/SortToolbar";
import RoomCard from "@/components/RoomCard";
import axiosClient from "@/lib/axiosClient";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        // Call GET /api/rooms as documented by TV3
        const response = await axiosClient.get('/api/rooms');

        if (response.data.success) {
          setRooms(response.data.data);
        } else {
          setError("Failed to load rooms data.");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Make sure backend is running. Cannot connect to server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <GlobalStickyHeader />
      <FiltersBar />

      <SortToolbar />

      <div className="container mx-auto px-4 py-6">
        {/* State: Loading */}
        {isLoading && (
          <div className="text-center py-10 text-gray-500">Loading rooms...</div>
        )}

        {/* State: Error */}
        {error && !isLoading && (
          <div className="text-center py-10 text-red-500 font-medium bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* State: Success and Display Data */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room: any) => (
                <RoomCard key={room.id} room={room} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                Không tìm thấy phòng nào phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}