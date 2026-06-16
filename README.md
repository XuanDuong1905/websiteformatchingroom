# Website Tìm Trọ

Dự án website tìm trọ sử dụng **Next.js**, **MySQL**, **Prisma** và **Tailwind CSS**.

## 1. Công nghệ sử dụng

| Công cụ | Phiên bản khuyến nghị / đang dùng |
|---|---|
| Node.js | 24.x |
| npm | 11.x |
| Next.js | 16.x |
| Prisma | 7.x |
| MySQL | 8.x hoặc MySQL đi kèm Laragon |
| Laragon | Bản Full 64-bit |
| Git | Bản mới nhất |

Kiểm tra phiên bản trên máy:

```bash
node -v
npm -v
git --version
npx prisma -v
```

## 2. Công cụ cần cài trước

Mỗi thành viên cần cài:

- Node.js LTS
- Git
- Laragon hoặc XAMPP để chạy MySQL
- Visual Studio Code
- GitHub Desktop hoặc dùng Git bằng terminal

Khuyến nghị dùng **Laragon** vì nhẹ, dễ bật MySQL và phù hợp cho đồ án web.

## 3. Clone project về máy

Mở terminal tại thư mục muốn lưu project, chạy:

```bash
git clone https://github.com/TEN_GITHUB/ghep-tro-project.git
cd ghep-tro-project
```

Thay `TEN_GITHUB` bằng tên GitHub thật của nhóm.

Ví dụ:

```bash
git clone https://github.com/caoduong19052006/ghep-tro-project.git
cd ghep-tro-project
```

## 4. Cài thư viện

Sau khi clone project về, chạy:

```bash
npm install
```

Lệnh này sẽ cài toàn bộ thư viện trong `package.json`.

## 5. Tạo database MySQL

Mở Laragon:

```text
Start All
```

Vào phpMyAdmin hoặc công cụ quản lý database, tạo database:

```sql
CREATE DATABASE ghep_tro_db;
```

Tên database nên thống nhất là:

```text
ghep_tro_db
```

## 6. Tạo file môi trường `.env`

Trong thư mục gốc project, tạo file:

```text
.env
```

Nội dung:

```env
DATABASE_URL="mysql://root:@localhost:3306/ghep_tro_db"
```

Nếu MySQL trên máy có mật khẩu, sửa lại:

```env
DATABASE_URL="mysql://root:MAT_KHAU@localhost:3306/ghep_tro_db"
```

Ví dụ mật khẩu là `root`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/ghep_tro_db"
```

Lưu ý: file `.env` không được push lên GitHub.

## 7. Chạy Prisma

Sau khi tạo database và file `.env`, chạy:

```bash
npx prisma generate
npx prisma migrate dev
```

## 20. Tài liệu database

- [Cấu trúc 12 bảng và chức năng từng cột](docs/database-schema/README.md)
- [Database mẫu, tài khoản demo và cách chạy seed](docs/sample-data/README.md)

Nếu muốn mở giao diện xem database bằng Prisma:

```bash
npx prisma studio
```

## 8. Chạy project

Chạy server development:

```bash
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

Test API users:

```text
http://localhost:3000/api/users
```

Nếu hiện:

```json
[]
```

nghĩa là Next.js đã kết nối được với MySQL thông qua Prisma.

## 9. Cấu trúc thư mục chính

