"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/api/authApi";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
    gender: z.enum(["male", "female", "other"]),
    school: z.string().min(1, "Vui lòng nhập trường học"),
    phone: z.string().optional(),
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
      gender: "male",
      school: "",
      phone: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setSubmitError("");

      const result = await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        gender: values.gender,
        school: values.school,
        phone: values.phone,
      });

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
        err instanceof Error ? err.message : "Không thể đăng ký tài khoản.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            {...register("fullName")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.fullName?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
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
            placeholder="Ít nhất 6 ký tự"
            {...register("password")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.password?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Nhập lại mật khẩu
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register("confirmPassword")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.confirmPassword?.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Giới tính</label>
          <select
            {...register("gender")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          {errors.gender?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Trường học
          </label>
          <input
            type="text"
            placeholder="Ví dụ: HCMUS, UIT, UTE..."
            {...register("school")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.school?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            placeholder="Không bắt buộc"
            {...register("phone")}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          {errors.phone?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      <p className="mt-5 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-blue-600">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
