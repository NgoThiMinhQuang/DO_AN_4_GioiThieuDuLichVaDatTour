import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export const FALLBACK_BANNER = '/images/banner.jpg';
const DEST_FALLBACKS = ['/images/tours/danang.jpg', '/images/tours/hoian.jpg', '/images/tours/dalat.jpg'];

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

export function formatDateVi(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

export function resolveTourImg(t) {
  if (t?.thumbnail) return t.thumbnail;
  const imgs = t?.tour_images || t?.images || [];
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === 'string') return first;
    if (first?.image_url) return first.image_url;
  }
  return FALLBACK_BANNER;
}

export function resolveDestImg(d, i = 0) {
  if (d?.thumbnail) return d.thumbnail;
  const idx = Math.abs(Number(d?.id ?? i ?? 0)) % DEST_FALLBACKS.length;
  return DEST_FALLBACKS[idx === 0 ? 0 : idx % DEST_FALLBACKS.length] || DEST_FALLBACKS[0];
}

export function fallbackDestImg(id, i = 0) {
  const n = Number(id);
  const base = Number.isFinite(n) && n > 0 ? (n - 1) % DEST_FALLBACKS.length : Math.abs(Number(i) || 0) % DEST_FALLBACKS.length;
  return DEST_FALLBACKS[base];
}

export function resolveArticleImg(a) {
  if (a?.thumbnail) return a.thumbnail;
  return FALLBACK_BANNER;
}

// Giữ tên hàm cũ để tương thích: giờ chỉ trả ảnh thật từ API.
export function tourImg(t) {
  return resolveTourImg(t);
}

export function handleImgError(e) {
  e.currentTarget.onerror = null;
  const fb = e.currentTarget.dataset.fallback || FALLBACK_BANNER;
  if (e.currentTarget.src !== fb && !e.currentTarget.src.endsWith(fb)) {
    e.currentTarget.src = fb;
  }
}

export function durationLabel(t) {
  const d = Number(t?.duration_days);
  const n = t?.duration_nights;
  if (Number.isFinite(d) && d > 0) {
    if (n !== null && n !== undefined && n !== '') return `${d}N${n}Đ`;
    return `${d} ngày`;
  }
  return '';
}

export function tourStatusVi(status) {
  const v = String(status || '').toUpperCase();
  const map = {
    OPEN: 'Đang mở bán',
    ALMOST_FULL: 'Sắp hết chỗ',
    FULL: 'Hết chỗ',
    NOT_OPEN: 'Chưa mở bán',
    PAUSED: 'Tạm ngưng',
    CLOSED: 'Đã đóng',
    DRAFT: 'Bản nháp',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy'
  };
  return map[v] || (status || '—');
}

export function tourStatusClass(status) {
  const v = String(status || '').toUpperCase();
  if (['OPEN'].includes(v)) return 'tour-card-status';
  if (['ALMOST_FULL', 'PAUSED', 'NOT_OPEN'].includes(v)) return 'tour-card-status tour-card-status-warn';
  if (['FULL', 'CLOSED', 'CANCELLED'].includes(v)) return 'tour-card-status tour-card-status-closed';
  return 'tour-card-status';
}

export function bookingStatusVi(s) {
  const v = String(s || '').toUpperCase();
  const map = {
    PENDING: 'Chờ xác nhận',
    DEPOSIT_PENDING: 'Chờ đặt cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang diễn ra',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn'
  };
  return map[v] || s || '—';
}

export function paymentStatusVi(s) {
  const v = String(s || '').toUpperCase();
  const map = {
    UNPAID: 'Chưa thanh toán',
    PENDING: 'Chờ thanh toán',
    DEPOSITED: 'Đã đặt cọc',
    PARTIAL: 'Thanh toán một phần',
    PARTIALLY_PAID: 'Thanh toán một phần',
    PENDING_PAYMENT: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
    REFUNDED_PARTIAL: 'Đã hoàn một phần',
    REFUNDED_FULL: 'Đã hoàn toàn bộ'
  };
  return map[v] || s || '—';
}

export function passengerTypeVi(s) {
  const v = String(s || '').toUpperCase();
  if (v === 'ADULT') return 'Người lớn';
  if (v === 'CHILD') return 'Trẻ em';
  if (v === 'INFANT') return 'Em bé';
  return s || '—';
}

export function notifTypeVi(s) {
  const v = String(s || '').toUpperCase();
  const map = {
    GENERAL: 'Chung',
    BOOKING: 'Đặt tour',
    PAYMENT: 'Thanh toán',
    PROMOTION: 'Khuyến mãi',
    REVIEW: 'Đánh giá',
    SYSTEM: 'Hệ thống'
  };
  return map[v] || s || 'Thông báo';
}

export function paymentMethodVi(s) {
  const v = String(s || '').toUpperCase();
  const map = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    VNPAY: 'VNPay',
    MOMO: 'MoMo',
    EWALLET: 'Ví điện tử',
    ONLINE: 'Trực tuyến'
  };
  return map[v] || s || '—';
}

export function isHotTour(t) {
  if (!t) return false;
  if (t.is_featured === 1 || t.is_featured === true || t.featured === true || t.is_hot === true) return true;
  const rating = Number(t.avg_rating);
  const count = Number(t.review_count);
  if (Number.isFinite(rating) && rating >= 4.5 && Number.isFinite(count) && count >= 3) return true;
  if (Number.isFinite(count) && count >= 20) return true;
  return false;
}

function nextDepartureOf(t) {
  if (!t) return null;
  const direct = t.next_departure_date || t.departure_date || t.earliest_departure || t.first_departure_date;
  if (direct) return direct;
  const list = t.departures || t.upcoming_departures || [];
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0];
    if (typeof first === 'string') return first;
    return first?.departure_date || null;
  }
  return null;
}

