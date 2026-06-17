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

    // 1. Try Nominatim first
    try {
      for (const query of searchQueries) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          headers: {
            "User-Agent": "GhepTroDemoApp/1.0"
          },
          signal: AbortSignal.timeout(3000)
        });
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          foundData = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            formattedAddress: data[0].display_name
          };
          break;
        }
      }
    } catch (error) {
      console.error("Nominatim Geocode Error:", error);
    }

    // 2. Try Photon Fallback if Nominatim failed or returned empty
    if (!foundData) {
      try {
        for (const query of searchQueries) {
          const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`, {
             signal: AbortSignal.timeout(3000)
          });
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates; // [lon, lat]
            foundData = {
              lat: coords[1],
              lng: coords[0],
              formattedAddress: data.features[0].properties.name || query
            };
            break;
          }
        }
      } catch (error) {
        console.error("Photon Geocode Error:", error);
      }
    }

    if (foundData) {
      return NextResponse.json({
        success: true,
        data: foundData
      });
    }

    return NextResponse.json({ success: false, message: "Không tìm thấy địa chỉ" }, { status: 404 });
  } catch (error) {
    console.error("Lỗi Geocode:", error);
    return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
  }
}
