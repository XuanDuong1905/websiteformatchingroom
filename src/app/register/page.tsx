import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_520px] md:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Ghép Trọ - Ghép Bạn
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Tạo tài khoản sinh viên
          </h1>
          <p className="mt-4 text-gray-600">
            Đăng ký tài khoản để tạo hồ sơ ở ghép, tìm bạn cùng phòng phù hợp và
            xem kết quả matching dựa trên thói quen sinh hoạt.
          </p>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
