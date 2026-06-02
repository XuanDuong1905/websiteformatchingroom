# Cấu trúc database MVP

Tài liệu này mô tả 12 bảng MySQL của website tìm trọ và ghép người ở cùng cho sinh viên. Prisma schema chính nằm tại `prisma/schema.prisma`.

## Tổng quan quan hệ

| Bảng | Vai trò |
|---|---|
| `users` | Tài khoản đăng nhập của sinh viên, chủ trọ và quản trị viên. |
| `user_profiles` | Thông tin cá nhân mở rộng của mỗi tài khoản. |
| `lifestyle_profiles` | Thói quen sinh hoạt dùng để ghép roommate. |
| `rooms` | Bài đăng phòng trọ. |
| `room_images` | Danh sách URL hình ảnh của phòng. |
| `amenities` | Danh mục tiện ích dùng chung. |
| `room_amenities` | Bảng nối nhiều-nhiều giữa phòng và tiện ích. |
| `room_rules` | Nội quy riêng của từng phòng. |
| `search_requests` | Nhu cầu tìm phòng của sinh viên. |
| `matching_results` | Kết quả gợi ý phòng hoặc roommate. |
| `reviews` | Đánh giá phòng, roommate hoặc chủ trọ. |
| `risk_reports` | Báo cáo rủi ro để quản trị viên xử lý. |

## Enum dùng trong database

| Enum | Giá trị |
|---|---|
| `UserRole` | `student`, `owner`, `admin` |
| `Gender` | `male`, `female`, `other`, `unknown` |
| `VerificationStatus` | `unverified`, `pending`, `verified`, `rejected` |
| `PrivacyLevel` | `low`, `medium`, `high`, `unknown` |
| `CleaningFrequency` | `daily`, `weekly`, `monthly`, `rarely`, `unknown` |
| `NoiseLevel` | `low`, `medium`, `high`, `unknown` |
| `GuestFrequency` | `never`, `rarely`, `sometimes`, `often`, `unknown` |
| `RoomStatus` | `draft`, `pending`, `active`, `rented`, `hidden`, `warning`, `deleted` |
| `SearchRequestStatus` | `active`, `paused`, `closed` |
| `MatchStatus` | `suggested`, `viewed`, `accepted`, `rejected`, `expired` |
| `ReviewType` | `room`, `roommate`, `owner` |
| `RiskType` | `fake_post`, `wrong_information`, `hidden_cost`, `unclear_contract`, `deposit_scam`, `bad_roommate_behavior`, `unsafe_location`, `other` |
| `RiskSeverity` | `low`, `medium`, `high` |
| `ReportStatus` | `pending`, `reviewing`, `resolved`, `rejected` |

## 1. Bảng `users`

Lưu tài khoản đăng nhập và thông tin nhận diện cơ bản. Mật khẩu chỉ được lưu sau khi hash bằng bcrypt.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã định danh tài khoản. |
| `fullName` | `VarChar(100)` | Họ tên hiển thị. |
| `email` | `VarChar(150)`, unique | Email đăng nhập, không được trùng. |
| `passwordHash` | `VarChar(255)` | Mật khẩu đã hash, không lưu mật khẩu plaintext. |
| `phone` | `VarChar(20)`, nullable | Số điện thoại liên hệ. |
| `avatarUrl` | `VarChar(500)`, nullable | URL ảnh đại diện. |
| `gender` | `Gender` | Giới tính phục vụ hồ sơ và ghép roommate. |
| `role` | `UserRole` | Phân quyền `student`, `owner` hoặc `admin`. |
| `reputationScore` | `Decimal(5,2)` | Điểm uy tín của tài khoản. |
| `isActive` | `Boolean` | Cho biết tài khoản còn hoạt động hay đã bị khóa. |
| `createdAt` | `DateTime` | Thời điểm tạo tài khoản. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Quan hệ chính: một user có tối đa một `user_profiles`, tối đa một `lifestyle_profiles`, nhiều phòng, yêu cầu tìm kiếm, đánh giá và báo cáo.

## 2. Bảng `user_profiles`

