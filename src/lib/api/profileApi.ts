export type PreferredGender = "male" | "female" | "any";
export type Frequency = "daily" | "weekly" | "monthly";
export type Level = "low" | "medium" | "high";
export type GuestFrequency = "rare" | "sometimes" | "often";

export type ProfilePayload = {
  userId: number;
  budgetMin: number;
  budgetMax: number;
  preferredDistrict: string;
  preferredGender: PreferredGender;
  hasPet: boolean;
  acceptPet: boolean;
  isSmoker: boolean;
  acceptSmoking: boolean;
  sleepTime: string;
  wakeTime: string;
  cleaningFrequency: Frequency;
  privacyLevel: Level;
  noiseLevel: Level;
  guestFrequency: GuestFrequency;
};

async function request(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

export async function createOrUpdateProfile(payload: ProfilePayload) {
  return request("/api/profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProfile(userId: number) {
  return request(`/api/profiles/${userId}`, {
    method: "GET",
  });
}

export async function updateProfile(
  userId: number,
  payload: Partial<ProfilePayload>,
) {
  return request(`/api/profiles/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
