import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Ghép Trọ - Ghép Bạn
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Đăng nhập để tìm bạn ở ghép phù hợp
          </h1>
          <p className="mt-4 text-gray-600">
            Sau khi đăng nhập, bạn có thể tạo hồ sơ sinh hoạt, xem điểm phù hợp
            và các lý do matching do hệ thống gợi ý.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
