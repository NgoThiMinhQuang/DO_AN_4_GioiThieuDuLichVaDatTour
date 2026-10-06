# VietTour - Admin (tour-booking-admin)

App quản trị: dashboard/báo cáo, tours, departures, bookings, payments, refunds, promotions, reviews, users.

## Chạy

```bash
npm install
npm run dev    # http://localhost:5175
```

API backend: `http://localhost:5000` (proxy `/api` trong `vite.config.js`).

## Demo

- Tài khoản: `admin@gmail.com` / `Admin123!`
- Chỉ role `ADMIN` được đăng nhập (trang Login gọi `/me` kiểm tra, role khác bị logout + báo "Đây là trang Quản trị viên").
