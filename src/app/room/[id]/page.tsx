import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import DetailHeader from "@/components/DetailHeader";
import MediaGallery from "@/components/MediaGallery";

export default function RoomDetail() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <DetailHeader />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2">
                        <MediaGallery />
                    </div>

                    <div className="hidden lg:block relative">
                        <div className="sticky top-24 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Tác giả & Liên hệ</h3>
                            <p className="text-sm text-gray-500">Phần sidebar tác giả...</p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}