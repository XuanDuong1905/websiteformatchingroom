"use client";

import React, { useEffect, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import MapCategoryFilter, { PlaceCategory } from "./MapCategoryFilter";
import NearbyPlaceCard from "./NearbyPlaceCard";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";

// Fix missing marker icons in leaflet + webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const roomIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const placeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper: calculate straight-line distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Map Updater Component
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

interface RoomLocationMapProps {
  address: string;
  district: string;
  ward: string;
  roomTitle: string;
}

export default function RoomLocationMap({ address, district, ward, roomTitle }: RoomLocationMapProps) {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesCache, setPlacesCache] = useState<Record<string, any[]>>({});

  const [route, setRoute] = useState<number[][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number, destName?: string} | null>(null);
  const [routeDest, setRouteDest] = useState<[number, number] | null>(null);

  // Search destination
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 1. Geocode room address
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const queryParams = new URLSearchParams({
          address: address || "",
          ward: ward || "",
          district: district || "",
          city: "TP. Hồ Chí Minh"
        });
        
        const res = await fetch(`/api/maps/geocode?${queryParams.toString()}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setCenter([data.data.lat, data.data.lng]);
        } else {
          setError("Không thể xác định vị trí phòng trọ trên bản đồ.");
        }
      } catch (err) {
        setError("Lỗi khi tải bản đồ.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinates();
  }, [address, ward, district]);

  // 2. Fetch Nearby Places when category changes (with cache)
  useEffect(() => {
    if (!category || !center) {
      setPlaces([]);
      return;
    }

    // Check cache first
    if (placesCache[category]) {
      setPlaces(placesCache[category]);
      return;
    }

    const fetchPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const res = await fetch(`/api/maps/nearby?lat=${center[0]}&lng=${center[1]}&type=${category}&radius=3000`);
        const data = await res.json();
        if (data.success) {
          // Sort by distance and add distance info
          const withDistance = data.data
            .map((p: any) => ({
              ...p,
              distance: haversineKm(center[0], center[1], p.lat, p.lng)
            }))
            .sort((a: any, b: any) => a.distance - b.distance);
          
          setPlaces(withDistance);
          setPlacesCache(prev => ({ ...prev, [category]: withDistance }));
        }
      } catch (err) {
        console.error("Lỗi lấy tiện ích", err);
      } finally {
        setLoadingPlaces(false);
      }
    };
    fetchPlaces();
  }, [category, center, placesCache]);

  // 3. Draw Route to a place
  const drawRouteToPlace = useCallback(async (placeLat: number, placeLng: number, placeName?: string) => {
    if (!center) return;
    try {
      const res = await fetch(`/api/maps/directions?originLat=${center[0]}&originLng=${center[1]}&destLat=${placeLat}&destLng=${placeLng}&mode=driving`);
      const data = await res.json();
      if (data.success) {
        setRoute(data.data.coordinates);
        setRouteInfo({
          distance: data.data.distance,
          duration: data.data.duration,
          destName: placeName
        });
        setRouteDest([placeLat, placeLng]);
      } else {
        alert("Không thể tìm đường đến địa điểm này.");
      }
    } catch (error) {
      alert("Lỗi tìm đường.");
    }
  }, [center]);

  // 4. Search destination by name
  const handleSearchRoute = async () => {
    if (!searchText.trim() || !center) return;
    setIsSearching(true);
    try {
      const geoRes = await fetch(`/api/maps/geocode?address=${encodeURIComponent(searchText.trim() + ", TP. Hồ Chí Minh")}`);
      const geoData = await geoRes.json();
      if (geoData.success && geoData.data) {
        await drawRouteToPlace(geoData.data.lat, geoData.data.lng, searchText.trim());
      } else {
        alert(`Không tìm thấy địa điểm "${searchText}". Hãy thử tên cụ thể hơn.`);
      }
    } catch (e) {
      alert("Lỗi khi tìm kiếm địa điểm.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
    setRouteDest(null);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-200">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Đang tải bản đồ...</p>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 text-red-500">
        {error || "Không thể hiển thị bản đồ"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapCategoryFilter activeCategory={category} onSelect={(cat) => { setCategory(cat); clearRoute(); }} />

      <div className="flex flex-col lg:flex-row gap-4 h-[520px] z-0">
        {/* Map Container */}
        <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden border border-gray-300 relative z-0">
          <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} zoom={route ? 13 : 15} />

            {/* Room Marker */}
            <Marker position={center} icon={roomIcon}>
              <Popup>
                <strong>{roomTitle}</strong><br/>
                {address}, {ward}, {district}
              </Popup>
            </Marker>

            {/* Destination Marker */}
            {routeDest && (
              <Marker position={routeDest} icon={destIcon}>
                <Popup><strong>{routeInfo?.destName || "Điểm đến"}</strong></Popup>
              </Marker>
            )}

            {/* Places Markers */}
            {places.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon}>
                <Popup>
                  <strong>{p.name}</strong>
                  {p.distance !== undefined && (
                    <><br/><span style={{ fontSize: '11px', color: '#666' }}>{p.distance < 1 ? `${Math.round(p.distance * 1000)}m` : `${p.distance.toFixed(1)}km`}</span></>
                  )}
                  <br/>
                  <button 
                    onClick={() => drawRouteToPlace(p.lat, p.lng, p.name)}
                    style={{ marginTop: '6px', fontSize: '12px', color: '#0891b2', textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                  >
                    Chỉ đường từ phòng trọ
                  </button>
                </Popup>
              </Marker>
            ))}

            {/* Route Polyline */}
            {route && <Polyline positions={route as any} color="#0891b2" weight={5} opacity={0.7} />}
          </MapContainer>

          {/* Route Info Overlay */}
          {routeInfo && (
            <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-[220px]">
              {routeInfo.destName && (
                <p className="text-xs text-cyan-700 font-semibold mb-1 truncate">→ {routeInfo.destName}</p>
              )}
              <p className="text-sm font-bold text-gray-800">
                {(routeInfo.distance / 1000).toFixed(1)} km
              </p>
              <p className="text-xs text-gray-500">
                ~{Math.round(routeInfo.duration / 60)} phút lái xe
              </p>
              <button 
                onClick={clearRoute}
                className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Xoá tuyến đường
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col h-full z-10">
          {/* Search Destination Input */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tìm đường đến địa điểm</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchRoute()}
                placeholder="VD: Đại học Bách Khoa, Chợ Bến Thành..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={handleSearchRoute}
                disabled={isSearching || !searchText.trim()}
                className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Places List */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            {loadingPlaces ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin mb-2" />
                <p className="text-xs text-gray-500">Đang tìm kiếm tiện ích...</p>
              </div>
            ) : places.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Tìm thấy {places.length} địa điểm</p>
                {places.map((p) => (
                  <NearbyPlaceCard 
                    key={p.id} 
                    place={p} 
                    onClick={() => drawRouteToPlace(p.lat, p.lng, p.name)} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                {category ? (
                  <>
                    <p className="text-sm text-gray-500">Không tìm thấy địa điểm nào trong bán kính 3km.</p>
                    <p className="text-xs text-gray-400 mt-1">Hãy thử tìm kiếm thủ công ở ô phía trên.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Chọn danh mục ở trên để khám phá tiện ích xung quanh</p>
                    <p className="text-xs text-gray-400 mt-1">hoặc nhập tên địa điểm để tìm đường</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
