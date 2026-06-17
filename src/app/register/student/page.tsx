"use client";

import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function StudentRegisterPage() {
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
              Vui lòng đăng ký bằng mail sinh viên
            </p>
          </div>

          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
