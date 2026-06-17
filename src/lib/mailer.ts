import nodemailer from "nodemailer";

export function isSmtpConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );
}

export async function sendOtpEmail(email: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    throw new Error("Chưa cấu hình email SMTP để gửi OTP");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // true for port 465, false for others (like 587)
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to: email,
    subject: "Mã OTP xác minh tài khoản Ghep Tro - Ghep Ban",
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #0e7490; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Xác minh tài khoản - Ghép Trọ Ghép Bạn</h2>
        <p>Chào bạn,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản sinh viên tại <strong>Ghép Trọ - Ghép Bạn</strong>.</p>
        <p>Mã OTP xác minh tài khoản của bạn là:</p>
        <div style="font-size: 28px; font-weight: bold; background-color: #f3f4f6; padding: 15px 20px; border-radius: 8px; display: inline-block; letter-spacing: 4px; color: #0e7490; margin: 15px 0; border: 1px dashed #0e7490;">
          ${otp}
        </div>
        <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Đây là email tự động từ hệ thống Ghép Trọ - Ghép Bạn, vui lòng không phản hồi trực tiếp email này.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
