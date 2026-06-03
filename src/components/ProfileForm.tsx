"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProfile,
  getProfile,
  type ProfilePayload,
  updateProfile,
} from "@/lib/api/profileApi";
import { getStoredUserId } from "@/lib/auth/storage";

const profileSchema = z
  .object({
    userId: z.coerce.number().int().positive("Mã người dùng phải là số dương"),
    budgetMin: z.coerce
      .number()
      .positive("Ngân sách tối thiểu phải lớn hơn 0"),
    budgetMax: z.coerce.number().positive("Ngân sách tối đa phải lớn hơn 0"),
    preferredDistrict: z.string().min(1, "Vui lòng nhập khu vực mong muốn"),
    preferredGender: z.enum(["male", "female", "any"]),
    hasPet: z.boolean(),
    acceptPet: z.boolean(),
    isSmoker: z.boolean(),
    acceptSmoking: z.boolean(),
    sleepTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ ngủ phải có định dạng HH:mm"),
    wakeTime: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Giờ thức dậy phải có định dạng HH:mm",
      ),
    cleaningFrequency: z.enum(["daily", "weekly", "monthly"]),
    privacyLevel: z.enum(["low", "medium", "high"]),
    noiseLevel: z.enum(["low", "medium", "high"]),
    guestFrequency: z.enum(["rare", "sometimes", "often"]),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message:
      "Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu",
    path: ["budgetMax"],
  });

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormValues = z.output<typeof profileSchema>;

