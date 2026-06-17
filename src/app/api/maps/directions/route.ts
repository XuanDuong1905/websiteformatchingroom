import { NextResponse } from "next/server";

const modeMap: Record<string, string> = {
  "driving": "car",
  "walking": "foot",
  "transit": "car" // OSRM public demo doesn't have transit, use car as fallback
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originLat = searchParams.get("originLat");
  const originLng = searchParams.get("originLng");
  const destLat = searchParams.get("destLat");
  const destLng = searchParams.get("destLng");
  const mode = searchParams.get("mode") || "driving";

  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json({ success: false, message: "Thiếu tọa độ" }, { status: 400 });
  }

  const osrmMode = modeMap[mode] || "car";

  try {
    const response = await fetch(
      `http://router.project-osrm.org/route/v1/${osrmMode}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
    );

    const data = await response.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM returns coordinates as [lng, lat], map to [lat, lng] for Leaflet
      const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      
      return NextResponse.json({
        success: true,
        data: {
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
          coordinates
        }
      });
    }

    return NextResponse.json({ success: false, message: "Không tìm thấy đường đi" }, { status: 404 });
  } catch (error) {
    console.error("Lỗi Directions:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
