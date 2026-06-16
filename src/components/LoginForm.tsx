"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/api/authApi";
import { saveAuthResult } from "@/lib/auth/storage";
import { AuthButton, AuthInput } from "@/components/auth";

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
      saveAuthResult(result);

      // TODO(Member 1): Confirm final post-login route once auth flow is finalized.
      router.push("/profile");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Không thể đăng nhập.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AuthInput
        label="Email sinh viên"
        type="email"
        placeholder="email@sv.edu.vn"
        error={errors.email?.message}
        {...register("email")}
      />

      <AuthInput
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <AuthButton type="submit" isLoading={isSubmitting}>
        Đăng nhập
      </AuthButton>

      <p className="text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