function remainingOf(t) {
  if (t == null) return null;
  const cands = [t.remaining, t.remaining_seats, t.available_seats, t.seats_left];
  for (const c of cands) {
    if (c !== null && c !== undefined && c !== '') {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function TourCard({ t, hot }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [fav, setFav] = useState(() => Boolean(t?.is_favorite ?? t?.is_favorited ?? t?.favorited ?? false));
  const [favBusy, setFavBusy] = useState(false);
  const showHot = hot !== undefined ? Boolean(hot) : isHotTour(t);
  const img = resolveTourImg(t);
  const rating = t?.avg_rating ? Number(t.avg_rating).toFixed(1) : '—';
  const reviewCount = t?.review_count ?? t?.reviews_count ?? (Array.isArray(t?.reviews) ? t.reviews.length : 0);
  const old = t?.original_price || (t?.adult_price ? Math.round(Number(t.adult_price) * 1.15) : null);
  const remaining = remainingOf(t);
  const nextDep = nextDepartureOf(t);
  const metaBits = [durationLabel(t), t?.transport, t?.category_name].filter(Boolean);

  async function toggleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favBusy) return;
    if (!token) {
      navigate('/login');
      return;
    }
    setFavBusy(true);
    try {
      if (fav) {
        await api.delete(`/favorites/${t.id}`);
        setFav(false);
      } else {
        await api.post(`/favorites/${t.id}`);
        setFav(true);
      }
    } catch (_) {
      // bỏ qua lỗi, giữ nguyên trạng thái
    } finally {
      setFavBusy(false);
    }
  }

  return (
    <div className="tour-card">
      <div
        className="tour-card-cover"
        style={{ backgroundImage: `url("${img}")` }}
        onClick={() => navigate(`/tours/${t.id}`)}
        role="link"
        aria-label={t.name}
        title={t.name}
      >
        <div className="tour-card-badges">
          <span className={tourStatusClass(t?.status)}>{tourStatusVi(t?.status)}</span>
          {showHot && <span className="tour-card-badge-hot">Bán chạy</span>}
        </div>
        {t?.code && <span className="tour-card-code">{t.code}</span>}
      </div>
      <button
        className={`tour-card-favorite${fav ? ' tour-card-favorite-active' : ''}`}
        onClick={toggleFav}
        title={fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
        aria-label={fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        {fav ? '♥' : '♡'}
      </button>
      <div className="tour-card-body">
        <div className="tour-card-main">
          <div className="tour-card-rating-row">
            <span className="tour-card-rate">★ {rating}</span>
            <span className="tour-card-review-count">({reviewCount} đánh giá)</span>
          </div>
          <h3 className="tour-card-title"><Link to={`/tours/${t.id}`}>{t.name}</Link></h3>
          <div className="tour-card-meta-list">
            {t?.departure_location && <span className="tour-card-meta">Khởi hành từ: {t.departure_location}</span>}
            {metaBits.length > 0 && <span className="tour-card-meta">{metaBits.join(' • ')}</span>}
            {t?.category_name == null && t?.tour_type ? <span className="tour-card-meta">Loại tour: {t.tour_type}</span> : null}
            {(remaining !== null || nextDep) && (
              <span className="tour-card-meta">
                {remaining !== null && <span className="tour-card-seats-available">Còn {remaining} chỗ</span>}
                {remaining !== null && nextDep && <span> • </span>}
                {nextDep && <span className="tour-card-next-departure">Khởi hành: {formatDateVi(nextDep)}</span>}
              </span>
            )}
          </div>
        </div>
        <div className="tour-card-footer">
          <div className="tour-card-price-block">
            <span className="tour-card-price-label">Giá trọn gói</span>
            <span className="tour-card-price-row">
              <span className="tour-card-price-current">{formatVND(t.adult_price)}</span>
              {old && old > Number(t.adult_price) && <span className="tour-card-price-old">{formatVND(old)}</span>}
            </span>
          </div>
          <button className="btn tour-card-button" onClick={() => navigate(`/tours/${t.id}`)}>Xem chi tiết</button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="alert error">{String(error)}</div>;
}

// Chuyển lỗi kỹ thuật (Network Error, 500...) thành câu thân thiện, không lộ chi tiết hệ thống.
// Nhận cả axios error object lẫn chuỗi message đã trích trước đó.
export function friendlyError(error) {
  if (typeof error === 'string') {
    if (/network|fetch|timeout|AxiosError|Failed to fetch/i.test(error)) {
      return 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại.';
    }
    const m = String(error).match(/status code (\d{3})/i);
    if (m) {
      const code = Number(m[1]);
      if (code === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
      if (code === 401 || code === 403) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      if (code >= 500) return 'Máy chủ đang bận. Vui lòng thử lại sau ít phút.';
      return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    }
    return error;
  }
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.message;
  if (!error?.response) return 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng rồi thử lại.';
  if (status === 404) return serverMsg || 'Không tìm thấy dữ liệu yêu cầu.';
  if (status === 401 || status === 403) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status >= 500) return 'Máy chủ đang bận. Vui lòng thử lại sau ít phút.';
  return serverMsg || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
}

export function EmptyState({ icon = '🧳', title, hint, children }) {
  return (
    <div className="tv-empty">
      <div className="tv-empty-icon">{icon}</div>
      <b>{title}</b>
      {hint && <p>{hint}</p>}
      {children}
    </div>
  );
}

export function LoadError({ error, icon = '📭', title = 'Không tải được dữ liệu', hint, onRetry, children }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      hint={hint || friendlyError(error)}
    >
      {onRetry && <button className="btn secondary" type="button" onClick={onRetry}>Thử lại</button>}
      {children}
    </EmptyState>
  );
}
