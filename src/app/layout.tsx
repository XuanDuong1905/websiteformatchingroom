import type { Metadata } from "next";
import AppNav from "@/components/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghép Trọ - Ghép Bạn",
  description: "Website tìm trọ và tìm bạn ở ghép cho sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
