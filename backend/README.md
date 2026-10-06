# Backend — Giới thiệu du lịch & đặt tour

Stack: Node.js + Express + MySQL (`mysql2/promise`) + JWT + bcryptjs.

## 1. Cài MySQL 8

- Cài MySQL 8, tạo user hoặc dùng `root`.
- Import schema + seed:

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p tour_booking < backend/sql/seed.sql
```

## 2. Chạy API

```bash
cd backend
cp .env.example .env   # sửa DB_USER/DB_PASSWORD/JWT_SECRET cho đúng
npm install
npm start              # node src/index.js → http://localhost:5000
```

> `npm start` không crash khi chưa import SQL: app vẫn listen,
> chỉ log lỗi DB và tự tạo tối thiểu bảng `roles`/`users`.

## 3. Kiểm tra

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/tours
```

## 4. Tài khoản demo (từ seed)

| Role  | Email           | Mật khẩu  |
| ----- | --------------- | ---------- |
| ADMIN | admin@gmail.com | Admin123!  |

Đăng ký khách mới: `POST /api/auth/register`
`{ "full_name": "...", "email": "...", "phone": "...", "password": "..." }`

Đăng nhập: `POST /api/auth/login`
`{ "identifier": "email-hoặc-sdt", "password": "..." }` → nhận `token`
(dùng header `Authorization: Bearer <token>`).

## 5. Danh sách API chính

- Auth: `/api/auth/*` (register, login, forgot, me, change-password)
- Tours public: `/api/tours`
- Meta public: `/api/meta/destinations|attractions|articles|tour-categories`
- Booking (CUSTOMER): `/api/bookings`
- Payment: `/api/payments`
- Yêu thích: `/api/favorites` — Thông báo: `/api/notifications`
- Validate KM: `POST /api/promotions/validate`
- Quản trị: `/api/admin/*` (ADMIN; STAFF được GET bookings)
