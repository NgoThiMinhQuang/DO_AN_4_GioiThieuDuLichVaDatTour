# HƯỚNG DẪN CHẠY ĐỒ ÁN (React + Node + MySQL — 3 app theo 3 actor)

Chi tiết nghiệp vụ xem `README.md`. Hệ thống có 3 actor, mỗi actor 1 app riêng:

| Actor | App | Chạy ở | Demo |
|---|---|---|---|
| Khách hàng (CUSTOMER) | `frontend-customer` | http://localhost:5173 | `customer@gmail.com / Customer123!` |
| Nhân viên (STAFF) | `frontend-staff` | http://localhost:5174 | `staff@gmail.com / Staff123!` |
| Quản trị viên (ADMIN) | `frontend-admin` | http://localhost:5175 | `admin@gmail.com / Admin123!` |

Backend chung: http://localhost:5000. Đăng nhập sai app (VD: admin đăng nhập app khách hàng) sẽ bị từ chối.

## Cách 1: Docker (khuyên dùng khi demo)

```bash
docker compose up --build
```

- MySQL: localhost:3306 (root/root, db `tour_booking`)
- Backend: http://localhost:5000 (`/api/health`)
- 3 frontend: 5173 / 5174 / 5175

Import schema + seed lần đầu:

```bash
docker exec -i tour_booking_mysql mysql -uroot -proot tour_booking < CSDL_GioiThieuDuLichVaDatTour.sql
```

## Cách 2: Chạy tay (máy bạn: MySQL root/quang1701)

1. Import `CSDL_GioiThieuDuLichVaDatTour.sql` vào MySQL (tạo db `tour_booking`, 22 bảng + dữ liệu mẫu).
2. Backend (`backend/.env` đã để `DB_PASSWORD=quang1701`):
   ```bash
   cd backend
   npm install
   npm start
   ```
3. Mở 3 terminal riêng cho 3 app:
   ```bash
   cd frontend-customer
   npm install
   npm run dev   # http://localhost:5173
   ```
   ```bash
   cd frontend-staff
   npm install
   npm run dev   # http://localhost:5174
   ```
   ```bash
   cd frontend-admin
   npm install
   npm run dev   # http://localhost:5175
   ```

## Luồng demo khi bảo vệ (theo đúng 3 actor)

1. **Khách hàng** (5173): tìm kiếm/lọc tour -> xem chi tiết + lịch khởi hành -> đặt tour (liên hệ + hành khách + voucher `CHAOMUNG10`) -> thanh toán -> theo dõi booking -> hủy/đánh giá.
2. **Nhân viên** (5174): theo dõi lịch khởi hành -> xác nhận booking -> xác minh thanh toán -> xử lý hoàn tiền.
3. **Admin** (5175): dashboard doanh thu -> quản lý tour/departures/promotions/reviews/users.
