"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Home, ImagePlus, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { createRoom, type RoomCreatePayload } from "@/lib/api/roomApi";
import { uploadRoomImages } from "@/lib/api/uploadApi";
import { ROOM_IMAGE_LIMITS } from "@/lib/validations/room";

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optionalNumber = z.preprocess(
  emptyToNull,
  z.coerce.number().nullable(),
);

const roomPostSchema = z
  .object({
    title: z.string().trim().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
    description: z.string().trim().min(30, "Mô tả phải có ít nhất 30 ký tự"),
    address: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
    ward: z.string().trim().min(1, "Vui lòng nhập phường/xã"),
    district: z.string().trim().min(1, "Vui lòng nhập quận/huyện"),
    city: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố"),
    price: z.coerce.number().positive("Giá thuê phải lớn hơn 0"),
    deposit: z.coerce.number().min(0, "Tiền cọc không được âm"),
    electricPrice: z.coerce.number().min(0, "Giá điện không được âm"),
    waterPrice: z.coerce.number().min(0, "Giá nước không được âm"),
    serviceFee: z.coerce.number().min(0, "Phí dịch vụ không được âm"),
    wifiFee: z.coerce.number().min(0, "Phí wifi không được âm"),
    parkingFee: z.coerce.number().min(0, "Phí gửi xe không được âm"),
    area: z.coerce.number().positive("Diện tích phải lớn hơn 0"),
    maxOccupants: z.coerce.number().int().min(1, "Số người tối đa phải ít nhất là 1"),
    currentOccupants: z.coerce.number().int().min(0, "Số người hiện tại không được âm"),
    latitude: optionalNumber,
    longitude: optionalNumber,
    hasContract: z.boolean(),
    minStayMonths: z.coerce.number().int().min(1, "Thời hạn thuê tối thiểu phải ít nhất là 1 tháng"),
    availableFrom: z.preprocess(
      emptyToNull,
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày trống không hợp lệ").nullable(),
    ),
    status: z.enum(["ACTIVE", "INACTIVE", "RENTED"]),
    allowSmoking: z.boolean(),
    allowPet: z.boolean(),
    allowGuest: z.boolean(),
    curfewTime: z.preprocess(
      emptyToNull,
      z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ giới nghiêm không hợp lệ").nullable(),
    ),
    cookingAllowed: z.boolean(),
    parkingAllowed: z.boolean(),
    ruleNote: z.string().trim().max(1000, "Ghi chú nội quy không được quá 1000 ký tự").optional(),
  })
  .refine((data) => data.currentOccupants <= data.maxOccupants, {
    message: "Số người hiện tại không được lớn hơn số người tối đa",
    path: ["currentOccupants"],
  });

type RoomPostFormInput = z.input<typeof roomPostSchema>;
type RoomPostFormValues = z.output<typeof roomPostSchema>;

const defaultValues: RoomPostFormInput = {
  title: "",
  description: "",
  address: "",
  ward: "",
  district: "",
  city: "TP. Ho Chi Minh",
  price: 2500000,
  deposit: 2500000,
  electricPrice: 4000,
  waterPrice: 100000,
  serviceFee: 0,
  wifiFee: 0,
  parkingFee: 0,
  area: 20,
  maxOccupants: 2,
  currentOccupants: 0,
  latitude: null,
  longitude: null,
  hasContract: true,
  minStayMonths: 3,
  availableFrom: "",
  status: "ACTIVE",
  allowSmoking: false,
  allowPet: false,
  allowGuest: true,
  curfewTime: "",
  cookingAllowed: true,
  parkingAllowed: true,
  ruleNote: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
        value
          ? "border-cyan-300 bg-cyan-50 text-cyan-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition ${
          value ? "bg-cyan-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function toPayload(values: RoomPostFormValues, imageUrls: string[]): RoomCreatePayload {
  return {
    title: values.title,
    description: values.description,
    address: values.address,
    ward: values.ward,
    district: values.district,
    city: values.city,
    price: values.price,
    electricPrice: values.electricPrice,
    waterPrice: values.waterPrice,
    serviceFee: values.serviceFee,
    deposit: values.deposit,
    wifiFee: values.wifiFee,
    parkingFee: values.parkingFee,
    area: values.area,
    maxOccupants: values.maxOccupants,
    currentOccupants: values.currentOccupants,
    latitude: values.latitude,
    longitude: values.longitude,
    hasContract: values.hasContract,
    minStayMonths: values.minStayMonths,
    availableFrom: values.availableFrom,
    status: values.status,
    images: imageUrls,
    rules: {
      allowSmoking: values.allowSmoking,
      allowPet: values.allowPet,
      allowGuest: values.allowGuest,
      curfewTime: values.curfewTime,
      cookingAllowed: values.cookingAllowed,
      parkingAllowed: values.parkingAllowed,
      note: values.ruleNote,
    },
  };
}

