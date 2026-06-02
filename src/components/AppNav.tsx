import Link from "next/link";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/login", label: "Đăng nhập" },
  { href: "/register", label: "Đăng ký" },
  { href: "/profile", label: "Hồ sơ ở ghép" },
  { href: "/matches", label: "Kết quả matching" },
];

export default function AppNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold text-blue-600">
          Ghép Trọ - Ghép Bạn
        </Link>

        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
