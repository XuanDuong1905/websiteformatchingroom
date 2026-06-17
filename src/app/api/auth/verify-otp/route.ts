import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOtp } from "@/lib/otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const otp = body?.otp?.trim();
    const purpose = body?.purpose?.trim() || "verify_email";

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email và OTP không được để trống" },
        { status: 400 }
      );
    }

    // 1. Tìm bản ghi OTP mới nhất chưa sử dụng của email và purpose này
    const latestOtp = await prisma.otpCode.findFirst({
      where: {
        email,
        purpose,
        usedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestOtp) {
      return NextResponse.json(
        { success: false, message: "Mã OTP không tồn tại hoặc đã được sử dụng" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra giới hạn số lần nhập sai (tối đa 5 lần)
    if (latestOtp.attempts >= 5) {
      return NextResponse.json(
        { success: false, message: "Mã OTP đã bị vô hiệu hóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới." },
        { status: 400 }
      );
    }

    // 3. Kiểm tra tính hết hạn (5 phút)
    if (latestOtp.expiresAt < new Date()) {
      // Đánh dấu mã đã hết hạn là đã sử dụng để dọn dẹp trạng thái
      await prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: { usedAt: new Date() },
      });

      return NextResponse.json(
        { success: false, message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." },
        { status: 400 }
      );
    }

    // 4. Băm mã OTP do client gửi lên để đối chiếu với mã băm trong database
    const submittedHash = hashOtp(otp, email);

    if (latestOtp.codeHash !== submittedHash) {
      const newAttempts = latestOtp.attempts + 1;
      const isMaxed = newAttempts >= 5;

      // Cập nhật số lần thử sai vào database
      await prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: {
          attempts: newAttempts,
          usedAt: isMaxed ? new Date() : null, // Vô hiệu hóa OTP luôn nếu đạt 5 lần sai
        },
      });

      if (isMaxed) {
        return NextResponse.json(
          { success: false, message: "Mã OTP đã bị vô hiệu hóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Mã OTP không chính xác. Bạn còn ${5 - newAttempts} lần thử.`,
        },
        { status: 400 }
      );
    }

    // 5. Nếu mã OTP chính xác:
    // - Đánh dấu mã OTP đã được sử dụng
    await prisma.otpCode.update({
      where: { id: latestOtp.id },
      data: { usedAt: new Date() },
    });

    // - Tạo hoặc cập nhật trạng thái xác thực email thành công trong bảng EmailVerification (Hướng B)
    await prisma.emailVerification.upsert({
      where: {
        email_purpose: {
          email,
          purpose,
        },
      },
      update: {
        verifiedAt: new Date(),
      },
      create: {
        email,
        purpose,
        verifiedAt: new Date(),
      },
    });

    // TODO: Production nên lưu trạng thái verification này bằng Redis với TTL ngắn để tăng hiệu năng và tự động dọn dẹp.

    return NextResponse.json(
      { success: true, message: "Mã OTP chính xác. Tiếp tục đăng ký." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/verify-otp failed:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xác thực OTP. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
