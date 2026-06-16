import { getStoredToken } from "@/lib/auth/storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getAuthHeaders() {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : null;
}

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  const authorization = getAuthHeaders();

  headers.set("Content-Type", "application/json");

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Yêu cầu thất bại (${res.status}).`);
  }

  return data;
}

export async function getConversations() {
  return request("/api/conversations", {
    method: "GET",
  });
}

export async function getConversation(id: number) {
  return request(`/api/conversations/${id}`, {
    method: "GET",
  });
}

export async function createConversation(targetUserId: number, roomId?: number | null) {
  return request("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ targetUserId, roomId }),
  });
}

export async function sendMessage(conversationId: number, content: string) {
  return request(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
