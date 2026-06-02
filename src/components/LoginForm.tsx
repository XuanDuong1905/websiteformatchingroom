"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/api/authApi";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function storeAuthResult(result: unknown) {
  if (!result || typeof result !== "object") return;

  const data = result as Record<string, unknown>;
  const token = data.token;
  const user = data.user;

  if (typeof token === "string") {
    localStorage.setItem("token", token);
  }

  if (user && typeof user === "object") {
    const userRecord = user as Record<string, unknown>;
    localStorage.setItem("user", JSON.stringify(userRecord));

    const userId = userRecord.id || userRecord.userId;
    if (typeof userId === "number" || typeof userId === "string") {
      localStorage.setItem("userId", String(userId));
    }
  }
}

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
      storeAuthResult(result);

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
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="student@example.com"
            {...register("email")}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.password?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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
