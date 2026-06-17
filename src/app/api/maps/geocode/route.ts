import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const ward = searchParams.get("ward");
  const district = searchParams.get("district");
  const city = searchParams.get("city") || "TP. Hồ Chí Minh";

  if (!address && !district) {
    return NextResponse.json({ success: false, message: "Thiếu address hoặc district" }, { status: 400 });
  }

  try {
    let searchQueries: string[] = [];
    
    if (address && ward && district) {
      // Remove duplicate ward if address already contains it
      const cleanAddress = address.toLowerCase().includes(ward.toLowerCase()) 
        ? address 
        : `${address}, ${ward}`;
        
      searchQueries = [
        `${cleanAddress}, ${district}, ${city}`,
        `${ward}, ${district}, ${city}`,
        `${district}, ${city}`
      ];
    } else if (address) {
      searchQueries = [address];
    } else if (district) {
      searchQueries = [`${district}, ${city}`];
    }

    let foundData = null;

    for (const query of searchQueries) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
        headers: {
          "User-Agent": "GhepTroDemoApp/1.0"
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        foundData = data[0];
        break; // Stop if we found a match
      }
    }

    if (foundData) {
      return NextResponse.json({
        success: true,
        data: {
          lat: parseFloat(foundData.lat),
          lng: parseFloat(foundData.lon),
          formattedAddress: foundData.display_name
        }
      });
    }

    return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
  } catch (error) {
    console.error("Lỗi Geocode:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
