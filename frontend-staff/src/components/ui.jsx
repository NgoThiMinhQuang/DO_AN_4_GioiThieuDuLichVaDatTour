export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

const STATUS_VI = {
  // Lịch khởi hành
  NOT_OPEN: 'Chưa mở bán',
  OPEN: 'Đang mở',
  ALMOST_FULL: 'Sắp đầy',
  FULL: 'Hết chỗ',
  CLOSED: 'Đã đóng',
  ONGOING: 'Đang diễn ra',
  IN_PROGRESS: 'Đang diễn ra',
  COMPLETED: 'Hoàn thành',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  CANCELED: 'Đã hủy',
  // Đơn đặt tour
  PENDING: 'Chờ xác nhận',
  DEPOSIT_PENDING: 'Chờ đặt cọc',
  CONFIRMED: 'Đã xác nhận',
  EXPIRED: 'Hết hạn',
  // Thanh toán (trạng thái thanh toán của đơn)
  UNPAID: 'Chưa thanh toán',
  DEPOSITED: 'Đã đặt cọc',
  PARTIAL: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
  REFUNDED_PARTIAL: 'Đã hoàn một phần',
  REFUNDED_FULL: 'Đã hoàn toàn',
  // Giao dịch / hoàn tiền
  SUCCESS: 'Thành công',
  PROCESSING: 'Đang xử lý',
  PENDING_REFUND: 'Chờ xử lý',
  AWAITING: 'Đang chờ',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  AVAILABLE: 'Còn chỗ',
  // Loại hành khách
  ADULT: 'Người lớn',
  CHILD: 'Trẻ em',
  INFANT: 'Em bé',
  // Giới tính
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
  // Phương thức thanh toán
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  EWALLET: 'Ví điện tử',
  ONLINE: 'Trực tuyến',
  // Chung
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Ngừng áp dụng',
  VISIBLE: 'Hiển thị',
  HIDDEN: 'Đã ẩn',
  PUBLISHED: 'Đã đăng',
  DRAFT: 'Nháp',
  PAUSED: 'Tạm dừng',
};

export function viStatus(s) {
  if (s === null || s === undefined || s === '') return '—';
  const raw = String(s).trim();
  if (/^-?\d+(\.\d+)?\s*%$/.test(raw)) return raw;
  const up = raw.toUpperCase();
  return STATUS_VI[up] || raw;
}

// Giữ tên cũ để tương thích: vẫn trả về class badge theo mã gốc.
export function statusLabel(s) {
  return viStatus(s);
}

// Map trạng thái -> màu badge TravelViet:
// Chờ xác nhận cam, Đã xác nhận/Hoàn thành/Đã thanh toán xanh lá, Đã hủy đỏ, Đang mở xanh dương.
export function statusBadge(status) {
  const s = String(status || '').toUpperCase();
  if (['PENDING', 'DEPOSIT_PENDING', 'PROCESSING', 'UNPAID', 'AWAITING'].includes(s)) return 'badge b-pending';
  if (['CONFIRMED', 'COMPLETED', 'DONE', 'SUCCESS', 'PAID', 'APPROVED', 'DEPOSITED'].includes(s)) return 'badge b-success';
  if (['CANCELLED', 'CANCELED', 'FAILED', 'EXPIRED', 'REJECTED'].includes(s)) return 'badge b-danger';
  if (['OPEN', 'ONGOING', 'IN_PROGRESS', 'AVAILABLE', 'PARTIAL', 'REFUNDED', 'REFUNDED_PARTIAL', 'REFUNDED_FULL', 'ALMOST_FULL', 'NOT_OPEN'].includes(s)) return 'badge b-info';
  return 'badge b-neutral';
}

export function TourCard() {
  return null;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="alert error">{String(error)}</div>;
}
