import RegisterForm from "@/components/RegisterForm";
import { AuthLayout } from "@/components/auth";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="text-center">
          <p className="text-base font-bold tracking-normal text-cyan-600">
            Ghép Trọ - Ghép Bạn
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Tạo tài khoản
          </h1>
        </div>

        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