export default function NewRoomPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<number | null>(null);
  const [imageError, setImageError] = useState("");
  const [stepMessage, setStepMessage] = useState("");

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomPostFormInput, unknown, RoomPostFormValues>({
    resolver: zodResolver(roomPostSchema),
    defaultValues,
  });

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setSuccessMessage("");
    setCreatedRoomId(null);
    setImageError("");

    if (selectedFiles.length < ROOM_IMAGE_LIMITS.min) {
      setImageError(`Vui lòng chọn ít nhất ${ROOM_IMAGE_LIMITS.min} ảnh phòng.`);
    } else if (selectedFiles.length > ROOM_IMAGE_LIMITS.max) {
      setImageError(`Chỉ được chọn tối đa ${ROOM_IMAGE_LIMITS.max} ảnh phòng.`);
    }

    const oversizedFile = selectedFiles.find((file) => file.size > ROOM_IMAGE_LIMITS.maxSize);
    if (oversizedFile) {
      setImageError("Mỗi ảnh không được vượt quá 5MB.");
    }

    setFiles(selectedFiles);
  }

  async function onSubmit(values: RoomPostFormValues) {
    try {
      setSubmitError("");
      setSuccessMessage("");
      setCreatedRoomId(null);

      if (files.length < ROOM_IMAGE_LIMITS.min || files.length > ROOM_IMAGE_LIMITS.max) {
        setImageError(`Vui lòng chọn từ ${ROOM_IMAGE_LIMITS.min} đến ${ROOM_IMAGE_LIMITS.max} ảnh phòng.`);
        return;
      }

      setStepMessage("Đang upload ảnh phòng...");
      const imageUrls = await uploadRoomImages(files);

      setStepMessage("Đang lưu thông tin phòng...");
      const result = await createRoom(toPayload(values, imageUrls));
      const roomId = Number(result?.data?.id);

      setFiles([]);
      reset(defaultValues);
      setCreatedRoomId(Number.isFinite(roomId) ? roomId : null);
      setSuccessMessage("Đăng phòng thành công. Dữ liệu đã được lưu vào database.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể đăng phòng.");
    } finally {
      setStepMessage("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Chủ trọ</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-950">
              <Home className="h-7 w-7 text-cyan-700" />
              Đăng phòng mới
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tài khoản chủ trọ đã xác minh có thể tạo bài đăng phòng tại đây.
            </p>
          </div>
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Xem danh sách phòng
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Section title="Thông tin phòng">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Tiêu đề</label>
                <input className={inputClass} {...register("title")} />
                <FieldError message={errors.title?.message} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Mô tả</label>
                <textarea rows={5} className={inputClass} {...register("description")} />
                <FieldError message={errors.description?.message} />
              </div>
              <div>
                <label className={labelClass}>Địa chỉ</label>
                <input className={inputClass} {...register("address")} />
                <FieldError message={errors.address?.message} />
              </div>
              <div>
                <label className={labelClass}>Phường/Xã</label>
                <input className={inputClass} {...register("ward")} />
                <FieldError message={errors.ward?.message} />
              </div>
              <div>
                <label className={labelClass}>Quận/Huyện</label>
                <input className={inputClass} {...register("district")} />
                <FieldError message={errors.district?.message} />
              </div>
              <div>
                <label className={labelClass}>Tỉnh/Thành phố</label>
                <input className={inputClass} {...register("city")} />
                <FieldError message={errors.city?.message} />
              </div>
            </div>
          </Section>

          <Section title="Giá và sức chứa">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Giá thuê</label>
                <input type="number" className={inputClass} {...register("price")} />
                <FieldError message={errors.price?.message} />
              </div>
              <div>
                <label className={labelClass}>Tiền cọc</label>
                <input type="number" className={inputClass} {...register("deposit")} />
                <FieldError message={errors.deposit?.message} />
              </div>
              <div>
                <label className={labelClass}>Diện tích m2</label>
                <input type="number" step="0.1" className={inputClass} {...register("area")} />
                <FieldError message={errors.area?.message} />
              </div>
              <div>
                <label className={labelClass}>Giá điện</label>
                <input type="number" className={inputClass} {...register("electricPrice")} />
                <FieldError message={errors.electricPrice?.message} />
              </div>
              <div>
                <label className={labelClass}>Giá nước</label>
                <input type="number" className={inputClass} {...register("waterPrice")} />
                <FieldError message={errors.waterPrice?.message} />
              </div>
              <div>
                <label className={labelClass}>Phí dịch vụ</label>
                <input type="number" className={inputClass} {...register("serviceFee")} />
                <FieldError message={errors.serviceFee?.message} />
              </div>
              <div>
                <label className={labelClass}>Phí wifi</label>
                <input type="number" className={inputClass} {...register("wifiFee")} />
                <FieldError message={errors.wifiFee?.message} />
              </div>
              <div>
                <label className={labelClass}>Phí gửi xe</label>
                <input type="number" className={inputClass} {...register("parkingFee")} />
                <FieldError message={errors.parkingFee?.message} />
              </div>
              <div>
                <label className={labelClass}>Trạng thái</label>
                <select className={inputClass} {...register("status")}>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                  <option value="RENTED">Đã thuê</option>
                </select>
                <FieldError message={errors.status?.message} />
              </div>
              <div>
                <label className={labelClass}>Số người tối đa</label>
                <input type="number" className={inputClass} {...register("maxOccupants")} />
                <FieldError message={errors.maxOccupants?.message} />
              </div>
              <div>
                <label className={labelClass}>Số người hiện tại</label>
                <input type="number" className={inputClass} {...register("currentOccupants")} />
                <FieldError message={errors.currentOccupants?.message} />
              </div>
              <div>
                <label className={labelClass}>Thuê tối thiểu tháng</label>
                <input type="number" className={inputClass} {...register("minStayMonths")} />
                <FieldError message={errors.minStayMonths?.message} />
              </div>
            </div>
          </Section>

          <Section title="Thời gian và vị trí">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Ngày có thể vào ở</label>
                <input type="date" className={inputClass} {...register("availableFrom")} />
                <FieldError message={errors.availableFrom?.message} />
              </div>
              <div>
                <label className={labelClass}>Vĩ độ</label>
                <input type="number" step="any" className={inputClass} {...register("latitude")} />
                <FieldError message={errors.latitude?.message} />
              </div>
              <div>
                <label className={labelClass}>Kinh độ</label>
                <input type="number" step="any" className={inputClass} {...register("longitude")} />
                <FieldError message={errors.longitude?.message} />
              </div>
            </div>
          </Section>

          <Section title="Nội quy phòng">
            <div className="grid gap-3 md:grid-cols-3">
              <Controller
                name="hasContract"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Có hợp đồng" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="allowSmoking"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Cho phép hút thuốc" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="allowPet"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Cho phép thú cưng" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="allowGuest"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Cho phép có khách" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="cookingAllowed"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Được nấu ăn" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="parkingAllowed"
                control={control}
                render={({ field }) => (
                  <ToggleField label="Có chỗ gửi xe" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Giờ giới nghiêm</label>
                <input type="time" className={inputClass} {...register("curfewTime")} />
                <FieldError message={errors.curfewTime?.message} />
              </div>
              <div>
                <label className={labelClass}>Ghi chú nội quy</label>
                <input className={inputClass} {...register("ruleNote")} />
                <FieldError message={errors.ruleNote?.message} />
              </div>
            </div>
          </Section>

          <Section title="Ảnh phòng">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300 bg-cyan-50/60 px-4 py-8 text-center transition hover:bg-cyan-50">
              <ImagePlus className="h-8 w-8 text-cyan-700" />
              <span className="mt-2 text-sm font-semibold text-slate-800">
                Chọn ảnh phòng
              </span>
              <span className="mt-1 text-xs text-slate-500">
                {ROOM_IMAGE_LIMITS.min}-{ROOM_IMAGE_LIMITS.max} ảnh, JPG/PNG/WEBP, tối đa 5MB/ảnh
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handleFilesChange}
              />
            </label>
            {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {previews.map((preview, index) => (
                  <div key={`${preview.name}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
                    <p className="truncate px-2 py-1.5 text-xs text-slate-600">{preview.name}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {stepMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              {stepMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
              {createdRoomId && (
                <Link href={`/rooms/${createdRoomId}`} className="mt-2 inline-flex text-sm font-semibold text-emerald-800 underline">
                  Xem phòng vừa đăng
                </Link>
              )}
            </div>
          )}

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {isSubmitting ? "Đang đăng phòng..." : "Đăng phòng"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Về trang chủ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
