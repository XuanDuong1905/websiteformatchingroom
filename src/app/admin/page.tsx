"use client";

import { useEffect, useMemo, useState } from "react";

type TabKey = "rooms" | "landlords" | "students";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiListResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T[];
  pagination?: Pagination;
};

type RoomItem = {
  id: number;
  title: string;
  address: string;
  ward: string | null;
  district: string;
  city: string;
  price: number;
  area: string | number;
  status: string;
  riskScore: number;
  createdAt: string;
  landlord: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  _count: {
    images: number;
    reviews: number;
    riskReports: number;
  };
};

type LandlordItem = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  reputationScore: string | number;
  createdAt: string;
  landlordProfile: {
    businessName: string;
    businessLicenseImage: string;
    verifiedAt: string | null;
  } | null;
  _count: {
    rooms: number;
    reportsReceived: number;
    reviewsReceived: number;
  };
};

type StudentItem = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string;
  status: string;
  reputationScore: string | number;
  createdAt: string;
  studentProfile: {
    university: string;
  } | null;
  profile: {
    schoolName: string | null;
    major: string | null;
    preferredDistrict: string | null;
  } | null;
  lifestyleProfile: {
    budgetMin: number | null;
    budgetMax: number | null;
  } | null;
  _count: {
    reportsReceived: number;
    reviewsReceived: number;
  };
};

const tabOptions: Array<{ key: TabKey; label: string; endpoint: string }> = [
  { key: "rooms", label: "Danh sách trọ", endpoint: "/api/admin/rooms" },
  { key: "landlords", label: "Danh sách chủ trọ", endpoint: "/api/admin/landlords" },
  { key: "students", label: "Danh sách sinh viên", endpoint: "/api/admin/students" },
];

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "Chưa cập nhật";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    APPROVED: "Đã duyệt",
    PENDING: "Chờ duyệt",
    REJECTED: "Từ chối",
    ACTIVE: "Đang hiển thị",
    INACTIVE: "Tạm ẩn",
    RENTED: "Đã thuê",
    DRAFT: "Bản nháp",
    HIDDEN: "Đã ẩn",
    WARNING: "Cảnh báo",
    DELETED: "Đã xóa",
  };

  return labels[value] ?? value;
}

