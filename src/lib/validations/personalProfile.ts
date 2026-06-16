import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (max: number, message: string) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max, message).optional(),
  );

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("URL ảnh đại diện không hợp lệ").max(500).optional(),
);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải có định dạng YYYY-MM-DD")
    .optional(),
);

export const personalProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự"),
  phone: optionalText(20, "Số điện thoại không được quá 20 ký tự"),
  gender: z.enum(["male", "female", "other", "unknown"]),
  dateOfBirth: optionalDate,
  avatarUrl: optionalUrl,
  school: optionalText(150, "Tên trường không được quá 150 ký tự"),
  occupation: optionalText(150, "Nghề nghiệp không được quá 150 ký tự"),
  address: optionalText(255, "Địa chỉ không được quá 255 ký tự"),
  district: optionalText(100, "Quận/huyện không được quá 100 ký tự"),
  bio: optionalText(1000, "Giới thiệu không được quá 1000 ký tự"),
  identityNumber: optionalText(50, "Số giấy tờ không được quá 50 ký tự"),
  businessName: optionalText(150, "Tên cơ sở không được quá 150 ký tự"),
});

export type PersonalProfileInput = z.infer<typeof personalProfileSchema>;
export type PersonalProfileFormInput = z.input<typeof personalProfileSchema>;