```text
ghep-tro-project/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── users/
│   │   │       └── route.js
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       └── prisma.js
│
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

## 10. Quy tắc làm việc với Git

Không code trực tiếp trên nhánh `main`.

Mỗi thành viên nên tạo một nhánh riêng theo chức năng đang làm.

Ví dụ:

```bash
git checkout main
git pull origin main
git checkout -b feature/login
```

Một số cách đặt tên nhánh:

```text
feature/login
feature/register
feature/room-list
feature/room-detail
feature/profile
feature/review
fix/login-error
fix/prisma-config
```

## 11. Quy trình pull code mới nhất trước khi làm

Trước khi bắt đầu code mỗi ngày, chạy:

```bash
git checkout main
git pull origin main
```

Sau đó chuyển qua nhánh của mình:

```bash
git checkout ten-nhanh-cua-minh
```

Nếu muốn cập nhật code mới từ `main` vào nhánh đang làm:

```bash
git pull origin main
```

Ví dụ:

```bash
git checkout feature/login
git pull origin main
```

Nếu có conflict, sửa conflict trong VS Code, sau đó:

```bash
git add .
git commit -m "Resolve merge conflict"
```

## 12. Quy trình push code lên GitHub

Sau khi code xong một phần nhỏ và đã test chạy ổn:

```bash
git status
git add .
git commit -m "Mo ta ngan gon phan da lam"
git push origin ten-nhanh-cua-minh
```

Ví dụ:

```bash
git status
git add .
git commit -m "Add login page UI"
git push origin feature/login
```

## 13. Tạo Pull Request để merge code

Sau khi push nhánh lên GitHub:

1. Vào repo trên GitHub.
2. Bấm **Compare & pull request**.
3. Chọn merge từ nhánh của mình vào `main`.
4. Viết mô tả ngắn gọn đã làm gì.
5. Gửi cho nhóm review.
6. Chỉ merge khi code chạy ổn và không conflict.

Không tự ý merge nếu chưa test hoặc chưa báo nhóm.

## 14. Quy tắc commit message

Commit message nên ngắn gọn, rõ ý.

Ví dụ tốt:

```text
Add login page UI
Add Prisma user model
Create room list API
Fix database connection
Update README setup guide
```

Không nên commit kiểu:

```text
update
fix
abc
done
code moi
```

## 15. Quy tắc tránh conflict

Để hạn chế đụng code nhau:

- Mỗi người làm một phần riêng.
- Không sửa file của người khác nếu chưa báo.
- Trước khi code luôn `pull` code mới nhất.
- Commit từng phần nhỏ, không gom quá nhiều thay đổi.
- Không push file `.env`.
- Không push thư mục `node_modules`.
- Không sửa lung tung `package-lock.json` nếu không cài thư viện mới.

## 16. Khi cần cài thư viện mới

Nếu một thành viên cần cài thư viện:

```bash
npm install ten-thu-vien
```

Sau đó commit cả:

```text
package.json
package-lock.json
```

Ví dụ:

```bash
npm install bcryptjs
git add package.json package-lock.json
git commit -m "Install bcryptjs"
git push origin feature/login
```

Các thành viên khác sau khi pull code mới cần chạy lại:

```bash
npm install
```

## 17. Các lệnh hay dùng

Chạy project:

```bash
npm run dev
```

Cài thư viện:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy migration:

```bash
npx prisma migrate dev
```

Mở Prisma Studio:

```bash
npx prisma studio
```

Xem trạng thái Git:

```bash
git status
```

Lấy code mới nhất:

```bash
git pull origin main
```

Push code:

```bash
git push origin ten-nhanh-cua-minh
```

## 18. Quy trình làm việc đề xuất cho nhóm

Mỗi lần làm chức năng mới:

```bash
git checkout main
git pull origin main
git checkout -b feature/ten-chuc-nang
```

Sau khi code xong:

```bash
npm run dev
git status
git add .
git commit -m "Add ten chuc nang"
git push origin feature/ten-chuc-nang
```

Sau đó lên GitHub tạo Pull Request để merge vào `main`.

## 19. Lưu ý quan trọng

- Không push `.env`.
- Không push `node_modules`.
- Không code trực tiếp trên `main`.
- Luôn pull code mới trước khi làm.
- Luôn test `npm run dev` trước khi push.
- Nếu sửa Prisma schema, phải chạy lại:

```bash
npx prisma generate
npx prisma migrate dev
```

- Nếu pull code về mà lỗi thư viện, chạy:

```bash
npm install
```

- Nếu pull code về mà lỗi Prisma, chạy:

```bash
npx prisma generate
npx prisma migrate dev
```