function roleEndpoint(tab: TabKey, id: number) {
  if (tab === "rooms") return `/api/admin/rooms/${id}`;
  if (tab === "landlords") return `/api/admin/landlords/${id}`;
  return `/api/admin/students/${id}`;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("rooms");
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [landlords, setLandlords] = useState<LandlordItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeOption = useMemo(
    () => tabOptions.find((option) => option.key === activeTab) ?? tabOptions[0],
    [activeTab],
  );

  const currentItems = useMemo(() => {
    if (activeTab === "rooms") return rooms;
    if (activeTab === "landlords") return landlords;
    return students;
  }, [activeTab, landlords, rooms, students]);

  async function loadItems(tab = activeTab, nextPage = page, nextSearch = search) {
    const option = tabOptions.find((item) => item.key === tab) ?? tabOptions[0];
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(initialPagination.limit),
    });

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`${option.endpoint}?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as ApiListResponse<
        RoomItem | LandlordItem | StudentItem
      > | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, `Không thể tải dữ liệu (${response.status}).`),
        );
      }

      if (tab === "rooms") {
        setRooms((data?.data ?? []) as RoomItem[]);
      } else if (tab === "landlords") {
        setLandlords((data?.data ?? []) as LandlordItem[]);
      } else {
        setStudents((data?.data ?? []) as StudentItem[]);
      }

      setPagination(data?.pagination ?? initialPagination);
      setViewingId(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems(activeTab, page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, search]);

  function switchTab(tab: TabKey) {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setSearchInput("");
    setSuccessMessage("");
    setError("");
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function deleteItem(id: number) {
    const confirmation = window.confirm(
      "Bạn chắc chắn muốn xóa dữ liệu này khỏi database?",
    );

    if (!confirmation) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(roleEndpoint(activeTab, id), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, `Không thể xóa dữ liệu (${response.status}).`),
        );
      }

      setSuccessMessage(getErrorMessage(data, "Đã xóa dữ liệu khỏi database."));
      await loadItems(activeTab, page, search);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xóa dữ liệu.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Quản trị viên</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Quản lý dữ liệu hệ thống
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Xem danh sách trọ, chủ trọ, sinh viên và xóa dữ liệu trực tiếp khỏi database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href="/admin/reports/rooms"
              className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              ⚠️ Quản lý Report Phòng trọ
            </a>

            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2 lg:flex-none">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm theo tên, email, địa chỉ..."
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 lg:w-80"
              />
              <button
                type="submit"
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => switchTab(option.key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === option.key
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
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

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {activeOption.label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tổng cộng {pagination.total} bản ghi
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadItems(activeTab, page, search)}
              disabled={isLoading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-600">
              Đang tải dữ liệu...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-base font-semibold text-slate-950">
                Không có dữ liệu
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Thử đổi từ khóa tìm kiếm hoặc tải lại danh sách.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "rooms" && (
                <RoomTable
                  items={rooms}
                  viewingId={viewingId}
                  deletingId={deletingId}
                  onView={setViewingId}
                  onDelete={(id) => void deleteItem(id)}
                />
              )}
              {activeTab === "landlords" && (
                <LandlordTable
                  items={landlords}
                  viewingId={viewingId}
                  deletingId={deletingId}
                  onView={setViewingId}
                  onDelete={(id) => void deleteItem(id)}
                />
              )}
              {activeTab === "students" && (
                <StudentTable
                  items={students}
                  viewingId={viewingId}
                  deletingId={deletingId}
                  onView={setViewingId}
                  onDelete={(id) => void deleteItem(id)}
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={isLoading || pagination.page <= 1}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(current + 1, pagination.totalPages))
                }
                disabled={isLoading || pagination.page >= pagination.totalPages}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionButtons({
  id,
  viewingId,
  deletingId,
  onView,
  onDelete,
}: {
  id: number;
  viewingId: number | null;
  deletingId: number | null;
  onView: (id: number | null) => void;
  onDelete: (id: number) => void;
}) {
  const isViewing = viewingId === id;

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onView(isViewing ? null : id)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {isViewing ? "Ẩn" : "Xem"}
      </button>
      <button
        type="button"
        onClick={() => onDelete(id)}
        disabled={deletingId === id}
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deletingId === id ? "Đang xóa..." : "Xóa"}
      </button>
    </div>
  );
}

function RoomTable({
  items,
  viewingId,
  deletingId,
  onView,
  onDelete,
}: {
  items: RoomItem[];
  viewingId: number | null;
  deletingId: number | null;
  onView: (id: number | null) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          <th className="px-4 py-3 font-semibold">Phòng trọ</th>
          <th className="px-4 py-3 font-semibold">Địa chỉ</th>
          <th className="px-4 py-3 font-semibold">Chủ trọ</th>
          <th className="px-4 py-3 font-semibold">Giá</th>
          <th className="px-4 py-3 font-semibold">Trạng thái</th>
          <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {items.map((room) => (
          <tr key={room.id} className="align-top">
            <td className="px-4 py-4">
              <div className="font-semibold text-slate-950">{room.title}</div>
              <div className="mt-1 text-xs text-slate-500">ID #{room.id}</div>
              {viewingId === room.id && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Diện tích: {room.area} m2 · Ảnh: {room._count.images} · Đánh giá:{" "}
                  {room._count.reviews} · Báo cáo: {room._count.riskReports} · Risk:{" "}
                  {room.riskScore}
                </div>
              )}
            </td>
            <td className="px-4 py-4 text-slate-700">
              {room.address}, {room.ward ? `${room.ward}, ` : ""}
              {room.district}, {room.city}
            </td>
            <td className="px-4 py-4 text-slate-700">
              <div>
                <a
                  href={`/admin/users/${room.landlord.id}`}
                  className="font-medium text-cyan-750 hover:text-cyan-800 hover:underline transition"
                >
                  {room.landlord.fullName}
                </a>
              </div>
              <div className="mt-1 text-xs text-slate-500">{room.landlord.email}</div>
            </td>
            <td className="px-4 py-4 font-semibold text-slate-950">
              {formatCurrency(room.price)}
            </td>
            <td className="px-4 py-4 text-slate-700">{statusLabel(room.status)}</td>
            <td className="px-4 py-4">
              <ActionButtons
                id={room.id}
                viewingId={viewingId}
                deletingId={deletingId}
                onView={onView}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LandlordTable({
  items,
  viewingId,
  deletingId,
  onView,
  onDelete,
}: {
  items: LandlordItem[];
  viewingId: number | null;
  deletingId: number | null;
  onView: (id: number | null) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          <th className="px-4 py-3 font-semibold">Chủ trọ</th>
          <th className="px-4 py-3 font-semibold">Liên hệ</th>
          <th className="px-4 py-3 font-semibold">Cơ sở</th>
          <th className="px-4 py-3 font-semibold">Trạng thái</th>
          <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {items.map((landlord) => (
          <tr key={landlord.id} className="align-top">
            <td className="px-4 py-4">
              <div>
                <a
                  href={`/admin/users/${landlord.id}`}
                  className="font-semibold text-cyan-750 hover:text-cyan-800 hover:underline transition"
                >
                  {landlord.fullName}
                </a>
              </div>
              <div className="mt-1 text-xs text-slate-500">ID #{landlord.id}</div>
              {viewingId === landlord.id && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Ngày tạo: {formatDate(landlord.createdAt)} · Điểm uy tín:{" "}
                  {landlord.reputationScore} · Phòng: {landlord._count.rooms} · Báo cáo:{" "}
                  {landlord._count.reportsReceived} · Đánh giá:{" "}
                  {landlord._count.reviewsReceived}
                </div>
              )}
            </td>
            <td className="px-4 py-4 text-slate-700">
              <div>{landlord.email}</div>
              <div className="mt-1">{landlord.phone || "Chưa cập nhật"}</div>
            </td>
            <td className="px-4 py-4 text-slate-700">
              <div className="font-medium">
                {landlord.landlordProfile?.businessName || "Chưa cập nhật"}
              </div>
              {landlord.landlordProfile?.businessLicenseImage && (
                <a
                  href={landlord.landlordProfile.businessLicenseImage}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  Xem giấy phép
                </a>
              )}
            </td>
            <td className="px-4 py-4 text-slate-700">{statusLabel(landlord.status)}</td>
            <td className="px-4 py-4">
              <ActionButtons
                id={landlord.id}
                viewingId={viewingId}
                deletingId={deletingId}
                onView={onView}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StudentTable({
  items,
  viewingId,
  deletingId,
  onView,
  onDelete,
}: {
  items: StudentItem[];
  viewingId: number | null;
  deletingId: number | null;
  onView: (id: number | null) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
      <thead className="bg-slate-100 text-xs uppercase text-slate-600">
        <tr>
          <th className="px-4 py-3 font-semibold">Sinh viên</th>
          <th className="px-4 py-3 font-semibold">Liên hệ</th>
          <th className="px-4 py-3 font-semibold">Trường / Khu vực</th>
          <th className="px-4 py-3 font-semibold">Ngân sách</th>
          <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {items.map((student) => (
          <tr key={student.id} className="align-top">
            <td className="px-4 py-4">
              <div>
                <a
                  href={`/admin/users/${student.id}`}
                  className="font-semibold text-cyan-750 hover:text-cyan-800 hover:underline transition"
                >
                  {student.fullName}
                </a>
              </div>
              <div className="mt-1 text-xs text-slate-500">ID #{student.id}</div>
              {viewingId === student.id && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  Giới tính: {student.gender} · Trạng thái: {statusLabel(student.status)} ·
                  Điểm uy tín: {student.reputationScore} · Báo cáo:{" "}
                  {student._count.reportsReceived} · Đánh giá:{" "}
                  {student._count.reviewsReceived}
                </div>
              )}
            </td>
            <td className="px-4 py-4 text-slate-700">
              <div>{student.email}</div>
              <div className="mt-1">{student.phone || "Chưa cập nhật"}</div>
            </td>
            <td className="px-4 py-4 text-slate-700">
              <div className="font-medium">
                {student.profile?.schoolName ||
                  student.studentProfile?.university ||
                  "Chưa cập nhật"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {student.profile?.major || "Chưa có ngành"} ·{" "}
                {student.profile?.preferredDistrict || "Chưa có khu vực"}
              </div>
            </td>
            <td className="px-4 py-4 text-slate-700">
              {student.lifestyleProfile
                ? `${formatCurrency(student.lifestyleProfile.budgetMin)} - ${formatCurrency(
                    student.lifestyleProfile.budgetMax,
                  )}`
                : "Chưa có hồ sơ"}
            </td>
            <td className="px-4 py-4">
              <ActionButtons
                id={student.id}
                viewingId={viewingId}
                deletingId={deletingId}
                onView={onView}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