Lưu hồ sơ cá nhân mở rộng. Mỗi user có tối đa một profile.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã hồ sơ. |
| `userId` | `Int`, unique, khóa ngoại | Liên kết đến `users.id`. |
| `schoolName` | `VarChar(150)`, nullable | Trường học hoặc đơn vị đào tạo. |
| `major` | `VarChar(150)`, nullable | Ngành học. |
| `birthYear` | `Int`, nullable | Năm sinh. |
| `currentAddress` | `VarChar(255)`, nullable | Khu vực đang sinh sống. |
| `preferredDistrict` | `VarChar(100)`, nullable | Quận hoặc khu vực ưu tiên tìm trọ. |
| `bio` | `Text`, nullable | Giới thiệu ngắn của người dùng. |
| `privacyLevel` | `PrivacyLevel` | Mức độ riêng tư mong muốn. |
| `createdAt` | `DateTime` | Thời điểm tạo hồ sơ. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Khi user bị xóa, profile bị xóa theo nhờ `onDelete: Cascade`.

## 3. Bảng `lifestyle_profiles`

Lưu thói quen sinh hoạt để tính độ phù hợp khi ghép roommate.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã hồ sơ lối sống. |
| `userId` | `Int`, unique, khóa ngoại | Liên kết đến `users.id`. |
| `budgetMin` | `Int`, nullable | Ngân sách thuê tối thiểu theo tháng. |
| `budgetMax` | `Int`, nullable | Ngân sách thuê tối đa theo tháng. |
| `sleepTime` | `Time`, nullable | Giờ thường đi ngủ. |
| `wakeTime` | `Time`, nullable | Giờ thường thức dậy. |
| `cleaningFrequency` | `CleaningFrequency` | Tần suất dọn dẹp. |
| `noiseTolerance` | `NoiseLevel` | Mức độ chấp nhận tiếng ồn. |
| `privacyPreference` | `PrivacyLevel` | Mức riêng tư mong muốn. |
| `smoking` | `Boolean` | Người dùng có hút thuốc hay không. |
| `petFriendly` | `Boolean` | Có chấp nhận thú cưng hay không. |
| `guestFrequency` | `GuestFrequency` | Tần suất có khách đến chơi. |
| `cookingFrequency` | `GuestFrequency` | Tần suất nấu ăn. |
| `createdAt` | `DateTime` | Thời điểm tạo hồ sơ. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Khi user bị xóa, lifestyle profile bị xóa theo nhờ `onDelete: Cascade`.

## 4. Bảng `rooms`

Lưu bài đăng phòng trọ của chủ trọ.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã phòng. |
| `ownerId` | `Int`, khóa ngoại | Liên kết đến chủ trọ trong `users.id`. |
| `title` | `VarChar(200)` | Tiêu đề bài đăng. |
| `description` | `Text`, nullable | Mô tả chi tiết phòng. |
| `address` | `VarChar(255)` | Địa chỉ phòng. |
| `district` | `VarChar(100)` | Quận, thành phố hoặc khu vực dùng để lọc. |
| `ward` | `VarChar(100)`, nullable | Phường hoặc xã. |
| `latitude` | `Decimal(10,8)`, nullable | Vĩ độ để tính khoảng cách hoặc hiển thị bản đồ. |
| `longitude` | `Decimal(11,8)`, nullable | Kinh độ để tính khoảng cách hoặc hiển thị bản đồ. |
| `price` | `Int` | Giá thuê mỗi tháng. |
| `deposit` | `Int` | Tiền cọc. |
| `area` | `Decimal(6,2)`, nullable | Diện tích phòng theo mét vuông. |
| `electricityFee` | `Int` | Phí điện. |
| `waterFee` | `Int` | Phí nước. |
| `wifiFee` | `Int` | Phí wifi. |
| `parkingFee` | `Int` | Phí gửi xe. |
| `otherFee` | `Int` | Phụ phí khác. |
| `maxPeople` | `Int` | Số người tối đa được ở. |
| `currentPeople` | `Int` | Số người hiện đang ở. |
| `availableSlots` | `Int` | Số chỗ còn trống. |
| `hasContract` | `Boolean` | Có hợp đồng thuê rõ ràng hay không. |
| `minStayMonths` | `Int` | Số tháng thuê tối thiểu. |
| `availableFrom` | `Date`, nullable | Ngày phòng bắt đầu có thể thuê. |
| `verificationStatus` | `VerificationStatus` | Trạng thái xác minh bài đăng. |
| `riskScore` | `Int` | Điểm rủi ro của phòng. |
| `status` | `RoomStatus` | Trạng thái vận hành của phòng. |
| `createdAt` | `DateTime` | Thời điểm tạo bài đăng. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Quan hệ chính: một phòng thuộc một owner, có nhiều ảnh, nhiều tiện ích, tối đa một nội quy, nhiều kết quả matching, review và báo cáo.

## 5. Bảng `room_images`

