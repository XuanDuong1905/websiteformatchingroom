import GlobalStickyHeader from "@/components/GlobalStickyHeader";
import DetailHeader from "@/components/DetailHeader";
import MediaGallery from "@/components/MediaGallery";
import RoomSpecs from "@/components/RoomSpecs";
import DescriptionMap from "@/components/DescriptionMap";
import ReviewSection from "@/components/ReviewSection";
import AuthorSidebar from "@/components/AuthorSidebar";

export default function RoomDetail() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Global header: visible initially, slides up when scrolled */}
            <GlobalStickyHeader hideOnScroll scrollThreshold={120} />

            {/* Detail header: hidden initially, slides down when scrolled */}
            <DetailHeader scrollThreshold={120} />

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main content area (Left) */}
                    <div className="lg:col-span-2">
                        <MediaGallery />
                        <RoomSpecs />
                        <DescriptionMap />
                        <ReviewSection />
                    </div>

                    {/* Sidebar area (Right) */}
                    <div className="hidden lg:block relative">
                        <AuthorSidebar riskScore={25} />
                    </div>

                </div>
            </div>
        </main>
    );
}