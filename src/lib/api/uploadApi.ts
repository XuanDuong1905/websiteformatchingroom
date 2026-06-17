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

export async function uploadLicenseImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/upload/license`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data, `Không thể upload ảnh (${res.status}).`),
    );
  }

  if (!data || typeof data.url !== "string") {
    throw new Error("Phản hồi upload không hợp lệ.");
  }

  return data.url;
}

export async function uploadRoomImages(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const res = await fetch(`${API_BASE_URL}/api/upload/room-images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data, `Không thể upload ảnh phòng (${res.status}).`),
    );
  }

  if (!data || !Array.isArray(data.urls)) {
    throw new Error("Phản hồi upload ảnh phòng không hợp lệ.");
  }

  return data.urls.filter((url: unknown): url is string => typeof url === "string");
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/upload/avatar`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      getErrorMessage(data, `Không thể upload ảnh đại diện (${res.status}).`),
    );
  }

  if (!data || typeof data.url !== "string") {
    throw new Error("Phản hồi upload không hợp lệ.");
  }

  return data.url;
}
