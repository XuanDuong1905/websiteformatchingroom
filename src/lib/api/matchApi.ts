import { getStoredToken } from "@/lib/auth/storage";

export type MatchItem = {
  user: {
    id: number;
    fullName?: string | null;
    gender?: string | null;
    school?: string | null;
    reputationScore?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    birthYear?: number | null;
    currentAddress?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
  };
  matchScore: number;
  scores?: {
    sleepScore?: number | null;
    cleaningScore?: number | null;
    privacyScore?: number | null;
    noiseScore?: number | null;
    guestScore?: number | null;
    cookingScore?: number | null;
  } | null;
  reasons?: string[] | null;
};

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

function getAuthHeaders() {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : null;
}

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  const authorization = getAuthHeaders();

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data, `Yêu cầu thất bại (${res.status}).`),
    );
  }

  return data;
}

export async function getMatches(userId: number) {
  return request(`/api/matches/${userId}`, {
    method: "GET",
  });
}
