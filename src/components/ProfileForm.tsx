"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrUpdateProfile,
  type ProfilePayload,
} from "@/lib/api/profileApi";

const profileSchema = z
  .object({
    userId: z.coerce.number().int().positive("User ID phải là số dương"),
    budgetMin: z.coerce.number().positive("Ngân sách tối thiểu phải lớn hơn 0"),
    budgetMax: z.coerce.number().positive("Ngân sách tối đa phải lớn hơn 0"),
    preferredDistrict: z.string().min(1, "Vui lòng nhập khu vực mong muốn"),
    preferredGender: z.enum(["male", "female", "any"]),
    hasPet: z.boolean(),
    acceptPet: z.boolean(),
    isSmoker: z.boolean(),
    acceptSmoking: z.boolean(),
    sleepTime: z.string().min(1, "Vui lòng chọn giờ ngủ"),
    wakeTime: z.string().min(1, "Vui lòng chọn giờ thức dậy"),
    cleaningFrequency: z.enum(["daily", "weekly", "monthly"]),
    privacyLevel: z.enum(["low", "medium", "high"]),
    noiseLevel: z.enum(["low", "medium", "high"]),
    guestFrequency: z.enum(["rare", "sometimes", "often"]),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu",
    path: ["budgetMax"],
  });

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormValues = z.output<typeof profileSchema>;

const defaultValues: ProfileFormValues = {
  userId: 1,
  budgetMin: 1500000,
  budgetMax: 3000000,
  preferredDistrict: "Thu Duc",
  preferredGender: "any",
  hasPet: false,
  acceptPet: true,
  isSmoker: false,
  acceptSmoking: false,
  sleepTime: "23:00",
  wakeTime: "06:30",
  cleaningFrequency: "weekly",
  privacyLevel: "medium",
  noiseLevel: "low",
  guestFrequency: "rare",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function ProfileForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      setSuccessMessage("");
      setSubmitError("");

      const payload: ProfilePayload = values;
      await createOrUpdateProfile(payload);

      localStorage.setItem("userId", String(values.userId));

      setSuccessMessage(
        "Lưu hồ sơ thành công. Bạn có thể sang trang kết quả matching.",
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Không thể lưu hồ sơ.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Mã người dùng
          </label>
          <input
            type="number"
            {...register("userId")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.userId?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Khu vực mong muốn
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Thu Duc"
            {...register("preferredDistrict")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.preferredDistrict?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Ngân sách tối thiểu
          </label>
          <input
            type="number"
            {...register("budgetMin")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.budgetMin?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Ngân sách tối đa
          </label>
          <input
            type="number"
            {...register("budgetMax")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.budgetMax?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Giới tính mong muốn
          </label>
          <select
            {...register("preferredGender")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="any">Bất kỳ</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <FieldError message={errors.preferredGender?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Giờ ngủ</label>
          <input
            type="time"
            {...register("sleepTime")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.sleepTime?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Giờ thức dậy
          </label>
          <input
            type="time"
            {...register("wakeTime")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.wakeTime?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Tần suất dọn dẹp
          </label>
          <select
            {...register("cleaningFrequency")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="daily">Hằng ngày</option>
            <option value="weekly">Hằng tuần</option>
            <option value="monthly">Hằng tháng</option>
          </select>
          <FieldError message={errors.cleaningFrequency?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Mức độ riêng tư
          </label>
          <select
            {...register("privacyLevel")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
          <FieldError message={errors.privacyLevel?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Mức chấp nhận tiếng ồn
          </label>
          <select
            {...register("noiseLevel")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
          <FieldError message={errors.noiseLevel?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Tần suất có khách
          </label>
          <select
            {...register("guestFrequency")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="rare">Hiếm khi</option>
            <option value="sometimes">Thỉnh thoảng</option>
            <option value="often">Thường xuyên</option>
          </select>
          <FieldError message={errors.guestFrequency?.message} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("hasPet")} />
          Có nuôi thú cưng
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("acceptPet")} />
          Chấp nhận bạn cùng phòng nuôi thú cưng
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("isSmoker")} />
          Có hút thuốc
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("acceptSmoking")} />
          Chấp nhận bạn cùng phòng hút thuốc
        </label>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>

        <a
          href="/matches"
          className="rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Xem kết quả matching
        </a>
      </div>
    </form>
  );
}
