import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import FiltersBar from "@/components/FiltersBar";
import SortToolbar from "@/components/SortToolbar";
import RoomCard from "@/components/RoomCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <GlobalStickyHeader />
      <FiltersBar />

      <SortToolbar />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <RoomCard key={item} />
          ))}
        </div>
      </div>
    </main>
  );
}