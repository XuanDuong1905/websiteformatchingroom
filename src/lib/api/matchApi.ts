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

async function request(path: string, options?: RequestInit) {
  const res = await fetch(path, options);

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

export async function getMatches(userId: number) {
  return request(`/api/matches/${userId}`, {
    method: "GET",
  });
}
