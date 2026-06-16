"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerStudent } from "@/lib/api/authApi";
import {
  studentRegisterSchema,
  type StudentRegisterInput,
} from "@/lib/validations/auth";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      university: "",
    },
  });

  async function onSubmit(values: StudentRegisterInput) {
    try {
      setSubmitError("");
      setSuccessMessage("");

      await registerStudent(values);
      setSuccessMessage("Đăng ký sinh viên thành công. Bạn có thể đăng nhập ngay.");
      reset();
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể đăng ký tài khoản.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <Link href="/register" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
              Quay lại chọn vai trò
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Đăng ký sinh viên
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Email sinh viên phải kết thúc bằng .edu.vn để hệ thống xác thực đúng nhóm người dùng.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
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

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email sinh viên
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="ten@truong.edu.vn"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
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
                Trường đại học
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Đại học Quốc gia TP.HCM"
                {...register("university")}
              />
              {errors.university?.message && (
                <p className="mt-2 text-sm text-red-600">{errors.university.message}</p>
              )}
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
                disabled={isSubmitting}
                className="w-full rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản sinh viên"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