Lưu URL hình ảnh Cloudinary của phòng. Database không lưu file ảnh hoặc base64.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã ảnh. |
| `roomId` | `Int`, khóa ngoại | Liên kết đến `rooms.id`. |
| `imageUrl` | `VarChar(500)` | URL ảnh hiển thị. |
| `cloudinaryPublicId` | `VarChar(255)`, nullable | Public ID để quản lý ảnh trên Cloudinary. |
| `isCover` | `Boolean` | Đánh dấu ảnh đại diện của phòng. |
| `sortOrder` | `Int` | Thứ tự hiển thị ảnh. |
| `createdAt` | `DateTime` | Thời điểm thêm ảnh. |

Khi phòng bị xóa, ảnh bị xóa theo nhờ `onDelete: Cascade`.

## 6. Bảng `amenities`

Lưu danh mục tiện ích dùng lại cho nhiều phòng.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã tiện ích. |
| `name` | `VarChar(100)`, unique | Tên tiện ích, ví dụ Wifi hoặc Máy lạnh. |
| `icon` | `VarChar(100)`, nullable | Tên icon để giao diện hiển thị. |
| `createdAt` | `DateTime` | Thời điểm tạo tiện ích. |

## 7. Bảng `room_amenities`

Bảng nối nhiều-nhiều giữa phòng và tiện ích.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `roomId` | `Int`, khóa chính ghép, khóa ngoại | Liên kết đến `rooms.id`. |
| `amenityId` | `Int`, khóa chính ghép, khóa ngoại | Liên kết đến `amenities.id`. |

Cặp `roomId` và `amenityId` là duy nhất, nên một phòng không bị gán trùng tiện ích. Khi phòng hoặc tiện ích bị xóa, liên kết bị xóa theo.

## 8. Bảng `room_rules`

Lưu nội quy của phòng. Mỗi phòng có tối đa một bộ nội quy.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã nội quy. |
| `roomId` | `Int`, unique, khóa ngoại | Liên kết đến `rooms.id`. |
| `allowSmoking` | `Boolean` | Có cho phép hút thuốc hay không. |
| `allowPet` | `Boolean` | Có cho phép nuôi thú cưng hay không. |
| `allowGuest` | `Boolean` | Có cho phép dẫn khách hay không. |
| `curfewTime` | `Time`, nullable | Giờ giới nghiêm; `null` nghĩa là giờ giấc tự do. |
| `cookingAllowed` | `Boolean` | Có cho phép nấu ăn hay không. |
| `parkingAllowed` | `Boolean` | Có chỗ gửi xe hay không. |
| `note` | `Text`, nullable | Ghi chú thêm về nội quy. |

Khi phòng bị xóa, nội quy bị xóa theo nhờ `onDelete: Cascade`.

## 9. Bảng `search_requests`

Lưu tiêu chí tìm phòng của sinh viên.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã yêu cầu tìm kiếm. |
| `userId` | `Int`, khóa ngoại | Người tạo yêu cầu trong `users.id`. |
| `targetDistrict` | `VarChar(100)`, nullable | Khu vực mong muốn. |
| `budgetMin` | `Int`, nullable | Ngân sách tối thiểu. |
| `budgetMax` | `Int`, nullable | Ngân sách tối đa. |
| `maxDistanceKm` | `Decimal(5,2)`, nullable | Khoảng cách tối đa đến trường hoặc nơi làm việc. |
| `schoolOrWorkplace` | `VarChar(255)`, nullable | Trường học hoặc nơi làm việc làm mốc tìm kiếm. |
| `needContract` | `Boolean` | Có bắt buộc hợp đồng hay không. |
| `needParking` | `Boolean` | Có cần chỗ gửi xe hay không. |
| `needPrivateWc` | `Boolean` | Có cần WC riêng hay không. |
| `preferredMoveInDate` | `Date`, nullable | Ngày dự kiến chuyển vào. |
| `status` | `SearchRequestStatus` | Trạng thái của yêu cầu. |
| `createdAt` | `DateTime` | Thời điểm tạo yêu cầu. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Khi user bị xóa, yêu cầu tìm kiếm bị xóa theo nhờ `onDelete: Cascade`.

## 10. Bảng `matching_results`

