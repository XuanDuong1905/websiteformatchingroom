"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthButton, AuthInput, AuthLayout } from "@/components/auth";
import { login } from "@/lib/api/authApi";
import { saveAuthResult } from "@/lib/auth/storage";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function getRoleFromAuthResult(result: unknown) {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const data = record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : null;
  const user = data?.user && typeof data.user === "object"
    ? (data.user as Record<string, unknown>)
    : null;

  return typeof user?.role === "string" ? user.role : null;
}

function getNextPath(role?: string | null) {
  if (typeof window === "undefined") return role === "ADMIN" ? "/admin" : "/profile";

  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;

  if (role === "ADMIN") return "/admin";
  if (role === "LANDLORD") return "/landlord/rooms/new";

  return "/profile";
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
      router.push(getNextPath(getRoleFromAuthResult(result)));
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể đăng nhập.",
      );
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-xl shadow-slate-200/50 backdrop-blur-sm lg:grid lg:min-h-[540px] lg:grid-cols-2">

          {/* ── Left: Brand Panel ── */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0891B2] via-[#0284C7] to-[#0369A1] lg:flex lg:flex-col lg:justify-center">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-200/15" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-20 right-8 h-20 w-20 rounded-full bg-sky-200/10" aria-hidden="true" />

            <div className="relative z-10 px-10 py-14 xl:px-14">
              {/* Brand */}
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-bold text-white/90">
                  Ghép Trọ - Ghép Bạn
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
                Xin chào,<br />
                mừng bạn trở lại!
              </h1>

              {/* Description */}
              <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-cyan-50/85">
                Đăng nhập để tìm phòng phù hợp, ghép bạn ở cùng hoặc quản lý tin trọ của bạn.
              </p>

              {/* Highlight pills */}
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  Tìm phòng
                </span>
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  Ghép bạn
                </span>
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  Đăng tin trọ
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Login Form ── */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile-only branding */}
              <div className="mb-6 flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600">
                  <Home className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-base font-bold text-slate-800">
                  Ghép Trọ - Ghép Bạn
                </span>
              </div>

              {/* Form header */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Đăng nhập
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Truy cập tài khoản Ghép Trọ - Ghép Bạn của bạn
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
                <AuthInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  icon={<Mail className="h-4.5 w-4.5" />}
                  error={errors.email?.message}
                  {...register("email")}
                />

                <AuthInput
                  label="Mật khẩu"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  icon={<Lock className="h-4.5 w-4.5" />}
                  error={errors.password?.message}
                  {...register("password")}
                />

                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {submitError}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                  </div>
                )}

                <AuthButton type="submit" isLoading={isSubmitting}>
                  Đăng nhập
                </AuthButton>
              </form>

              {/* Register links */}
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Chưa có tài khoản?</p>
                <div className="flex gap-4">
                  <Link
                    href="/register/student"
                    className="text-sm font-medium text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    Đăng ký sinh viên
                  </Link>
                  <Link
                    href="/register/landlord"
                    className="text-sm font-medium text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    Đăng ký chủ trọ
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AuthLayout>
  );
}
