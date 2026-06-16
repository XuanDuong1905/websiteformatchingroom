"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProfile,
  getProfile,
  type ProfilePayload,
  updateProfile,
} from "@/lib/api/profileApi";
import { getStoredUserId } from "@/lib/auth/storage";

// ─── Zod schema (unchanged) ──────────────────────────────────────────────────

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
    guestFrequency: z.enum(["rarely", "sometimes", "often"]),
    cookingFrequency: z.enum(["rarely", "sometimes", "often"]),
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
  guestFrequency: "rarely",
  cookingFrequency: "sometimes",
};

// ─── Budget display helpers ──────────────────────────────────────────────────

function formatBudgetDisplay(value: number): string {
  if (!value || value <= 0) return "";
  return value.toLocaleString("de-DE");
}

function parseBudgetInput(display: string): number {
  const cleaned = display.replace(/\./g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

// ─── Reusable UI fragments ──────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 transition-colors duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100";

const budgetInputClass =
  "w-full rounded-l-xl border border-r-0 border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 transition-colors duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100";

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 transition-colors duration-200 hover:border-slate-300 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-semibold tracking-normal text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

function ProfileSection({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-100/80 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 text-xs font-bold text-white shadow-sm">
          {badge}
        </span>
        <div>
          <h3 className="text-base font-semibold tracking-normal text-slate-800">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4 transition-colors hover:border-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium tracking-normal text-slate-700">
            {label}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${
            checked
              ? "bg-gradient-to-r from-cyan-500 to-sky-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
              checked ? "translate-x-[1.3rem]" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Profile data extraction helpers (unchanged) ────────────────────────────

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
    cookingFrequency: String(
      lifestyleProfile.cookingFrequency ?? profileRecord.cookingFrequency ?? "",
    ) as ProfilePayload["cookingFrequency"],
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
      "rarely",
      "sometimes",
      "often",
    ])
      ? nextValues.guestFrequency
      : defaultValues.guestFrequency,
    cookingFrequency: isOneOf(nextValues.cookingFrequency, [
      "rarely",
      "sometimes",
      "often",
    ])
      ? nextValues.cookingFrequency
      : defaultValues.cookingFrequency,
  };
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

// ─── Main form component ────────────────────────────────────────────────────

export default function ProfileForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadMessage, setLoadMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Budget display state (formatted strings for user-friendly input)
  const [minBudgetDisplay, setMinBudgetDisplay] = useState(
    formatBudgetDisplay(defaultValues.budgetMin),
  );
  const [maxBudgetDisplay, setMaxBudgetDisplay] = useState(
    formatBudgetDisplay(defaultValues.budgetMax),
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadProfile() {
      const storedUserId = getStoredUserId();

      if (!storedUserId) {
        // Profile page gates this — but handle defensively
        setLoadMessage("");
        setIsLoadingProfile(false);
        return;
      }

      const valuesWithUserId = { ...defaultValues, userId: storedUserId };
      reset(valuesWithUserId);
      setMinBudgetDisplay(formatBudgetDisplay(valuesWithUserId.budgetMin));
      setMaxBudgetDisplay(formatBudgetDisplay(valuesWithUserId.budgetMax));

      try {
        const result = await getProfile(storedUserId);
        const profile = getProfileData(result);

        if (profile) {
          const normalized = normalizeProfile(profile, storedUserId);
          reset(normalized);
          setMinBudgetDisplay(formatBudgetDisplay(normalized.budgetMin));
          setMaxBudgetDisplay(formatBudgetDisplay(normalized.budgetMax));
          setHasExistingProfile(true);
          setLoadMessage("");
        }
      } catch (err) {
        setHasExistingProfile(false);
        setLoadMessage(
          err instanceof Error && err.message.includes("404")
            ? "Hoàn tất thông tin bên dưới để tạo hồ sơ ở ghép."
            : "Không thể tải hồ sơ. Vui lòng thử lại sau.",
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
      className="space-y-6"
    >
      {/* Hidden userId field — required by API but not user-facing */}
      <input type="hidden" {...register("userId")} />

      {/* Status message — only show when there is a message */}
      {(isLoadingProfile || loadMessage) && (
        <div className="rounded-2xl border border-cyan-100/80 bg-gradient-to-r from-cyan-50/60 to-sky-50/40 px-4 py-3 text-sm text-cyan-700">
          {isLoadingProfile ? "Đang tải hồ sơ..." : loadMessage}
        </div>
      )}

      {/* Section 1: Basic info */}
      <ProfileSection
        badge="1"
        title="Thông tin cơ bản"
        description="Thiết lập ngân sách, khu vực mong muốn và tiêu chí tìm bạn ở ghép."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Ngân sách tối thiểu" required>
            <div className="flex">
              <input
                type="text"
                inputMode="numeric"
                value={minBudgetDisplay}
                onChange={(e) => {
                  const num = parseBudgetInput(e.target.value);
                  setValue("budgetMin", num, { shouldValidate: true });
                  setMinBudgetDisplay(e.target.value);
                }}
                onBlur={() => {
                  const num = parseBudgetInput(minBudgetDisplay);
                  setValue("budgetMin", num, { shouldValidate: true });
                  setMinBudgetDisplay(formatBudgetDisplay(num));
                }}
                className={budgetInputClass}
              />
              <span className="inline-flex items-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-100/80 px-3 text-xs font-medium text-slate-500">
                VNĐ
              </span>
            </div>
            <FieldError message={errors.budgetMin?.message} />
          </FormField>
          <FormField label="Ngân sách tối đa" required>
            <div className="flex">
              <input
                type="text"
                inputMode="numeric"
                value={maxBudgetDisplay}
                onChange={(e) => {
                  const num = parseBudgetInput(e.target.value);
                  setValue("budgetMax", num, { shouldValidate: true });
                  setMaxBudgetDisplay(e.target.value);
                }}
                onBlur={() => {
                  const num = parseBudgetInput(maxBudgetDisplay);
                  setValue("budgetMax", num, { shouldValidate: true });
                  setMaxBudgetDisplay(formatBudgetDisplay(num));
                }}
                className={budgetInputClass}
              />
              <span className="inline-flex items-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-100/80 px-3 text-xs font-medium text-slate-500">
                VNĐ
              </span>
            </div>
            <FieldError message={errors.budgetMax?.message} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Khu vực mong muốn" required>
            <input
              type="text"
              placeholder="Ví dụ: Thu Duc"
              {...register("preferredDistrict")}
              className={inputClass}
            />
            <FieldError message={errors.preferredDistrict?.message} />
          </FormField>
          <FormField label="Giới tính mong muốn">
            <select
              {...register("preferredGender")}
              className={selectClass}
            >
              <option value="any">Bất kỳ</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
            <FieldError message={errors.preferredGender?.message} />
          </FormField>
        </div>
      </ProfileSection>

      {/* Section 2: Constraints */}
      <ProfileSection
        badge="2"
        title="Ràng buộc bắt buộc"
        description="Các điều kiện quan trọng dùng để lọc những hồ sơ không phù hợp."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            name="hasPet"
            control={control}
            render={({ field }) => (
              <ToggleSwitch
                label="Có nuôi thú cưng"
                checked={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="acceptPet"
            control={control}
            render={({ field }) => (
              <ToggleSwitch
                label="Chấp nhận thú cưng"
                checked={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="isSmoker"
            control={control}
            render={({ field }) => (
              <ToggleSwitch
                label="Có hút thuốc"
                checked={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="acceptSmoking"
            control={control}
            render={({ field }) => (
              <ToggleSwitch
                label="Chấp nhận hút thuốc"
                checked={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>
      </ProfileSection>

      {/* Section 3: Lifestyle habits */}
      <ProfileSection
        badge="3"
        title="Thói quen sinh hoạt"
        description="Những thói quen hằng ngày giúp hệ thống gợi ý người ở ghép tương đồng hơn."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Giờ ngủ" required>
            <input
              type="time"
              {...register("sleepTime")}
              className={inputClass}
            />
            <FieldError message={errors.sleepTime?.message} />
          </FormField>
          <FormField label="Giờ thức dậy" required>
            <input
              type="time"
              {...register("wakeTime")}
              className={inputClass}
            />
            <FieldError message={errors.wakeTime?.message} />
          </FormField>
          <FormField label="Tần suất dọn dẹp">
            <select
              {...register("cleaningFrequency")}
              className={selectClass}
            >
              <option value="daily">Hằng ngày</option>
              <option value="weekly">Hằng tuần</option>
              <option value="monthly">Hằng tháng</option>
            </select>
            <FieldError message={errors.cleaningFrequency?.message} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Mức độ riêng tư">
            <select
              {...register("privacyLevel")}
              className={selectClass}
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
            <FieldError message={errors.privacyLevel?.message} />
          </FormField>
          <FormField label="Mức chấp nhận tiếng ồn">
            <select
              {...register("noiseLevel")}
              className={selectClass}
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
            <FieldError message={errors.noiseLevel?.message} />
          </FormField>
          <FormField label="Tần suất có khách">
            <select
              {...register("guestFrequency")}
              className={selectClass}
            >
              <option value="rarely">Hiếm khi</option>
              <option value="sometimes">Thỉnh thoảng</option>
              <option value="often">Thường xuyên</option>
            </select>
            <FieldError message={errors.guestFrequency?.message} />
          </FormField>
          <FormField label="Sở thích nấu ăn">
            <select
              {...register("cookingFrequency")}
              className={selectClass}
            >
              <option value="rarely">Hiếm khi</option>
              <option value="sometimes">Thỉnh thoảng</option>
              <option value="often">Thường xuyên</option>
            </select>
            <FieldError message={errors.cookingFrequency?.message} />
          </FormField>
        </div>
      </ProfileSection>

      {/* Success / Error messages */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {submitError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting || isLoadingProfile}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold tracking-normal text-white shadow-md transition-all duration-200 hover:from-cyan-700 hover:to-sky-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Đang lưu hồ sơ..."
            : hasExistingProfile
              ? "Cập nhật hồ sơ"
              : "Tạo hồ sơ"}
        </button>

        <Link
          href="/matches"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold tracking-normal text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
        >
          Xem kết quả matching
        </Link>
      </div>
    </form>
  );
}
