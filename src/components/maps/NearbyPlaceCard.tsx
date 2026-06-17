import React from "react";
import { MapPin, Navigation } from "lucide-react";

interface Place {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance?: number; // km
  address?: string;
}

interface Props {
  place: Place;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  restaurant: "Nhà hàng",
  cafe: "Quán cà phê",
  fast_food: "Đồ ăn nhanh",
  food_court: "Khu ẩm thực",
  bakery: "Tiệm bánh",
  convenience: "Cửa hàng tiện lợi",
  supermarket: "Siêu thị",
  mall: "Trung tâm thương mại",
  pharmacy: "Nhà thuốc",
  hospital: "Bệnh viện",
  clinic: "Phòng khám",
  atm: "ATM",
  bank: "Ngân hàng",
  laundry: "Giặt ủi",
  dentist: "Nha khoa",
  bus_stop: "Trạm xe buýt",
  bus_station: "Bến xe buýt",
  station: "Nhà ga",
  parking: "Bãi đỗ xe",
  university: "Đại học",
  college: "Cao đẳng",
  school: "Trường học",
  library: "Thư viện",
  kindergarten: "Mầm non",
};

export default function NearbyPlaceCard({ place, onClick }: Props) {
  const label = typeLabels[place.type] || place.type.replace(/_/g, " ");
  const distanceText = place.distance !== undefined
    ? place.distance < 1 
      ? `${Math.round(place.distance * 1000)}m` 
      : `${place.distance.toFixed(1)}km`
    : null;

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-cyan-200 transition cursor-pointer flex gap-3 items-center group"
    >
      <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 transition">
        <MapPin className="w-5 h-5 text-cyan-600" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{place.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 capitalize">{label}</span>
          {distanceText && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs font-medium text-cyan-600">{distanceText}</span>
            </>
          )}
        </div>
      </div>
      <Navigation className="w-4 h-4 text-gray-300 group-hover:text-cyan-500 transition shrink-0" />
    </div>
  );
}
