# Database mẫu cho môi trường phát triển

File `prisma/seed.ts` tạo dữ liệu mẫu tiếng Việt để cả nhóm phát triển và demo website tìm trọ, ghép người ở cùng. Seed sử dụng Prisma Client và có thể chạy lại nhiều lần.

## Lưu ý trước khi chạy

Seed sẽ xóa dữ liệu cũ trong 12 bảng rồi tạo lại dữ liệu mẫu. Chỉ chạy trên database local hoặc database dành riêng cho development. Không chạy trên database production.

Thứ tự xóa dữ liệu tránh lỗi khóa ngoại:

1. `risk_reports`
2. `reviews`
3. `matching_results`
4. `search_requests`
5. `room_amenities`
6. `room_rules`
7. `room_images`
8. `rooms`
9. `amenities`
10. `lifestyle_profiles`
11. `user_profiles`
12. `users`

## Cách chạy seed

1. Bật MySQL trong Laragon hoặc XAMPP.
2. Tạo database local:

```sql
CREATE DATABASE ghep_tro_db;
```

3. Tạo file `.env` tại thư mục gốc:

```env
DATABASE_URL="mysql://root:@localhost:3306/ghep_tro_db"
```

4. Cài dependency và tạo dữ liệu mẫu:

```bash
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

5. Mở giao diện xem dữ liệu:

```bash
npx prisma studio
```

## Tài khoản đăng nhập demo

Mọi tài khoản mẫu đều dùng mật khẩu `123456`. Seed hash mật khẩu bằng bcrypt trước khi lưu vào `passwordHash`.

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@example.com` | `123456` |
| Owner | `owner1@example.com` | `123456` |
| Student | `student1@example.com` | `123456` |

## Số lượng bản ghi

| Bảng | Số lượng | Nội dung mẫu |
|---|---:|---|
| `users` | 12 | 1 admin, 3 owner, 8 student. |
| `user_profiles` | 12 | Profile cho toàn bộ user. |
| `lifestyle_profiles` | 8 | Hồ sơ lối sống cho 8 student. |
| `rooms` | 10 | Phòng thuộc 3 owner, đa dạng khu vực và trạng thái. |
| `room_images` | 20 | Mỗi phòng có 2 URL ảnh và đúng 1 ảnh cover. |
| `amenities` | 12 | Danh mục tiện ích dùng chung. |
| `room_amenities` | 46 | Mỗi phòng có từ 3 đến 7 tiện ích. |
| `room_rules` | 10 | Mỗi phòng có một bộ nội quy. |
| `search_requests` | 8 | Một yêu cầu tìm phòng cho mỗi student. |
| `matching_results` | 15 | 10 gợi ý phòng và 5 gợi ý roommate. |
| `reviews` | 15 | Review phòng, roommate và owner. |
| `risk_reports` | 8 | Báo cáo rủi ro thuộc đủ 8 loại. |

## User mẫu

| Nhóm | Email |
|---|---|
| Admin | `admin@example.com` |
| Owner | `owner1@example.com`, `owner2@example.com`, `owner3@example.com` |
| Student | `student1@example.com` đến `student8@example.com` |

User mẫu có giới tính, điểm uy tín và trạng thái hoạt động khác nhau để kiểm tra giao diện profile và phân quyền.

## Tiện ích mẫu

Seed tạo 12 tiện ích:

| Tiện ích | Icon |
|---|---|
| Wifi | `wifi` |
| Máy lạnh | `air-conditioner` |
| Gác lửng | `loft` |
| WC riêng | `toilet` |
| Chỗ gửi xe | `parking` |
| Camera | `camera` |
| Bếp | `kitchen` |
| Máy giặt | `washing-machine` |
| Ban công | `balcony` |
| Giờ giấc tự do | `clock` |
| Tủ lạnh | `fridge` |
| Máy nước nóng | `water-heater` |

## Phòng mẫu

| Tiêu đề phòng | Khu vực | Giá mỗi tháng | Trạng thái | Điểm rủi ro |
|---|---|---:|---|---:|
| Phòng trọ gần HCMUS cơ sở Linh Trung | Thủ Đức | 2.500.000 | `active` | 4 |
| Phòng có gác gần Làng Đại học | Dĩ An | 2.200.000 | `active` | 6 |
| Phòng mini Bình Thạnh gần bến xe buýt | Bình Thạnh | 3.800.000 | `active` | 3 |
| Phòng trọ Dĩ An giá sinh viên | Dĩ An | 1.800.000 | `active` | 8 |
| Phòng Quận 10 gần trường đại học | Quận 10 | 5.000.000 | `pending` | 12 |
| Phòng có ban công, giờ giấc tự do | Gò Vấp | 3.200.000 | `active` | 7 |
| Phòng giá rẻ nhưng thiếu hợp đồng rõ ràng | Thủ Đức | 1.900.000 | `warning` | 48 |
| Phòng yên tĩnh đã được thuê | Thủ Đức | 2.800.000 | `rented` | 2 |
| Phòng mới đăng đang chờ duyệt | Bình Thạnh | 3.500.000 | `pending` | 15 |
| Phòng cảnh báo do báo cáo chi phí ẩn | Gò Vấp | 2.300.000 | `warning` | 68 |

Ảnh phòng là URL placeholder Cloudinary hợp lệ. Seed không upload ảnh, không lưu file ảnh và không chứa Cloudinary API secret.

## Hồ sơ lối sống

Tám student có dữ liệu khác nhau để demo ghép roommate:

- Ngân sách từ `1.800.000` đến `5.000.000`.
- Giờ ngủ từ `22:30` đến `01:30`.
- Mức chịu tiếng ồn `low`, `medium`, `high`.
- Tần suất dọn dẹp `daily`, `weekly`, `monthly`, `rarely`.
- Có trường hợp hút thuốc, không hút thuốc, chấp nhận hoặc không chấp nhận thú cưng.

## Matching mẫu

Seed tạo 15 kết quả:

- 10 kết quả gợi ý phòng.
- 5 kết quả gợi ý roommate, có thể gắn hoặc không gắn với một phòng cụ thể.
- Trạng thái gồm `suggested`, `viewed`, `accepted`, `rejected`, `expired`.

Công thức tính điểm:

```text
compatibilityScore =
  0.30 * budgetScore
+ 0.25 * locationScore
+ 0.20 * lifestyleScore
+ 0.15 * amenityScore
+ 0.10 * trustScore

finalScore = compatibilityScore - 0.5 * riskScore
```

Điểm được làm tròn đến hai chữ số thập phân.

## Review và báo cáo rủi ro

Seed bao gồm:

- Review phòng, roommate và owner.
- Review công khai và review bị ẩn.
- Rating từ 1 đến 5.
- Báo cáo rủi ro thuộc đủ 8 loại: bài đăng giả, sai thông tin, chi phí ẩn, hợp đồng không rõ ràng, lừa cọc, hành vi roommate không phù hợp, khu vực không an toàn và loại khác.
- Báo cáo ở các trạng thái `pending`, `reviewing`, `resolved`, `rejected`.
- Một số báo cáo đã được gán cho admin xử lý.

## Kết quả console sau khi seed

Khi seed thành công, terminal sẽ in thống kê số bản ghi của 12 bảng và ba tài khoản demo:

```text
Admin:   admin@example.com    / 123456
Owner:   owner1@example.com   / 123456
Student: student1@example.com / 123456
```
