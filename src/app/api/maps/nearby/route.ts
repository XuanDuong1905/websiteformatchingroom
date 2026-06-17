import { NextResponse } from "next/server";

// Use nwr (node, way, relation) to capture all types of POIs
const categoryMap: Record<string, string[]> = {
  "food": [
    'nwr["amenity"="restaurant"]',
    'nwr["amenity"="cafe"]', 
    'nwr["amenity"="fast_food"]',
    'nwr["amenity"="food_court"]',
    'nwr["shop"="bakery"]',
  ],
  "convenience": [
    'nwr["shop"="convenience"]',
    'nwr["shop"="supermarket"]',
    'nwr["shop"="mall"]',
    'nwr["shop"="department_store"]',
    'nwr["shop"="general"]',
  ],
  "life": [
    'nwr["amenity"="pharmacy"]',
    'nwr["amenity"="hospital"]',
    'nwr["amenity"="clinic"]',
    'nwr["amenity"="atm"]',
    'nwr["amenity"="bank"]',
    'nwr["shop"="laundry"]',
    'nwr["amenity"="dentist"]',
  ],
  "transit": [
    'nwr["highway"="bus_stop"]',
    'nwr["amenity"="bus_station"]',
    'nwr["public_transport"="station"]',
    'nwr["public_transport"="stop_position"]',
    'nwr["amenity"="parking"]',
  ],
  "education": [
    'nwr["amenity"="university"]',
    'nwr["amenity"="college"]',
    'nwr["amenity"="school"]',
    'nwr["amenity"="library"]',
    'nwr["amenity"="kindergarten"]',
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const type = searchParams.get("type");
  const radius = searchParams.get("radius") || "2000";

  if (!lat || !lng || !type || !categoryMap[type]) {
    return NextResponse.json({ success: false, message: "Thiếu tham số hợp lệ" }, { status: 400 });
  }

  const queries = categoryMap[type].map(t => `${t}(around:${radius},${lat},${lng});`).join("");
  const overpassQuery = `[out:json][timeout:30];(${queries});out center 30;`;

  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "GhepTroDemoApp/1.0",
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!data.elements) {
      return NextResponse.json({ success: true, data: [] });
    }

    const places = data.elements
      .filter((el: any) => {
        // Must have coordinates (directly or via center)
        const hasCoords = (el.lat && el.lon) || (el.center?.lat && el.center?.lon);
        return hasCoords;
      })
      .map((el: any) => ({
        id: el.id,
        name: el.tags?.name || el.tags?.["name:vi"] || "Không rõ tên",
        type: el.tags?.amenity || el.tags?.shop || el.tags?.highway || el.tags?.public_transport || type,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        address: el.tags?.["addr:street"] 
          ? `${el.tags?.["addr:housenumber"] || ""} ${el.tags?.["addr:street"]}`.trim() 
          : undefined,
      }));

    return NextResponse.json({
      success: true,
      data: places
    });
  } catch (error) {
    console.error("Lỗi Nearby Places:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
