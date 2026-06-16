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
