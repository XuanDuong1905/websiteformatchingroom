import { getStoredToken } from "@/lib/auth/storage";

export type PreferredGender = "male" | "female" | "any";
export type Frequency = "daily" | "weekly" | "monthly";
export type Level = "low" | "medium" | "high";
export type GuestFrequency = "rarely" | "sometimes" | "often";

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
  cookingFrequency: GuestFrequency;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

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
    throw new ApiRequestError(
      getErrorMessage(data, `Yêu cầu thất bại (${res.status}).`),
      res.status,
    );
  }

  return data;
}

function toProfileRequestBody(payload: Partial<ProfilePayload>) {
  return {
    ...payload,
    // TODO(Member 4): Confirm final profile API field names for smoking/pets/privacy/noise.
    smoking: payload.isSmoker,
    petFriendly: payload.acceptPet,
    privacyPreference: payload.privacyLevel,
    noiseTolerance: payload.noiseLevel,
  };
}

export async function createProfile(payload: ProfilePayload) {
  return request("/api/profiles", {
    method: "POST",
    body: JSON.stringify(toProfileRequestBody(payload)),
  });
}

export async function createOrUpdateProfile(payload: ProfilePayload) {
  return createProfile(payload);
}

export async function getProfile(userId: number) {
  return request(`/api/profiles/${userId}`, {
    method: "GET",
  });
}

export async function getProfileByUserId(userId: number) {
  return getProfile(userId);
}

export async function updateProfile(
  userId: number,
  payload: Partial<ProfilePayload>,
) {
  return request(`/api/profiles/${userId}`, {
    method: "PUT",
    body: JSON.stringify(toProfileRequestBody(payload)),
  });
}
