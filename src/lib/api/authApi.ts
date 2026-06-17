export type LoginPayload = {
  email: string;
  password: string;
};

export type StudentRegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  university: string;
};

export type LandlordRegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessLicenseImage: string;
};

export type LegacyRegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  university?: string;
  school?: string;
  gender?: string;
  phone?: string;
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

async function request(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
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

export async function login(payload: LoginPayload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerStudent(payload: StudentRegisterPayload) {
  return request("/api/auth/register/student", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerLandlord(payload: LandlordRegisterPayload) {
  return request("/api/auth/register/landlord", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

// Backward-compatible alias for older UI code.
export async function registerUser(payload: LegacyRegisterPayload) {
  return registerStudent({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword ?? payload.password,
    university: payload.university ?? payload.school ?? "",
  });
}

export async function sendOtp(email: string) {
  return request("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string) {
  return request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function register(payload: StudentRegisterPayload) {
  return registerStudent(payload);
}