Lưu kết quả gợi ý phòng hoặc ghép roommate. Một kết quả có thể liên kết đến phòng, roommate hoặc cả hai.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã kết quả matching. |
| `requestId` | `Int`, nullable, khóa ngoại | Yêu cầu tìm kiếm nguồn. |
| `userId` | `Int`, khóa ngoại | User nhận kết quả gợi ý. |
| `matchedUserId` | `Int`, nullable, khóa ngoại | Roommate được gợi ý. |
| `roomId` | `Int`, nullable, khóa ngoại | Phòng được gợi ý. |
| `budgetScore` | `Decimal(5,2)` | Điểm phù hợp ngân sách. |
| `locationScore` | `Decimal(5,2)` | Điểm phù hợp vị trí. |
| `lifestyleScore` | `Decimal(5,2)` | Điểm phù hợp lối sống. |
| `amenityScore` | `Decimal(5,2)` | Điểm phù hợp tiện ích. |
| `trustScore` | `Decimal(5,2)` | Điểm tin cậy. |
| `compatibilityScore` | `Decimal(5,2)` | Điểm phù hợp tổng hợp trước khi trừ rủi ro. |
| `riskScore` | `Int` | Điểm rủi ro áp dụng cho kết quả. |
| `finalScore` | `Decimal(5,2)` | Điểm cuối cùng để sắp xếp đề xuất. |
| `reason` | `Text`, nullable | Giải thích đề xuất bằng ngôn ngữ dễ hiểu. |
| `status` | `MatchStatus` | Trạng thái xử lý gợi ý. |
| `createdAt` | `DateTime` | Thời điểm tạo kết quả. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Nếu phòng, roommate hoặc yêu cầu tìm kiếm bị xóa, các khóa ngoại nullable được đặt thành `null`. Nếu user nhận gợi ý bị xóa, kết quả bị xóa theo.

## 11. Bảng `reviews`

Lưu đánh giá phòng, roommate hoặc chủ trọ.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã đánh giá. |
| `reviewerId` | `Int`, khóa ngoại | Người viết đánh giá. |
| `reviewedUserId` | `Int`, nullable, khóa ngoại | User được đánh giá nếu review roommate hoặc owner. |
| `roomId` | `Int`, nullable, khóa ngoại | Phòng được đánh giá nếu review phòng. |
| `rating` | `Int` | Điểm đánh giá, dữ liệu mẫu sử dụng thang 1 đến 5. |
| `comment` | `Text`, nullable | Nội dung đánh giá. |
| `reviewType` | `ReviewType` | Loại đánh giá: phòng, roommate hoặc owner. |
| `isVisible` | `Boolean` | Cho biết review có được hiển thị công khai hay không. |
| `createdAt` | `DateTime` | Thời điểm tạo đánh giá. |

Khi reviewer bị xóa, review bị xóa theo. Nếu đối tượng được review bị xóa, khóa liên kết nullable được đặt thành `null`.

## 12. Bảng `risk_reports`

Lưu báo cáo rủi ro để admin kiểm tra và xử lý.

| Cột | Kiểu dữ liệu | Chức năng |
|---|---|---|
| `id` | `Int`, khóa chính, tự tăng | Mã báo cáo. |
| `reporterId` | `Int`, khóa ngoại | User gửi báo cáo. |
| `roomId` | `Int`, nullable, khóa ngoại | Phòng bị báo cáo nếu có. |
| `reportedUserId` | `Int`, nullable, khóa ngoại | User bị báo cáo nếu có. |
| `riskType` | `RiskType` | Nhóm rủi ro. |
| `description` | `Text` | Nội dung mô tả sự việc. |
| `evidenceUrl` | `VarChar(500)`, nullable | URL ảnh hoặc bằng chứng. |
| `severity` | `RiskSeverity` | Mức nghiêm trọng. |
| `status` | `ReportStatus` | Trạng thái xử lý. |
| `handledBy` | `Int`, nullable, khóa ngoại | Admin phụ trách xử lý. |
| `createdAt` | `DateTime` | Thời điểm gửi báo cáo. |
| `updatedAt` | `DateTime` | Thời điểm cập nhật gần nhất. |

Khi reporter bị xóa, báo cáo bị xóa theo. Nếu phòng, user bị báo cáo hoặc admin xử lý bị xóa, khóa liên kết nullable được đặt thành `null`.

## Chỉ mục quan trọng

Các index hỗ trợ lọc và sắp xếp nhanh:

- `rooms`: `ownerId`, `district`, `price`, `status`, `riskScore`.
- `room_images`: `roomId`.
- `search_requests`: `userId`, `targetDistrict`, `status`.
- `matching_results`: `requestId`, `userId`, `matchedUserId`, `roomId`, `finalScore`.
- `reviews`: `reviewerId`, `reviewedUserId`, `roomId`.
- `risk_reports`: `reporterId`, `reportedUserId`, `handledBy`, `roomId`, `status`.
