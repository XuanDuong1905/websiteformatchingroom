import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Hồ sơ người ở ghép
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Tạo hồ sơ tìm bạn ở ghép
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Điền thông tin ngân sách, khu vực và thói quen sinh hoạt để hệ
            thống có thể ghép bạn cùng phòng phù hợp.
          </p>
        </div>

        <ProfileForm />
      </section>
    </main>
  );
}
