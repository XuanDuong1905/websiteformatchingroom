# Bản Cập Nhật API (Version 2) – Tính năng Đánh giá, Báo cáo & Fix Lỗi

> **Tài liệu tham khảo:** Cập nhật bổ sung cho bản `docs/api-documentation-for-frontend(TV2).md` trước đó.

---

## 1. Cập nhật các API Phòng Trọ cũ (Sửa lỗi & Thêm tính năng)

### 1.1. Ngoài lề: sửa bắt buộc dùng `await params` (Sửa lỗi Next.js 15)
Toàn bộ các API sử dụng dynamic route (như `[id]`) đã được cập nhật logic để tránh lỗi bất đồng bộ của Next.js 15.
- **Thay đổi:** Thêm dòng `const resolvedParams = await params;` và gọi `resolvedParams.id`.
- **API bị ảnh hưởng:** `GET /api/rooms/:id`, `PATCH /api/rooms/:id`, `DELETE /api/rooms/:id` và các API Review/Report bên dưới.

### 1.2. Tích hợp tính Điểm Rủi Ro (Risk Score) tự động
Điểm rủi ro (thang 100) giờ đây được tính toán tự động qua hàm Utility `calculateRoomRiskScore()` tái sử dụng được ở thư mục `src/lib`. API đã thay đổi như sau:
- **Tạo phòng (`POST /api/rooms`):** Phòng mới tạo mặc định sẽ bị cộng 20 điểm rủi ro do chưa có ảnh thực tế.
- **Upload ảnh (`POST /api/upload/room-image`):** Khi có ảnh upload thành công, API gọi hàm tính lại điểm và cập nhật thẳng vào database (xóa án phạt thiếu ảnh).
- **Sửa phòng (`PATCH /api/rooms/:id`):** Khi chủ trọ thay đổi giá hoặc tiền cọc, API tự động trộn data cũ và mới để tính lại (ví dụ: nếu cọc bị chỉnh lên quá 2 tháng tiền nhà sẽ bị cộng 20đ rủi ro).

####  Ví dụ minh họa sự thay đổi ở Response (API Tạo phòng):
- **URL:** `POST /api/rooms`
- **Body JSON:** Tạo phòng 2 triệu, cọc 6 triệu (Cọc > 2 tháng tiền nhà  **Phạt 20đ**. Vừa tạo chưa có ảnh  **Phạt 20đ**. Tổng: **40đ**)
  ```json
  {
    "ownerId": 2,
    "title": "Phòng trọ giá rẻ",
    "address": "123 Đường A",
    "district": "Quận 1",
    "price": 2000000,
    "deposit": 6000000 
  }
  ```
- **Response 201 MỚI:** Bạn sẽ thấy trường `riskScore` trả về một con số tự động tính toán, không còn cứng là 0 như bản cũ nữa.
  ```json
  {
    "success": true,
    "message": "Đăng phòng thành công",
    "data": {
      "id": 12,
      "title": "Phòng trọ giá rẻ",
      "riskScore": 40, 
      "status": "pending"
    }
  }
  ```

####  Ví dụ minh họa sự thay đổi ở Response (API Sửa phòng):
- **URL:** `PATCH /api/rooms/12`
- **Body JSON:** Chủ trọ nhận ra sai lầm, quyết định giảm cọc xuống còn 1 triệu. (Hệ thống tính lại: Hết cọc cao  **Trừ 20đ**. Tổng điểm rủi ro của phòng giảm xuống còn **20đ**).
  ```json
  {
    "deposit": 1000000
  }
  ```
- **Response 200 MỚI:**
  ```json
  {
    "success": true,
    "message": "Cập nhật phòng thành công",
    "data": {
      "id": 12,
      "deposit": 1000000,
      "riskScore": 20
    }
  }
  ```

---

## 2. Các API Đánh Giá Phòng (Review) Mới

### 2.1. Lấy danh sách đánh giá của phòng (GET)
- **URL:** `/api/rooms/:id/reviews`
- **Mô tả:** Lấy danh sách đánh giá công khai (`isVisible = true`). API sử dụng Prisma `include` để trả về kèm theo tên và avatar của người đánh giá cho Frontend hiển thị.
- **Response Data Mẫu:**
  ```json
  [
    {
      "id": 1,
      "rating": 5,
      "comment": "Phòng đẹp y hình",
      "createdAt": "2026-06-14T01:30:00Z",
      "reviewer": { 
        "fullName": "Nguyễn Văn A", 
        "avatarUrl": "https://..." 
      }
    }
  ]
  ```

### 2.2. Viết đánh giá mới (POST)
- **URL:** `/api/rooms/:id/reviews`
- **Body JSON Yêu cầu:**
  *(Ghi chú: Tạm thời nhận `reviewerId` từ Body trong lúc chờ TV5 ghép luồng Auth)*
  ```json
  {
    "reviewerId": 1,
    "rating": 5,
    "comment": "Phòng rất giống ảnh, chủ nhà thân thiện"
  }
  ```

### 2.3. Xóa đánh giá (DELETE - Soft Delete)
- **URL:** `/api/rooms/:id/reviews/:reviewId`
- **Body JSON Yêu cầu:** `{ "currentUserId": 1 }`
- **Mô tả:** Chức năng áp dụng Soft Delete (đổi trạng thái `isVisible = false` thay vì xóa vĩnh viễn khỏi Database). 
- **Bảo mật:** Tích hợp kiểm tra chính chủ. Nếu `currentUserId` truyền lên không khớp với `reviewerId` đã lưu trong Database, API sẽ từ chối truy cập (403 Forbidden).

---

## 3. API Báo Cáo Lừa Đảo (RiskReport) Mới

### 3.1. Gửi báo cáo (POST)
- **URL:** `/api/rooms/:id/reports`
- **Mô tả:** Nhận dữ liệu báo cáo từ người dùng và lưu vào database. 
- **Quy trình duyệt:** Báo cáo được lưu với trạng thái mặc định là `pending`. Báo cáo này CHỈ dành cho Admin vào Admin Panel để xem xét. Hệ thống **KHÔNG TỰ ĐỘNG** trừ điểm rủi ro của phòng để tránh tình trạng cố tình spam report chơi xấu nhau.
- **Body JSON Yêu cầu:**
  ```json
  {
    "reporterId": 2,
    "riskType": "deposit_scam",
    "description": "Bắt cọc 3 tháng nhưng không cho lên xem phòng thực tế",
    "severity": "high"
  }
  ```

