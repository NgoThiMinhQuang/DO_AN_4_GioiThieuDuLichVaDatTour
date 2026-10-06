# Frontend — Giới thiệu du lịch & Đặt tour (Vite + React)

## Cách chạy

```bash
cd frontend
npm install
npm run dev
```

- Dev: http://localhost:5173 (proxy `/api` → `http://localhost:5000`)
- Backend base URL: `http://localhost:5000` (Express, các route `/api/auth`, `/api/tours`, `/api/meta/*`, `/api/bookings`, `/api/payments`, `/api/favorites`, `/api/notifications`, `/api/promotions/validate`, `/api/admin/*`).

## Cấu hình

- Copy `.env.example` thành `.env` nếu cần đổi backend:
  - `VITE_API_URL=http://localhost:5000`
- `vite.config.js` đã proxy `/api -> http://localhost:5000`.
- Axios instance `src/api/client.js` gắn `Bearer token` từ `localStorage`.

## Tài khoản demo

- `admin@gmail.com / Admin123!`

## Luồng nghiệp vụ

Tour → Departure → Booking → Payment: xem tour (`/tours/:id`) chọn departure còn chỗ → `/booking/:departureId` (4 bước: lịch + số khách → liên hệ + hành khách → voucher `POST /api/promotions/validate` → xác nhận `POST /api/bookings`) → `/my-bookings/:id` thanh toán thêm (`POST /api/payments`), hủy (`POST /:id/cancel`), đánh giá (`POST /:id/reviews` khi hoàn thành).
