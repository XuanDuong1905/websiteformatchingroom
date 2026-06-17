import { z } from "zod";

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Họ tên phải có ít nhất 2 ký tự")
  .max(100, "Họ tên không được quá 100 ký tự");

const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(72, "Mật khẩu không được quá 72 ký tự")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Mật khẩu phải chứa ít nhất 1 chữ cái viết thường",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Mật khẩu phải chứa ít nhất 1 chữ số",
  });

const confirmPasswordSchema = z.string().min(1, "Vui lòng nhập lại mật khẩu");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email không hợp lệ")
  .max(150, "Email không được quá 150 ký tự");

const studentEmailSchema = emailSchema.refine(
  (email) => email.includes(".edu"),
  "Vui lòng sử dụng mail sinh viên",
);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ");

const universitySchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập tên trường đại học")
  .max(150, "Tên trường đại học không được quá 150 ký tự");

const businessNameSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập tên cơ sở kinh doanh")
  .max(150, "Tên cơ sở kinh doanh không được quá 150 ký tự");

const businessLicenseImageSchema = z
  .string()
  .trim()
  .url("Ảnh giấy phép kinh doanh phải là URL hợp lệ")
  .max(500, "URL ảnh giấy phép kinh doanh không được quá 500 ký tự")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
    } catch {
      return false;
    }
  }, "Ảnh giấy phép kinh doanh phải là URL Cloudinary");

export const studentRegisterSchema = z
  .object({
    fullName: fullNameSchema,
    email: studentEmailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    university: universitySchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export const landlordRegisterSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    businessName: businessNameSchema,
    businessLicenseImage: businessLicenseImageSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type LandlordRegisterInput = z.infer<typeof landlordRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
