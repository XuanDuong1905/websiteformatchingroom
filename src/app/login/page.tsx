import LoginForm from "@/components/LoginForm";
import { AuthLayout } from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Ghép Trọ - Ghép Bạn
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
            Đăng nhập
          </h1>
        </div>

        <LoginForm />
      </div>
    </AuthLayout>
  );
}
