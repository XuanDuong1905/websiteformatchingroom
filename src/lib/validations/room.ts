import { z } from "zod";

export const ROOM_IMAGE_LIMITS = {
  min: 5,
  max: 15,
  maxSize: 5 * 1024 * 1024,
} as const;

export const ROOM_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ROOM_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

const trimRequiredString = (message: string) =>
  z.string().trim().min(1, message);

const optionalCoordinateSchema = z
  .union([z.coerce.number(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value === "" || value == null ? null : value))
  .refine((value) => value === null || Number.isFinite(value), {
    message: "Tọa độ không hợp lệ",
  });

const optionalDateSchema = z
  .union([z.string().trim(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value === "" || value == null ? null : value))
  .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Ngày trống phải có định dạng YYYY-MM-DD",
  });

const optionalTimeSchema = z
  .union([z.string().trim(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => (value === "" || value == null ? null : value))
  .refine((value) => value === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), {
    message: "Giờ giới nghiêm phải có định dạng HH:mm",
  });

const imageUrlSchema = z
  .string()
  .trim()
  .url("URL hình ảnh không hợp lệ")
  .max(500, "URL hình ảnh không được quá 500 ký tự");

const statusSchema = z.enum(["ACTIVE", "INACTIVE", "RENTED"], {
  message: "Trạng thái phòng không hợp lệ",
});

const roomRulesSchema = z.object({
  allowSmoking: z.boolean().default(false),
  allowPet: z.boolean().default(false),
  allowGuest: z.boolean().default(false),
  curfewTime: optionalTimeSchema,
  cookingAllowed: z.boolean().default(true),
  parkingAllowed: z.boolean().default(false),
  note: z.string().trim().max(1000, "Ghi chú nội quy không được quá 1000 ký tự").optional(),
});

// Base object schema without refinements – used by roomUpdateSchema.partial().
const roomBaseSchema = z.object({
    title: trimRequiredString("Vui lòng nhập tiêu đề").min(
      10,
      "Tiêu đề phải có ít nhất 10 ký tự",
    ),
    description: trimRequiredString("Vui lòng nhập mô tả").min(
      30,
      "Mô tả phải có ít nhất 30 ký tự",
    ),
    address: trimRequiredString("Vui lòng nhập địa chỉ"),
    ward: trimRequiredString("Vui lòng nhập phường/xã"),
    district: trimRequiredString("Vui lòng nhập quận/huyện"),
    city: trimRequiredString("Vui lòng nhập tỉnh/thành phố").default(
      "TP. Ho Chi Minh",
    ),
    price: z.coerce.number().positive("Giá thuê phải lớn hơn 0"),
    electricPrice: z.coerce
      .number()
      .min(0, "Giá điện không được âm")
      .default(0),
    waterPrice: z.coerce
      .number()
      .min(0, "Giá nước không được âm")
      .default(0),
    serviceFee: z.coerce
      .number()
      .min(0, "Phí dịch vụ không được âm")
      .default(0),
    deposit: z.coerce.number().min(0, "Tiền cọc không được âm").default(0),
    wifiFee: z.coerce.number().min(0, "Phí wifi không được âm").default(0),
    parkingFee: z.coerce.number().min(0, "Phí gửi xe không được âm").default(0),
    area: z.coerce.number().positive("Diện tích phải lớn hơn 0"),
    maxOccupants: z.coerce
      .number()
      .int("Số người tối đa phải là số nguyên")
      .min(1, "Số người tối đa phải ít nhất là 1")
      .default(1),
    currentOccupants: z.coerce
      .number()
      .int("Số người hiện tại phải là số nguyên")
      .min(0, "Số người hiện tại không được âm")
      .default(0),
    latitude: optionalCoordinateSchema,
    longitude: optionalCoordinateSchema,
    hasContract: z.boolean().default(false),
    minStayMonths: z.coerce
      .number()
      .int("Thời hạn thuê tối thiểu phải là số nguyên")
      .min(1, "Thời hạn thuê tối thiểu phải ít nhất là 1 tháng")
      .default(1),
    availableFrom: optionalDateSchema,
    status: statusSchema.default("ACTIVE"),
    rules: roomRulesSchema.optional(),
    images: z
      .array(imageUrlSchema)
      .min(ROOM_IMAGE_LIMITS.min, `Phòng phải có ít nhất ${ROOM_IMAGE_LIMITS.min} ảnh`)
      .max(ROOM_IMAGE_LIMITS.max, `Phòng chỉ được có tối đa ${ROOM_IMAGE_LIMITS.max} ảnh`),
  });

export const roomCreateSchema = roomBaseSchema
  .refine((data) => data.currentOccupants <= data.maxOccupants, {
    message: "Số người hiện tại không được lớn hơn số người tối đa",
    path: ["currentOccupants"],
  });

export const roomUpdateSchema = roomBaseSchema
  .partial()
  .refine(
    (data) =>
      data.currentOccupants === undefined ||
      data.maxOccupants === undefined ||
      data.currentOccupants <= data.maxOccupants,
    {
      message: "Số người hiện tại không được lớn hơn số người tối đa",
      path: ["currentOccupants"],
    },
  );

export const roomListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().optional(),
    city: z.string().trim().optional(),
    district: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minArea: z.coerce.number().min(0).optional(),
    maxArea: z.coerce.number().min(0).optional(),
    landlordId: z.coerce.number().int().min(1).optional(),
    status: statusSchema.optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.maxPrice >= data.minPrice,
    {
      message: "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu",
      path: ["maxPrice"],
    },
  )
  .refine(
    (data) =>
      data.minArea === undefined ||
      data.maxArea === undefined ||
      data.maxArea >= data.minArea,
    {
      message: "Diện tích tối đa phải lớn hơn hoặc bằng diện tích tối thiểu",
      path: ["maxArea"],
    },
  );

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
export type RoomListQueryInput = z.infer<typeof roomListQuerySchema>;
