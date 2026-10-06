import { Link } from 'react-router-dom';

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

// Map trạng thái -> màu badge TravelViet:
// PENDING cam, CONFIRMED/COMPLETED xanh lá, CANCELLED đỏ, OPEN xanh dương.
export function statusBadge(status) {
  const s = String(status || '').toUpperCase();
  if (['PENDING', 'DEPOSIT_PENDING', 'PROCESSING', 'UNPAID', 'AWAITING'].includes(s)) return 'badge b-pending';
  if (['CONFIRMED', 'COMPLETED', 'SUCCESS', 'PAID', 'APPROVED'].includes(s)) return 'badge b-success';
  if (['CANCELLED', 'CANCELED', 'FAILED', 'EXPIRED', 'REJECTED'].includes(s)) return 'badge b-danger';
  if (['OPEN', 'ONGOING', 'AVAILABLE', 'PARTIAL', 'REFUNDED'].includes(s)) return 'badge b-info';
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
