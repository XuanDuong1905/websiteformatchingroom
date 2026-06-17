import React from "react";

type BadgeType = "severity" | "room" | "report" | "userActive" | "userStatus";

interface StatusBadgeProps {
  type: BadgeType;
  value: string | boolean;
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  let text = String(value);
  let classes = "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center";

  if (type === "severity") {
    switch (value) {
      case "high":
        text = "⚠️ Nghiêm trọng";
        classes += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        break;
      case "medium":
        text = "Trung bình";
        classes += " bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
        break;
      case "low":
      default:
        text = "Thấp";
        classes += " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
        break;
    }
  } else if (type === "room") {
    switch (value) {
      case "ACTIVE":
      case "active":
        text = "Đang hiển thị";
        classes += " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
        break;
      case "WARNING":
      case "warning":
        text = "Có cảnh báo";
        classes += " bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
        break;
      case "HIDDEN":
      case "hidden":
        text = "Đã ẩn/gỡ";
        classes += " bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
        break;
      case "RENTED":
      case "rented":
        text = "Đã thuê";
        classes += " bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        break;
      case "PENDING":
      case "pending":
        text = "Chờ duyệt";
        classes += " bg-yellow-100 text-yellow-850 dark:bg-yellow-900/30 dark:text-yellow-400";
        break;
      case "INACTIVE":
      case "inactive":
        text = "Ngừng hoạt động";
        classes += " bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        break;
      case "DELETED":
      case "deleted":
        text = "Đã xóa";
        classes += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        break;
      default:
        classes += " bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        break;
    }
  } else if (type === "report") {
    switch (value) {
      case "pending":
        text = "Chưa xử lý";
        classes += " bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-450";
        break;
      case "reviewing":
        text = "Đang xem xét";
        classes += " bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        break;
      case "resolved":
        text = "Đã cảnh báo/Đã gỡ";
        classes += " bg-emerald-105 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
        break;
      case "rejected":
        text = "Đã bác bỏ";
        classes += " bg-gray-150 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        break;
      default:
        classes += " bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        break;
    }
  } else if (type === "userActive") {
    if (value === true || value === "true") {
      text = "Bình thường";
      classes += " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    } else {
      text = "🚫 Đang bị chặn";
      classes += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  } else if (type === "userStatus") {
    switch (value) {
      case "APPROVED":
        text = "Đã duyệt";
        classes += " bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
        break;
      case "PENDING":
        text = "Đang chờ duyệt";
        classes += " bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
        break;
      case "REJECTED":
        text = "Từ chối";
        classes += " bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        break;
      default:
        classes += " bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-400";
        break;
    }
  }

  return <span className={classes}>{text}</span>;
}
