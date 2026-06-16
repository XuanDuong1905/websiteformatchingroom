import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AppNav from "@/components/AppNav";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Ghép Trọ - Ghép Bạn",
  description:
    "Nền tảng tìm kiếm phòng trọ và người ở ghép minh bạch, an toàn dành cho sinh viên.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <AppNav />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
