"use client";

import { useEffect, useState } from "react";

type PendingLandlord = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string;
  businessLicenseImage: string;
  createdAt: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function request<T>(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
  });
  const data = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    throw new Error(getErrorMessage(data, `Yêu cầu thất bại (${res.status}).`));
  }

  return data?.data as T;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminLandlordsPage() {
  const [landlords, setLandlords] = useState<PendingLandlord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadPendingLandlords() {
    try {
      setIsLoading(true);
      setError("");
      const data = await request<PendingLandlord[]>("/api/admin/landlords/pending");
      setLandlords(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách chủ trọ.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadInitialLandlords() {
      try {
        const data = await request<PendingLandlord[]>("/api/admin/landlords/pending");

        if (!isActive) return;
        setLandlords(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!isActive) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải danh sách chủ trọ.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialLandlords();

    return () => {
      isActive = false;
    };
  }, []);

  async function updateLandlord(id: number, action: "approve" | "reject") {
    try {
      setActionId(id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`/api/admin/landlords/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, `Không thể xử lý tài khoản (${response.status}).`),
        );
      }

      setLandlords((current) => current.filter((landlord) => landlord.id !== id));
      setSuccessMessage(
        action === "approve"
          ? "Đã phê duyệt tài khoản chủ trọ."
          : "Đã từ chối tài khoản chủ trọ.",
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể cập nhật tài khoản chủ trọ.",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Quản trị viên</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Duyệt tài khoản chủ trọ
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Kiểm tra giấy phép kinh doanh trước khi phê duyệt quyền đăng phòng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPendingLandlords()}
            disabled={isLoading}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoading ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            Đang tải danh sách chủ trọ chờ duyệt...
          </div>
        ) : landlords.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Không có tài khoản đang chờ duyệt
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Danh sách sẽ tự cập nhật khi có chủ trọ mới gửi đăng ký.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Chủ trọ</th>
                    <th className="px-4 py-3 font-semibold">Liên hệ</th>
                    <th className="px-4 py-3 font-semibold">Cơ sở</th>
                    <th className="px-4 py-3 font-semibold">Ngày gửi</th>
                    <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {landlords.map((landlord) => (
                    <tr key={landlord.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-950">
                          {landlord.fullName}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          ID #{landlord.id}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <div>{landlord.email}</div>
                        <div className="mt-1">{landlord.phone || "Chưa cập nhật"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          {landlord.businessName}
                        </div>
                        <a
                          href={landlord.businessLicenseImage}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800"
                        >
                          Xem giấy phép
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {formatDate(landlord.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void updateLandlord(landlord.id, "reject")}
                            disabled={actionId === landlord.id}
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                          <button
                            type="button"
                            onClick={() => void updateLandlord(landlord.id, "approve")}
                            disabled={actionId === landlord.id}
                            className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionId === landlord.id ? "Đang xử lý..." : "Phê duyệt"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:hidden">
              {landlords.map((landlord) => (
                <article
                  key={landlord.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-950">
                        {landlord.fullName}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">ID #{landlord.id}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      Chờ duyệt
                    </span>
                  </div>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold text-slate-700">Email</dt>
                      <dd className="mt-1 text-slate-600">{landlord.email}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Số điện thoại</dt>
                      <dd className="mt-1 text-slate-600">
                        {landlord.phone || "Chưa cập nhật"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Cơ sở kinh doanh</dt>
                      <dd className="mt-1 text-slate-600">{landlord.businessName}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Ngày gửi</dt>
                      <dd className="mt-1 text-slate-600">
                        {formatDate(landlord.createdAt)}
                      </dd>
                    </div>
                  </dl>

                  <a
                    href={landlord.businessLicenseImage}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                  >
                    Xem giấy phép
                  </a>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void updateLandlord(landlord.id, "reject")}
                      disabled={actionId === landlord.id}
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateLandlord(landlord.id, "approve")}
                      disabled={actionId === landlord.id}
                      className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionId === landlord.id ? "Đang xử lý..." : "Phê duyệt"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
