import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_35px_90px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <div className="p-8 sm:p-10 lg:p-12">{children}</div>
        </div>
      </section>
    </main>
  );
}
