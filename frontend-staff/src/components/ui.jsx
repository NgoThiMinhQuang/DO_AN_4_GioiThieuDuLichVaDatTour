import { Link } from 'react-router-dom';

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
  AWAITING: 'Đang chờ',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  AVAILABLE: 'Còn chỗ',
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

export function TourCard({ t }) {
  return (
    <div className="card">
      {t.thumbnail ? <img src={t.thumbnail} alt={t.name} loading="lazy" /> : <div style={{ height: 170, background: '#cbd5e1' }} />}
      <div className="card-body">
        <div className="card-title"><Link to={`/tours/${t.id}`}>{t.name}</Link></div>
        <div className="muted">{t.departure_location || ''} {t.duration_days ? `• ${t.duration_days}N${t.duration_nights ?? ''}Đ` : ''}</div>
        <div className="price">{formatVND(t.adult_price)}</div>
        <div className="muted">⭐ {t.avg_rating ? Number(t.avg_rating).toFixed(1) : '—'} ({t.review_count ?? 0} đánh giá)</div>
      </div>
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="alert error">{String(error)}</div>;
}
