import Link from "next/link";

const accountTypes = [
  {
    href: "/register/student",
    title: "Sinh viên",
    description: "Tạo hồ sơ tìm phòng và tìm bạn ở ghép phù hợp.",
    action: "Đăng ký sinh viên",
  },
  {
    href: "/register/landlord",
    title: "Chủ trọ",
    description: "Gửi thông tin kinh doanh để quản trị viên xét duyệt.",
    action: "Đăng ký chủ trọ",
  },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-cyan-700">Ghép Trọ - Ghép Bạn</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Chọn loại tài khoản
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Mỗi vai trò có quy trình đăng ký riêng để thông tin được xác thực rõ ràng.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {accountTypes.map((type) => (
              <Link
                key={type.href}
                href={type.href}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-950">{type.title}</h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                  {type.description}
                </p>
                <span className="mt-6 inline-flex rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
                  {type.action}
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
