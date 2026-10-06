import { Link } from 'react-router-dom';

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

const STATUS_VI = {
  // Tour
  DRAFT: 'Nháp',
  OPEN: 'Đang mở bán',
  PAUSED: 'Tạm dừng',
  CLOSED: 'Đã đóng',
  // Lịch khởi hành
  ALMOST_FULL: 'Sắp đầy',
  FULL: 'Hết chỗ',
  ONGOING: 'Đang diễn ra',
  DONE: 'Hoàn thành',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  // Đơn đặt tour
  PENDING: 'Chờ duyệt',
  DEPOSIT_PENDING: 'Chờ đặt cọc',
  CONFIRMED: 'Đã xác nhận',
  EXPIRED: 'Hết hạn',
  // Thanh toán / hoàn tiền
  SUCCESS: 'Thành công',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  PROCESSING: 'Đang xử lý',
  // Khuyến mãi
  ACTIVE: 'Đang áp dụng',
  INACTIVE: 'Ngừng áp dụng',
  // Đánh giá
  VISIBLE: 'Hiển thị',
  HIDDEN: 'Đã ẩn',
  PUBLISHED: 'Đã đăng',
  // Người dùng
  LOCKED: 'Đã khóa',
  // Vai trò
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
  // Loại giảm giá
  PERCENT: 'Phần trăm (%)',
  FIXED: 'Số tiền cố định',
};

export function viStatus(s) {
  if (s === null || s === undefined || s === '') return '—';
  const raw = String(s).trim();
  // Tỉ lệ dạng "85%" giữ nguyên, không dịch
  if (/^-?\d+(\.\d+)?\s*%$/.test(raw)) return raw;
  const up = raw.toUpperCase();
  return STATUS_VI[up] || raw;
}

// Map backend status -> badge tone class (keeps old `badge` className)
export function statusTone(s) {
  const v = String(s || '').toUpperCase();
  if (['SUCCESS', 'CONFIRMED', 'COMPLETED', 'DONE', 'ACTIVE', 'VISIBLE', 'PUBLISHED', 'OPEN', 'PAID'].includes(v)) return 'badge b-green';
  if (['PENDING', 'DEPOSIT_PENDING', 'PROCESSING', 'ONGOING', 'ALMOST_FULL', 'PAUSED'].includes(v)) return 'badge b-amber';
  if (['FAILED', 'CANCELLED', 'LOCKED', 'HIDDEN', 'INACTIVE', 'CLOSED', 'EXPIRED'].includes(v)) return 'badge b-red';
  if (['FULL'].includes(v)) return 'badge b-purple';
  if (['DRAFT'].includes(v)) return 'badge b-gray';
  return 'badge b-blue';
}

export function StatusBadge({ value }) {
  return <span className={statusTone(value)}>{viStatus(value)}</span>;
}

export function tourImg(t, w = 640, h = 400) {
  if (t?.thumbnail) return t.thumbnail;
  if (t?.image_url) return t.image_url;
  return '/images/banner.jpg';
}

export function handleImgError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = '/images/banner.jpg';
}

export function durationLabel(t) {
  if (t?.duration_days) return `${t.duration_days} ngày ${t.duration_nights ?? ''} đêm`.replace('  ', ' ').trim();
  return '';
}

export function TourCard({ t }) {
  const seed = t?.code || t?.id || 'tour';
  return (
    <div className="card">
      {t.thumbnail || t.image_url
        ? <img src={t.thumbnail || t.image_url} alt={t.name} loading="lazy" data-seed={seed} onError={handleImgError} />
        : <div style={{ height: 170, background: '#cbd5e1' }} />}
      <div className="card-body">
        <div className="card-title"><Link to={`/tours/${t.id}`}>{t.name}</Link></div>
        <div className="muted">{t.departure_location || ''} {durationLabel(t) ? `• ${durationLabel(t)}` : ''}</div>
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
