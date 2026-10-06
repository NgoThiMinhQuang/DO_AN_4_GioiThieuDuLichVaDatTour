# VietTour Staff — App frontend Nhân viên

Kênh nghiệp vụ nhân viên (README gốc mục 2.3): xem/tìm booking, xác nhận booking,
xác nhận/ghi nhận thanh toán, theo dõi lịch khởi hành (chỉ đọc), xử lý hủy + hoàn tiền.

## Chạy

```bash
npm install
npm run dev   # port 5174
```

Copy `.env.example` thành `.env` nếu cần đổi API (mặc định `VITE_API_URL=http://localhost:5000`,
proxy dev `/api -> http://localhost:5000`).

## Demo

- Tài khoản: `staff@gmail.com` / `Staff123!`
- Đăng nhập role khác STAFF sẽ bị đăng xuất và báo `Đây là trang Nhân viên`.

## Chức năng

| Route | Nội dung |
|---|---|
| `/` | Trang chào + link 4 mục việc |
| `/login` | Đăng nhập nhân viên |
| `/departures` | Theo dõi lịch khởi hành — chỉ xem + số chỗ còn lại |
| `/bookings` | Xem/tìm booking, xác nhận (đổi trạng thái) |
| `/payments` | Xác nhận/ghi nhận thanh toán (SUCCESS/FAILED) |
| `/refunds` | Xử lý hủy + hoàn tiền |

Không có quản lý tour/khuyến mãi/users/dashboard.
