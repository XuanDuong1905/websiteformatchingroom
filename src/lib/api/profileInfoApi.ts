import type { PersonalProfileFormInput } from "@/lib/validations/personalProfile";

export type PersonalProfile = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "unknown";
  dateOfBirth: string;
  avatarUrl: string;
  role: "STUDENT" | "LANDLORD" | "ADMIN";
  status: "APPROVED" | "PENDING" | "REJECTED";
  school: string;
  occupation: string;
  address: string;
  district: string;
  bio: string;
  landlord: {
    businessName: string;
    businessLicenseImage: string;
    identityNumber: string;
    verificationStatus: string;
    verifiedAt: string | null;
  } | null;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}

async function request<T>(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);

  if (options?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers,
  });
  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Yêu cầu thất bại (${response.status}).`));
  }

  return data?.data as T;
}

export function getMyProfileInfo() {
  return request<PersonalProfile>("/api/profile/me");
}

export function updateMyProfileInfo(payload: PersonalProfileFormInput) {
  return request<PersonalProfile>("/api/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