const defaultValues: ProfileFormValues = {
  userId: 0,
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

function getProfileData(result: unknown): Partial<ProfilePayload> | null {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const data = record.data || record.profile || record;
  if (!data || typeof data !== "object") return null;

  const profileRecord = data as Record<string, unknown>;
  const userProfile =
    profileRecord.profile && typeof profileRecord.profile === "object"
      ? (profileRecord.profile as Record<string, unknown>)
      : {};
  const lifestyleProfile =
    profileRecord.lifestyleProfile &&
    typeof profileRecord.lifestyleProfile === "object"
      ? (profileRecord.lifestyleProfile as Record<string, unknown>)
      : {};

  return {
    ...profileRecord,
    budgetMin: Number(lifestyleProfile.budgetMin ?? profileRecord.budgetMin) || undefined,
    budgetMax: Number(lifestyleProfile.budgetMax ?? profileRecord.budgetMax) || undefined,
    preferredDistrict:
      String(userProfile.preferredDistrict ?? profileRecord.preferredDistrict ?? "") ||
      undefined,
    sleepTime: formatTimeValue(lifestyleProfile.sleepTime ?? profileRecord.sleepTime),
    wakeTime: formatTimeValue(lifestyleProfile.wakeTime ?? profileRecord.wakeTime),
    cleaningFrequency: String(
      lifestyleProfile.cleaningFrequency ?? profileRecord.cleaningFrequency ?? "",
    ) as ProfilePayload["cleaningFrequency"],
    privacyLevel: String(
      lifestyleProfile.privacyPreference ??
        userProfile.privacyLevel ??
        profileRecord.privacyLevel ??
        "",
    ) as ProfilePayload["privacyLevel"],
    noiseLevel: String(
      lifestyleProfile.noiseTolerance ?? profileRecord.noiseLevel ?? "",
    ) as ProfilePayload["noiseLevel"],
    guestFrequency: String(
      lifestyleProfile.guestFrequency ?? profileRecord.guestFrequency ?? "",
    ) as ProfilePayload["guestFrequency"],
    isSmoker: Boolean(lifestyleProfile.smoking ?? profileRecord.isSmoker),
    acceptSmoking: !Boolean(lifestyleProfile.smoking ?? profileRecord.isSmoker),
    hasPet: Boolean(lifestyleProfile.petFriendly ?? profileRecord.hasPet),
    acceptPet: Boolean(lifestyleProfile.petFriendly ?? profileRecord.acceptPet),
  };
}

function formatTimeValue(value: unknown) {
  if (!value) return undefined;

  const text = String(value);
  const match = text.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : undefined;
}

function normalizeProfile(
  profile: Partial<ProfilePayload>,
  userId: number,
): ProfileFormValues {
  const nextValues = {
    ...defaultValues,
    ...profile,
    userId,
  };

  return {
    ...nextValues,
    userId,
    preferredGender: isOneOf(nextValues.preferredGender, ["male", "female", "any"])
      ? nextValues.preferredGender
      : defaultValues.preferredGender,
    cleaningFrequency: isOneOf(nextValues.cleaningFrequency, [
      "daily",
      "weekly",
      "monthly",
    ])
      ? nextValues.cleaningFrequency
      : defaultValues.cleaningFrequency,
    privacyLevel: isOneOf(nextValues.privacyLevel, ["low", "medium", "high"])
      ? nextValues.privacyLevel
      : defaultValues.privacyLevel,
    noiseLevel: isOneOf(nextValues.noiseLevel, ["low", "medium", "high"])
      ? nextValues.noiseLevel
      : defaultValues.noiseLevel,
    guestFrequency: isOneOf(nextValues.guestFrequency, [
      "rare",
      "sometimes",
      "often",
    ])
      ? nextValues.guestFrequency
      : defaultValues.guestFrequency,
  };
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export default function ProfileForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadMessage, setLoadMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadProfile() {
      const storedUserId = getStoredUserId();

      if (!storedUserId) {
        setLoadMessage(
          "Chưa có mã người dùng trong trình duyệt. Bạn có thể nhập thủ công để tạo hồ sơ.",
        );
        setIsLoadingProfile(false);
        return;
      }

      reset({ ...defaultValues, userId: storedUserId });

      try {
        const result = await getProfile(storedUserId);
        const profile = getProfileData(result);

        if (profile) {
          reset(normalizeProfile(profile, storedUserId));
          setHasExistingProfile(true);
          setLoadMessage("Đã tải hồ sơ hiện có.");
        }
      } catch (err) {
        setHasExistingProfile(false);
        setLoadMessage(
          err instanceof Error && err.message.includes("404")
            ? "Chưa có hồ sơ. Bạn có thể tạo hồ sơ mới."
            : "Chưa tải được hồ sơ hiện có. Bạn vẫn có thể nhập và lưu lại.",
        );
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [reset]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      setSuccessMessage("");
      setSubmitError("");

      const payload: ProfilePayload = values;

      if (hasExistingProfile) {
        await updateProfile(values.userId, payload);
      } else {
        await createProfile(payload);
        setHasExistingProfile(true);
      }

      window.localStorage.setItem("userId", String(values.userId));
      setSuccessMessage(
        hasExistingProfile
          ? "Cập nhật hồ sơ thành công. Bạn có thể xem kết quả matching."
          : "Tạo hồ sơ thành công. Bạn có thể xem kết quả matching.",
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Không thể tạo hồ sơ.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        {isLoadingProfile ? "Đang kiểm tra hồ sơ hiện có..." : loadMessage}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Mã người dùng
          </label>
          <input
            type="number"
            {...register("userId")}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.budgetMax?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Giới tính mong muốn
          </label>
          <select
            {...register("preferredGender")}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
          <FieldError message={errors.wakeTime?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Tần suất dọn dẹp
          </label>
          <select
            {...register("cleaningFrequency")}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="rare">Hiếm khi</option>
            <option value="sometimes">Thỉnh thoảng</option>
            <option value="often">Thường xuyên</option>
          </select>
          <FieldError message={errors.guestFrequency?.message} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("hasPet")} />
          Có nuôi thú cưng
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("acceptPet")} />
          Chấp nhận bạn cùng phòng nuôi thú cưng
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("isSmoker")} />
          Có hút thuốc
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          <input type="checkbox" {...register("acceptSmoking")} />
          Chấp nhận bạn cùng phòng hút thuốc
        </label>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting || isLoadingProfile}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting
            ? "Đang lưu hồ sơ..."
            : hasExistingProfile
              ? "Cập nhật hồ sơ"
              : "Tạo hồ sơ"}
        </button>

        <Link
          href="/matches"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Xem kết quả matching
        </Link>
      </div>
    </form>
  );
}
