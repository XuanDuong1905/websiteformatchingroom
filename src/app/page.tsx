"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import FiltersBar from "@/components/FiltersBar";
import SortToolbar from "@/components/SortToolbar";
import RoomCard from "@/components/RoomCard";
import axiosClient from "@/lib/axiosClient";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  // --- FILTER AND DISPLAY STATES ---
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("newest");
  const [isGridView, setIsGridView] = useState(true);

  // Fetch data whenever district, priceRange, sort, or URL search query changes
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);

        // Split priceRange value into minPrice and maxPrice for the API request
        let minPrice = undefined;
        let maxPrice = undefined;
        if (priceRange) {
          const parts = priceRange.split('-');
          minPrice = parts[0];
          maxPrice = parts[1];
        }

        // Get search query from URL search parameters
        const searchQuery = searchParams.get('search') || undefined;

        // Fetch rooms from TV3 API with filter and search parameters
        const response = await axiosClient.get('/api/rooms', {
          params: {
            district: district || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            sort: sort || undefined,
            search: searchQuery
          }
        });

        if (response.data.success) {
          setRooms(response.data.data);
          // TV3 API pagination support
          setTotalRooms(response.data.pagination?.total || response.data.data.length);
        } else {
          setError("Không thể tải danh sách phòng.");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Chưa kết nối được với Server Backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [district, priceRange, sort, searchParams]); // Run effect whenever filter criteria or search query changes

  return (
    <main className="min-h-screen bg-gray-50">
      <GlobalStickyHeader />

      {/* Pass states and setters to FiltersBar */}
      <FiltersBar
        district={district}
        setDistrict={setDistrict}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      {/* Pass states and setters to SortToolbar */}
      <SortToolbar
        total={totalRooms}
        sort={sort}
        setSort={setSort}
        isGridView={isGridView}
        setIsGridView={setIsGridView}
      />

      <div className="container mx-auto px-4 py-6">
        {/* State: Loading */}
        {isLoading && (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Đang tìm kiếm phòng...
          </div>
        )}

        {/* State: Error */}
        {error && !isLoading && (
          <div className="text-center py-10 text-red-500 font-medium bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className={isGridView ? "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "flex flex-col gap-5 max-w-4xl mx-auto w-full"}>
            {rooms.length > 0 ? (
              rooms.map((room: any) => (
                // Pass viewMode based on isGridView state
                <RoomCard key={room.id} room={room} viewMode={isGridView ? 'grid' : 'list'} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">Không tìm thấy phòng nào phù hợp với bộ lọc.</p>
                <button
                  onClick={() => { setDistrict(""); setPriceRange(""); }}
                  className="mt-4 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
    </div>
    </main >
  );
}