import { NextResponse } from "next/server";
import { sendOtpEmail, isSmtpConfigured } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { hashOtp } from "@/lib/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const purpose = body?.purpose?.trim() || "verify_email";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email không được để trống" },
        { status: 400 }
      );
    }

    // Check if email contains .edu
    if (!email.includes(".edu")) {
      return NextResponse.json(
        { success: false, message: "Vui lòng sử dụng mail sinh viên" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email đã được sử dụng" },
        { status: 409 }
      );
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { success: false, message: "Chưa cấu hình email SMTP để gửi OTP" },
        { status: 500 }
      );
    }

    // 1. Chống spam: kiểm tra xem email này vừa gửi OTP trong vòng 60 giây gần nhất hay chưa
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        email,
        purpose,
        createdAt: { gte: oneMinuteAgo },
        usedAt: null,
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới." },
        { status: 429 }
      );
    }

    // 2. Vô hiệu hóa tất cả các OTP cũ chưa sử dụng của email và purpose này
    await prisma.otpCode.updateMany({
      where: {
        email,
        purpose,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // 3. Tạo mã OTP mới ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Băm (hash) mã OTP trước khi lưu vào database để đảm bảo an toàn bảo mật
    const codeHash = hashOtp(otp, email);

    // 5. Thiết lập thời gian hết hạn: 5 phút từ bây giờ
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 6. Lưu OTP mới vào bảng OtpCode
    await prisma.otpCode.create({
      data: {
        email,
        codeHash,
        purpose,
        expiresAt,
      },
    });

    // TODO: Production nên triển khai thêm rate limit theo IP để chống spam/DDOS gửi email hàng loạt.

    // 7. Gửi email OTP thật tới người dùng
    await sendOtpEmail(email, otp);

    return NextResponse.json(
      { success: true, message: "Mã OTP đã được gửi đến email của bạn." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/send-otp failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể gửi OTP. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
