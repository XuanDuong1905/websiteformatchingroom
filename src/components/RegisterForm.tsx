"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUser } from "@/lib/api/authApi";
import { saveAuthResult } from "@/lib/auth/storage";
import { AuthButton, AuthInput } from "@/components/auth";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setSubmitError("");

      // TODO(Member 1): Confirm whether register accepts only fullName/email/password.
      const result = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      saveAuthResult(result);
      // TODO(Member 1): Confirm whether register should auto-login or redirect to login.
      router.push("/profile");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Không thể tạo tài khoản.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        label="Họ và tên"
        type="text"
        placeholder="Nguyễn Văn A"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

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

      <AuthInput
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <AuthButton type="submit" isLoading={isSubmitting}>
        Tạo tài khoản
      </AuthButton>

      <p className="text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
