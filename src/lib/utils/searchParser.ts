export interface ParsedQuery {
  keyword: string;
  gender?: "male" | "female" | "any";
  maxPrice?: number;
  minPrice?: number;
  district?: string;
  amenities: string[];
}

const DISTRICT_MAPPING: Record<string, string> = {
  "thủ đức": "Thu Duc",
  "thu duc": "Thu Duc",
  "đhqg": "Thu Duc", // Mapping Làng đại học/ĐHQG to Thu Duc commonly
  "làng đại học": "Thu Duc",
  "quận 1": "Quan 1",
  "q1": "Quan 1",
  "bình thạnh": "Binh Thanh",
  "binh thanh": "Binh Thanh",
  "dĩ an": "Di An",
  "di an": "Di An",
  "thuận an": "Thuan An",
  "thuan an": "Thuan An",
};

const AMENITY_MAPPING: Record<string, string> = {
  "máy lạnh": "Máy lạnh",
  "điều hòa": "Máy lạnh",
  "điều hoà": "Máy lạnh",
  "ban công": "Ban công",
  "gác": "Gác lửng",
  "gác xép": "Gác lửng",
  "wc riêng": "WC riêng",
  "bếp": "Bếp",
};

export function parseSearchQuery(query: string): ParsedQuery {
  let q = query.toLowerCase();
  const parsed: ParsedQuery = {
    keyword: "",
    amenities: [],
  };

  // 1. Parse Gender
  const hasNam = /\bnam\b/.test(q);
  const hasNu = /\bnữ\b|\bnu\b/.test(q);
  if (hasNam && hasNu) {
    parsed.gender = "any";
  } else if (hasNam) {
    parsed.gender = "male";
  } else if (hasNu) {
    parsed.gender = "female";
  }
  // remove gender words
  q = q.replace(/\b(nam|nữ|nu)\b/g, " ");

  // 2. Parse Budget (e.g. dưới 3 triệu, < 3tr, 2-3 triệu)
  // Match "duoi 3 trieu", "< 3 tr", "3 trieu"
  const budgetRegex = /(dưới|<|khoảng)?\s*(\d+(\.\d+)?)\s*(triệu|tr|trieu|t)\b/gi;
  let match;
  while ((match = budgetRegex.exec(q)) !== null) {
    const value = parseFloat(match[2]);
    const numberValue = value * 1000000;
    
    // If it says "dưới" or "<", it's maxPrice
    if (match[1] && (match[1] === "dưới" || match[1] === "<" || match[1] === "duoi")) {
      if (!parsed.maxPrice || numberValue < parsed.maxPrice) {
        parsed.maxPrice = numberValue;
      }
    } else {
      // Default to maxPrice if no context
      parsed.maxPrice = numberValue;
    }
  }
  q = q.replace(budgetRegex, " ");

  // 3. Parse District
  for (const [key, val] of Object.entries(DISTRICT_MAPPING)) {
    if (q.includes(key)) {
      parsed.district = val;
      q = q.replace(new RegExp(key, 'gi'), " ");
      break; // Only pick one main district for now
    }
  }

  // 4. Parse Amenities
  for (const [key, val] of Object.entries(AMENITY_MAPPING)) {
    if (q.includes(key)) {
      if (!parsed.amenities.includes(val)) {
        parsed.amenities.push(val);
      }
      q = q.replace(new RegExp(key, 'gi'), " ");
    }
  }

  // Clean up remaining string as keyword
  parsed.keyword = q
    .replace(/\s+/g, " ")
    .replace(/[^\w\sàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return parsed;
}
