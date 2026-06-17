const BASE = "/api/notifications";

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

export async function getNotifications(params?: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.unreadOnly) query.set("unreadOnly", "true");
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return request(`${BASE}${qs ? `?${qs}` : ""}`);
}

export async function getUnreadCount(): Promise<{ success: boolean; count: number }> {
  return request(`${BASE}/unread-count`);
}

export async function markAsRead(id: number) {
  return request(`${BASE}/${id}/read`, { method: "PATCH" });
}

export async function markAllAsRead() {
  return request(`${BASE}/read-all`, { method: "PATCH" });
}
