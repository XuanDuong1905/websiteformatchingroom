import React from "react";
import { Utensils, ShoppingCart, HeartPulse, Bus, GraduationCap } from "lucide-react";

export type PlaceCategory = "food" | "convenience" | "life" | "transit" | "education";

interface Props {
  activeCategory: PlaceCategory | null;
  onSelect: (category: PlaceCategory | null) => void;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: "food", label: "Ăn uống", icon: <Utensils className="w-4 h-4" /> },
  { id: "convenience", label: "Cửa hàng", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "life", label: "Đời sống", icon: <HeartPulse className="w-4 h-4" /> },
  { id: "transit", label: "Giao thông", icon: <Bus className="w-4 h-4" /> },
  { id: "education", label: "Học tập", icon: <GraduationCap className="w-4 h-4" /> },
];

export default function MapCategoryFilter({ activeCategory, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(activeCategory === cat.id ? null : cat.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === cat.id
              ? "bg-cyan-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
