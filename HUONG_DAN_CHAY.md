# HƯỚNG DẪN CHẠY ĐỒ ÁN (React + Node + MySQL)

Chi tiết nghiệp vụ xem `README.md`.

## Cách 1: Docker (khuyên dùng khi demo)

```bash
docker compose up --build
```

- MySQL: localhost:3306 (root/root, db `tour_booking`)
- Backend: http://localhost:5000 (`/api/health`)
- Frontend: http://localhost:5173

Import schema + seed lần đầu:

```bash
docker exec -i tour_booking_mysql mysql -uroot -proot tour_booking < backend/sql/schema.sql
docker exec -i tour_booking_mysql mysql -uroot -proot tour_booking < backend/sql/seed.sql
```

## Cách 2: Chạy tay

1. Cài MySQL 8, tạo db `tour_booking`, import:
   - `backend/sql/schema.sql`
   - `backend/sql/seed.sql`
2. Backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Mở http://localhost:5173, API trỏ về `VITE_API_URL` (mặc định http://localhost:5000).

## Tài khoản demo

- Admin: `admin@gmail.com` / `Admin123!`
- Khách: tự Đăng ký ở `/register`.

## Luồng demo khi bảo vệ

1. Home -> Tours: tìm kiếm/lọc/sắp xếp.
2. TourDetail: xem lịch trình, chọn departure còn chỗ, thêm yêu thích.
3. Booking: nhập liên hệ + hành khách + voucher `CHAOMUNG10` -> tạo booking (giữ chỗ 15 phút).
4. MyBookings: thanh toán thêm, hủy, đánh giá (khi hoàn thành).
5. Admin (`/admin`): Dashboard doanh thu, quản lý tours/departures/bookings/payments/promotions/reviews/users.
