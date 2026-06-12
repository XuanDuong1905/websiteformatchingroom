import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import FiltersBar from "@/components/FiltersBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <GlobalStickyHeader />
      <FiltersBar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl">Nội dung trang danh sách phòng sẽ nằm ở đây...</h1>
      </div>
    </main>
  );
}