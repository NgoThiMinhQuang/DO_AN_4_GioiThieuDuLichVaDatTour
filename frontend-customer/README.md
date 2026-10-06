# VietTour — App Khách hàng

Frontend cho khách hàng: xem tour / điểm đến / bài viết (không cần đăng nhập), đặt tour, quản lý booking, yêu thích, thông báo, hồ sơ cá nhân.

## Cách chạy

```bash
npm install
npm run dev   # port 5173
```

- API backend: `http://localhost:5000` (proxy `/api` đã cấu hình trong `vite.config.js`).
- Có thể đặt `VITE_API_URL` trong file `.env` (xem `.env.example`).

## Tài khoản demo

- Khách hàng: `customer@gmail.com` / `Customer123!`

> Lưu ý: chỉ tài khoản role `CUSTOMER` mới đăng nhập được ở app này. Tài khoản nhân viên/admin hãy dùng app Nhân viên/Admin.
