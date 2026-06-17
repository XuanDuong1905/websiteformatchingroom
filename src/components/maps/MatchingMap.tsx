"use client";

import React, { useEffect, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { type MatchItem } from "@/lib/api/matchApi";
import { MapPin, Filter, MessageCircle, User as UserIcon, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";

// Fix missing marker icons in leaflet + webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function getMarkerColor(score: number) {
  if (score >= 90) return "green";
  if (score >= 70) return "blue";
  if (score >= 50) return "gold";
  return "grey";
}

function createColoredIcon(color: string) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

const icons = {
  green: createColoredIcon("green"),
  blue: createColoredIcon("blue"),
  gold: createColoredIcon("gold"),
  grey: createColoredIcon("grey"),
};

// Map Updater Component
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

interface MatchingMapProps {
  matches: MatchItem[];
  currentUserLocation?: [number, number] | null;
  onSelectMatch: (match: MatchItem) => void;
}

export default function MatchingMap({ matches, currentUserLocation, onSelectMatch }: MatchingMapProps) {
  const router = useRouter();
  
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterDistance, setFilterDistance] = useState<number>(0); // 0 = all
  const [filterStudent, setFilterStudent] = useState<boolean>(false);

  // HCM center by default
  const [center, setCenter] = useState<[number, number]>(currentUserLocation || [10.8231, 106.6297]);
  const [zoom, setZoom] = useState(12);

  // Helper: calculate straight-line distance in km
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (!m.user.latitude || !m.user.longitude) return false;

      // Filter Gender
      if (filterGender !== "all" && m.user.gender !== filterGender) return false;
      
      // Filter Student
      if (filterStudent && !m.user.school) return false;

      // Filter Distance
      if (filterDistance > 0 && currentUserLocation) {
        const dist = haversineKm(currentUserLocation[0], currentUserLocation[1], m.user.latitude, m.user.longitude);
        if (dist > filterDistance) return false;
      }

      return true;
    });
  }, [matches, filterGender, filterDistance, filterStudent, currentUserLocation]);

  useEffect(() => {
    if (currentUserLocation) {
      setCenter(currentUserLocation);
      setZoom(13);
    } else if (filteredMatches.length > 0 && filteredMatches[0].user.latitude && filteredMatches[0].user.longitude) {
      setCenter([filteredMatches[0].user.latitude, filteredMatches[0].user.longitude]);
      setZoom(12);
    }
  }, [currentUserLocation]);

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100 flex flex-col md:flex-row">
      
      {/* Map Area */}
      <div className="flex-1 h-full z-0 relative">
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} zoom={zoom} />
          
          {currentUserLocation && (
            <Marker position={currentUserLocation} icon={icons.blue}>
              <Popup>
                <div className="text-sm font-semibold">Vị trí của bạn</div>
              </Popup>
            </Marker>
          )}

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
          >
            {filteredMatches.map((match) => {
              const lat = match.user.latitude!;
              const lng = match.user.longitude!;
              const color = getMarkerColor(match.matchScore);
              
              let distText = "";
              if (currentUserLocation) {
                const distKm = haversineKm(currentUserLocation[0], currentUserLocation[1], lat, lng);
                distText = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`;
              }

              return (
                <Marker 
                  key={match.user.id} 
                  position={[lat, lng]} 
                  icon={icons[color as keyof typeof icons]}
                >
                  <Popup className="rounded-xl">
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-400">
                          {match.user.fullName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{match.user.fullName}</h3>
                          <p className="text-xs text-slate-500">
                            {match.user.gender === "male" ? "Nam" : match.user.gender === "female" ? "Nữ" : "Khác"} 
                            {match.user.birthYear ? ` • ${new Date().getFullYear() - match.user.birthYear} tuổi` : ""}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600 mb-4">
                        <div className="flex justify-between">
                          <span>Độ tương thích:</span>
                          <span className={`font-semibold ${match.matchScore >= 80 ? 'text-green-600' : match.matchScore >= 50 ? 'text-yellow-600' : 'text-slate-600'}`}>
                            {match.matchScore}%
                          </span>
                        </div>
                        {match.user.budgetMax && (
                          <div className="flex justify-between">
                            <span>Ngân sách:</span>
                            <span className="font-medium text-slate-800">
                              {(match.user.budgetMax / 1000000).toFixed(1)}tr
                            </span>
                          </div>
                        )}
                        {match.user.school && (
                          <div className="text-xs mt-1 text-slate-500 flex gap-1 items-start">
                            <Navigation className="w-3 h-3 mt-0.5 shrink-0" />
                            {match.user.school}
                          </div>
                        )}
                        {distText && (
                          <div className="text-xs mt-1 text-slate-500 flex gap-1 items-center">
                            <MapPin className="w-3 h-3 shrink-0" />
                            Cách bạn {distText}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => onSelectMatch(match)}
                          className="w-full py-1.5 px-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          <UserIcon className="w-4 h-4" /> Xem hồ sơ
                        </button>
                        <button 
                          onClick={() => router.push(`/messages/${match.user.id}`)}
                          className="w-full py-1.5 px-3 bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> Nhắn tin
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Filters Overlay on Mobile / Sidebar on Desktop */}
      <div className="w-full md:w-64 bg-white border-t md:border-t-0 md:border-l border-slate-100 p-4 overflow-y-auto shrink-0 z-10">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
          <Filter className="w-4 h-4" />
          Bộ lọc bản đồ
        </div>

        <div className="space-y-5">
          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Giới tính</label>
            <div className="flex flex-wrap gap-2">
              {["all", "male", "female"].map(val => (
                <button
                  key={val}
                  onClick={() => setFilterGender(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterGender === val ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {val === "all" ? "Tất cả" : val === "male" ? "Nam" : "Nữ"}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          {currentUserLocation && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Khoảng cách</label>
              <div className="flex flex-wrap gap-2">
                {[{label: "Tất cả", val: 0}, {label: "< 2km", val: 2}, {label: "< 5km", val: 5}, {label: "< 10km", val: 10}].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setFilterDistance(item.val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterDistance === item.val ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Type */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Đối tượng</label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterStudent} 
                onChange={(e) => setFilterStudent(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              Chỉ hiện sinh viên
            </label>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Match {'>'} 90%</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Match 70-89%</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Match 50-69%</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> Match {'<'} 50%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
