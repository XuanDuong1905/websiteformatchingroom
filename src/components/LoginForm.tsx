"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api/authApi";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setSubmitError("");

      const result = await login(values);

      if (result?.token) {
        localStorage.setItem("token", result.token);
      }

      if (result?.user) {
        localStorage.setItem("user", JSON.stringify(result.user));

        if (result.user.id || result.user.userId) {
          localStorage.setItem(
            "userId",
            String(result.user.id || result.user.userId),
          );
        }
      }

      router.push("/profile");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Không thể đăng nhập.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="student@example.com"
            {...register("email")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.email?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            {...register("password")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.password?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p className="mt-5 text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-blue-600">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
