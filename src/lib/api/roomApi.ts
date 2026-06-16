export type RoomRulesPayload = {
  allowSmoking: boolean;
  allowPet: boolean;
  allowGuest: boolean;
  curfewTime: string | null;
  cookingAllowed: boolean;
  parkingAllowed: boolean;
  note?: string;
};

export type RoomCreatePayload = {
  title: string;
  description: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  price: number;
  electricPrice: number;
  waterPrice: number;
  serviceFee: number;
  deposit: number;
  wifiFee: number;
  parkingFee: number;
  area: number;
  maxOccupants: number;
  currentOccupants: number;
  latitude: number | null;
  longitude: number | null;
  hasContract: boolean;
  minStayMonths: number;
  availableFrom: string | null;
  status: "ACTIVE" | "INACTIVE" | "RENTED";
  images: string[];
  rules: RoomRulesPayload;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const message = (data as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}

export async function createRoom(payload: RoomCreatePayload) {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Không thể đăng phòng (${response.status}).`));
  }

  return data;
}
