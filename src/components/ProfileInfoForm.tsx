"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getMyProfileInfo,
  updateMyProfileInfo,
  type PersonalProfile,
} from "@/lib/api/profileInfoApi";
import { saveStoredUser } from "@/lib/auth/storage";
import {
  personalProfileSchema,
  type PersonalProfileFormInput,
} from "@/lib/validations/personalProfile";
import { uploadAvatar } from "@/lib/api/uploadApi";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const defaultValues: PersonalProfileFormInput = {
  fullName: "",
  phone: "",
  gender: "unknown",
  dateOfBirth: "",
  avatarUrl: "",
  school: "",
  occupation: "",
  address: "",
  district: "",
  bio: "",
  identityNumber: "",
  businessName: "",
};

function toFormValues(profile: PersonalProfile): PersonalProfileFormInput {
  return {
    fullName: profile.fullName,
    phone: profile.phone || "",
    gender: profile.gender || "unknown",
    dateOfBirth: profile.dateOfBirth || "",
    avatarUrl: profile.avatarUrl || "",
    school: profile.school || "",
    occupation: profile.occupation || "",
    address: profile.address || "",
    district: profile.district || "",
    bio: profile.bio || "",
    identityNumber: profile.landlord?.identityNumber || "",
    businessName: profile.landlord?.businessName || "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function updateStoredUser(profile: PersonalProfile) {
  saveStoredUser({
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    status: profile.status,
  });
  window.dispatchEvent(new Event("auth-change"));
}

export default function ProfileInfoForm() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PersonalProfileFormInput>({
    resolver: zodResolver(personalProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError("");
        const data = await getMyProfileInfo();

        if (!isMounted) return;
        setProfile(data);
        reset(toFormValues(data));
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin cá nhân.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  async function onSubmit(values: PersonalProfileFormInput) {
    try {
      setSubmitError("");
      setSuccessMessage("");

      const updatedProfile = await updateMyProfileInfo(values);
      setProfile(updatedProfile);
      reset(toFormValues(updatedProfile));
      if (updatedProfile.avatarUrl) {
        setAvatarPreview(updatedProfile.avatarUrl);
      }
      updateStoredUser(updatedProfile);
      setSuccessMessage("Cập nhật thông tin cá nhân thành công.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thông tin cá nhân.",
      );
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setAvatarUploadError("");

    try {
      setIsUploadingAvatar(true);
      const uploadedUrl = await uploadAvatar(file);
      setValue("avatarUrl", uploadedUrl, { shouldValidate: true, shouldDirty: true });
      setAvatarPreview(uploadedUrl);
    } catch (err) {
      setAvatarUploadError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Tài khoản</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Thông tin cá nhân
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Quản lý thông tin hiển thị và thông tin liên hệ của bạn.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Về trang chủ
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Đang tải thông tin cá nhân...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p>{loadError}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Thông tin cơ bản
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Họ tên</label>
                  <input className={inputClass} {...register("fullName")} />
                  <FieldError message={errors.fullName?.message} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={`${inputClass} bg-slate-100 text-slate-500`}
                    value={profile?.email ?? ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className={labelClass}>Số điện thoại</label>
                  <input className={inputClass} {...register("phone")} />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div>
                  <label className={labelClass}>Giới tính</label>
                  <select className={inputClass} {...register("gender")}>
                    <option value="unknown">Chưa cập nhật</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <FieldError message={errors.gender?.message} />
                </div>
                <div>
                  <label className={labelClass}>Ngày sinh</label>
                  <input type="date" className={inputClass} {...register("dateOfBirth")} />
                  <FieldError message={errors.dateOfBirth?.message} />
                </div>
                <div className="md:col-span-2 flex flex-col items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className={labelClass}>Ảnh đại diện</span>
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500 bg-slate-200 flex items-center justify-center shadow-md">
                      {avatarPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-bold text-2xl">
                          {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "?"}
                        </span>
                      )}
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Tải ảnh lên
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">Định dạng JPG, PNG. Tối đa 5MB.</p>
                    {avatarUploadError && <p className="text-xs text-red-500 mt-1">{avatarUploadError}</p>}
                    {/* Input ẩn để gắn kết giá trị avatarUrl với react-hook-form */}
                    <input type="hidden" {...register("avatarUrl")} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Thông tin học tập và liên hệ
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Trường học</label>
                  <input className={inputClass} {...register("school")} />
                  <FieldError message={errors.school?.message} />
                </div>
                <div>
                  <label className={labelClass}>Nghề nghiệp</label>
                  <input className={inputClass} {...register("occupation")} />
                  <FieldError message={errors.occupation?.message} />
                </div>
                <div>
                  <label className={labelClass}>Địa chỉ</label>
                  <input className={inputClass} {...register("address")} />
                  <FieldError message={errors.address?.message} />
                </div>
                <div>
                  <label className={labelClass}>Quận/Huyện</label>
                  <input className={inputClass} {...register("district")} />
                  <FieldError message={errors.district?.message} />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Giới thiệu</label>
                <textarea rows={4} className={inputClass} {...register("bio")} />
                <FieldError message={errors.bio?.message} />
              </div>
            </div>

            {profile?.role === "LANDLORD" && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Thông tin chủ trọ
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Tên cơ sở kinh doanh</label>
                    <input className={inputClass} {...register("businessName")} />
                    <FieldError message={errors.businessName?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Số giấy tờ định danh</label>
                    <input className={inputClass} {...register("identityNumber")} />
                    <FieldError message={errors.identityNumber?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Trạng thái xác minh</label>
                    <input
                      className={`${inputClass} bg-slate-100 text-slate-500`}
                      value={profile.landlord?.verificationStatus ?? profile.status}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giấy phép kinh doanh</label>
                    {profile.landlord?.businessLicenseImage ? (
                      <a
                        href={profile.landlord.businessLicenseImage}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-cyan-200 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                      >
                        Xem giấy phép
                      </a>
                    ) : (
                      <p className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-500">
                        Chưa có giấy phép trong hồ sơ.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
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
                className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <Link
                href="/profile"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Hồ sơ ở ghép
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
