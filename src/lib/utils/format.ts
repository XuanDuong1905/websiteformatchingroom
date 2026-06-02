export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentScore(value: number) {
  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }

  return `${Math.round(value)}%`;
}

export function formatGender(value?: string) {
  if (value === "male") return "Nam";
  if (value === "female") return "Nữ";
  if (value === "any") return "Bất kỳ";
  if (value === "other") return "Khác";
  return "Chưa cập nhật";
}

export function formatLevel(value?: string) {
  if (value === "low") return "Thấp";
  if (value === "medium") return "Trung bình";
  if (value === "high") return "Cao";
  return "Chưa cập nhật";
}

export function formatFrequency(value?: string) {
  if (value === "daily") return "Hằng ngày";
  if (value === "weekly") return "Hằng tuần";
  if (value === "monthly") return "Hằng tháng";
  return "Chưa cập nhật";
}
