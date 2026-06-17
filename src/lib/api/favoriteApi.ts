const BASE = "/api/favorites/rooms";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export async function getFavoriteRooms() {
  return request(BASE);
}

export async function addFavoriteRoom(roomId: number) {
  return request(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId }),
  });
}

export async function removeFavoriteRoom(roomId: number) {
  return request(`${BASE}/${roomId}`, { method: "DELETE" });
}

export async function getFavoriteRoomStatus(roomId: number): Promise<{ success: boolean; isFavorited: boolean }> {
  return request(`${BASE}/${roomId}/status`);
}
