import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Ghép Trọ - Ghép Bạn",
  description: "Nền tảng tìm kiếm phòng trọ và người ở ghép minh bạch, an toàn dành cho sinh viên.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Page content rendered here */}
        {children}

        {/* Global Footer & ScrollToTop components */}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}