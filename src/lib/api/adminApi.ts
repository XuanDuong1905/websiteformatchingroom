const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message || record.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  // Read JWT token if available in localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data, `Yêu cầu thất bại (${res.status}).`)
    );
  }

  return data;
}

export async function getReportedRooms() {
  return request("/api/admin/reports/rooms", {
    method: "GET",
  });
}

export async function getRoomReportDetail(roomId: number | string) {
  return request(`/api/admin/reports/rooms/${roomId}`, {
    method: "GET",
  });
}

export async function resolveRoomReport(
  roomId: number | string,
  payload: { action: "dismiss" | "warn" | "hide"; note?: string }
) {
  return request(`/api/admin/reports/rooms/${roomId}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getUserDetail(userId: number | string) {
  return request(`/api/admin/users/${userId}`, {
    method: "GET",
  });
}

export async function updateUserStatus(
  userId: number | string,
  payload: { reason: string }
) {
  return request(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function blockUser(
  userId: number | string,
  payload: { reason: string }
) {
  return request(`/api/admin/users/${userId}/block`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function unblockUser(
  userId: number | string,
  payload: { note?: string }
) {
  return request(`/api/admin/users/${userId}/unblock`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
