"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { login } from "@/lib/api/authApi";
import { saveAuthResult } from "@/lib/auth/storage";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function getNextPath() {
  if (typeof window === "undefined") return "/profile";

  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
}

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      setSubmitError("");
      setSuccessMessage("");

      const result = await login(values);
      saveAuthResult(result);
      setSuccessMessage("Đăng nhập thành công.");
      router.push(getNextPath());
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể đăng nhập.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-slate-950 p-8 text-white sm:p-10">
            <p className="text-sm font-semibold text-cyan-300">Ghép Trọ - Ghép Bạn</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Đăng nhập
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Truy cập hồ sơ, kết quả ghép bạn, hoặc bảng duyệt chủ trọ theo vai trò của bạn.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="email@example.com"
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
                  autoComplete="current-password"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Nhập mật khẩu"
                  {...register("password")}
                />
                {errors.password?.message && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/register/student" className="font-medium text-cyan-700 hover:text-cyan-800">
                  Đăng ký sinh viên
                </Link>
                <Link href="/register/landlord" className="font-medium text-cyan-700 hover:text-cyan-800">
                  Đăng ký chủ trọ
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
