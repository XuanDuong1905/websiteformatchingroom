import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import DetailHeader from "@/components/DetailHeader";
import MediaGallery from "@/components/MediaGallery";
import RoomSpecs from "@/components/RoomSpecs";
import AuthorSidebar from "@/components/AuthorSidebar";

export default function RoomDetail() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <DetailHeader />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main content area (Left - takes up 2 cols) */}
                    <div className="lg:col-span-2">
                        <MediaGallery />
                        <RoomSpecs />
                    </div>

                    {/* Sidebar area (Right - takes up 1 col) */}
                    <div className="hidden lg:block relative">
                        <AuthorSidebar riskScore={25} />
                    </div>

                </div>
            </div>
        </main>
    );
}