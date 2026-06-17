import crypto from "crypto";

/**
 * Hash an OTP code with a salt/pepper based on the email and a secret key.
 * This prevents rainbow table attacks and protects the OTPs in the database.
 */
export function hashOtp(otp: string, email: string): string {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || "fallback-otp-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${otp}:${email}`)
    .digest("hex");
}
