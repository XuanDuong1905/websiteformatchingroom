export type MatchItem = {
  user: {
    id: number;
    fullName: string;
    gender: string;
    school: string;
    reputationScore: number;
  };
  matchScore: number;
  scores: {
    sleepScore: number;
    cleaningScore: number;
    privacyScore: number;
    noiseScore: number;
  };
  reasons: string[];
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
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
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
