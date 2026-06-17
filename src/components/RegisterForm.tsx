"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { studentRegisterSchema, type StudentRegisterInput } from "@/lib/validations/auth";
import { sendOtp, verifyOtp, register as apiRegister } from "@/lib/api/authApi";
import { AuthButton, AuthInput } from "@/components/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Cooldown timer for sending OTP
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
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

  async function handleSendOtpClick() {
    // Validate Step 1 fields
    const isValid = await trigger(["fullName", "email", "password", "confirmPassword", "university"]);
    if (!isValid) return;

    const email = getValues("email");
    try {
      setSubmitError("");
      setSuccessMessage("");
      setIsSendingOtp(true);
      
      const res = await sendOtp(email);
      setSuccessMessage(res?.message || "Mã OTP đã được gửi đến email của bạn.");
      setStep(2);
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Không thể gửi mã OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    const email = getValues("email");
    try {
      setSubmitError("");
      setSuccessMessage("");
      setIsSendingOtp(true);
      
      const res = await sendOtp(email);
      setSuccessMessage(res?.message || "Đã gửi lại mã OTP thành công.");
      setCooldown(60);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Không thể gửi lại mã OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function onSubmit(values: StudentRegisterInput) {
    if (!otp) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError("Mã OTP phải có đúng 6 chữ số");
      return;
    }

    try {
      setSubmitError("");
      setOtpError("");
      setIsRegistering(true);

      // 1. Verify OTP
      await verifyOtp(values.email, otp);

      // 2. Register
      const res = await apiRegister(values);

      setSuccessMessage(res?.message || "Đăng ký tài khoản thành công! Đang chuyển hướng...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendOtpClick();
          }}
          className="space-y-5"
        >
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
            placeholder="sv@hcmut.edu.vn"
            error={errors.email?.message}
            {...register("email")}
          />

          <AuthInput
            label="Trường đại học"
            type="text"
            placeholder="Đại học Quốc gia TP.HCM"
            error={errors.university?.message}
            {...register("university")}
          />

          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <AuthButton type="submit" isLoading={isSendingOtp}>
            Tiếp tục (Nhận mã OTP)
          </AuthButton>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Thông tin đăng ký của bạn:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Họ tên: {getValues("fullName")}</li>
              <li>Email: {getValues("email")}</li>
              <li>Trường: {getValues("university")}</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSubmitError("");
                setSuccessMessage("");
              }}
              className="mt-3 font-semibold text-cyan-600 hover:text-cyan-700 transition hover:underline"
            >
              ← Quay lại chỉnh sửa thông tin
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nhập mã OTP gồm 6 chữ số
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setOtp(val);
                if (val.length === 6) setOtpError("");
              }}
              placeholder="123456"
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-center text-2xl font-bold tracking-widest text-slate-900 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 ${
                otpError ? "border-red-300" : "border-slate-200"
              }`}
            />
            {otpError && <p className="mt-2 text-sm text-red-500">{otpError}</p>}
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-pulse">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <AuthButton type="submit" isLoading={isRegistering}>
              Xác thực & Đăng ký
            </AuthButton>

            <button
              type="button"
              disabled={cooldown > 0 || isSendingOtp}
              onClick={handleResendOtp}
              className="w-full py-2.5 text-sm font-semibold text-cyan-600 border border-cyan-200 rounded-2xl hover:bg-cyan-50/50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Gửi lại mã OTP sau (${cooldown}s)` : "Gửi lại mã OTP"}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
