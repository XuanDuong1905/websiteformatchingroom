"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerLandlord } from "@/lib/api/authApi";
import { uploadLicenseImage } from "@/lib/api/uploadApi";
import {
  landlordRegisterSchema,
  type LandlordRegisterInput,
} from "@/lib/validations/auth";

const MAX_LICENSE_SIZE = 5 * 1024 * 1024;
const LICENSE_TYPES = new Set(["image/jpeg", "image/png"]);

function isValidLicenseFile(file: File) {
  if (!LICENSE_TYPES.has(file.type)) {
    return "Chỉ chấp nhận ảnh JPG, JPEG hoặc PNG.";
  }

  if (file.size > MAX_LICENSE_SIZE) {
    return "Ảnh giấy phép không được vượt quá 5MB.";
  }

  return "";
}

export default function LandlordRegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LandlordRegisterInput>({
    resolver: zodResolver(landlordRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessLicenseImage: "",
    },
  });

  async function handleLicenseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError("");
    setUploadMessage("");
    setUploadedUrl("");
    setValue("businessLicenseImage", "", { shouldValidate: true });

    if (!file) {
      return;
    }

    const fileError = isValidLicenseFile(file);

    if (fileError) {
      setUploadError(fileError);
      setError("businessLicenseImage", { message: fileError });
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadLicenseImage(file);
      setUploadedUrl(url);
      setValue("businessLicenseImage", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors("businessLicenseImage");
      setUploadMessage("Upload giấy phép thành công.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể upload giấy phép.";
      setUploadError(message);
      setError("businessLicenseImage", { message });
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: LandlordRegisterInput) {
    if (isUploading) {
      setSubmitError("Vui lòng chờ upload giấy phép hoàn tất.");
      return;
    }

    try {
      setSubmitError("");
      setSuccessMessage("");

      await registerLandlord(values);
      setSuccessMessage("Đăng ký chủ trọ thành công. Bạn có thể đăng nhập ngay.");
      reset();
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể đăng ký tài khoản chủ trọ.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto w-full max-w-4xl">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <Link href="/register" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
              Quay lại chọn vai trò
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Đăng ký chủ trọ
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tài khoản chủ trọ cần giấy phép kinh doanh và sẽ chờ quản trị viên xét duyệt.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
            <input type="hidden" {...register("businessLicenseImage")} />

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Họ và tên
              </label>
              <input
                type="text"
                autoComplete="name"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Nguyễn Văn A"
                {...register("fullName")}
              />
              {errors.fullName?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                autoComplete="tel"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="0901234567"
                {...register("phone")}
              />
              {errors.phone?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tên cơ sở kinh doanh
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Nhà trọ Minh Anh"
                {...register("businessName")}
              />
              {errors.businessName?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Tối thiểu 8 ký tự"
                {...register("password")}
              />
              {errors.password?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Ảnh giấy phép kinh doanh
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleLicenseChange}
                className="w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <div className="mt-2 space-y-2 text-sm">
                {isUploading && <p className="text-slate-600">Đang upload giấy phép...</p>}
                {uploadMessage && <p className="text-emerald-700">{uploadMessage}</p>}
                {(uploadError || errors.businessLicenseImage?.message) && (
                  <p className="text-red-600">
                    {uploadError || errors.businessLicenseImage?.message}
                  </p>
                )}
                {uploadedUrl && (
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex font-medium text-cyan-700 hover:text-cyan-800"
                  >
                    Xem ảnh đã upload
                  </a>
                )}
              </div>
            </div>

            {submitError && (
              <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {successMessage && (
              <div className="sm:col-span-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang gửi đăng ký..." : "Gửi đăng ký chủ trọ"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
