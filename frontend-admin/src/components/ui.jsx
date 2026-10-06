import { Link } from 'react-router-dom';

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

// Map backend status -> badge tone class (keeps old `badge` className)
export function statusTone(s) {
  const v = String(s || '').toUpperCase();
  if (['SUCCESS', 'CONFIRMED', 'COMPLETED', 'ACTIVE', 'VISIBLE', 'OPEN', 'DONE', 'PAID'].includes(v)) return 'badge b-green';
  if (['PENDING', 'DEPOSIT_PENDING', 'PROCESSING', 'ONGOING', 'ALMOST_FULL', 'PAUSED'].includes(v)) return 'badge b-amber';
  if (['FAILED', 'CANCELLED', 'LOCKED', 'HIDDEN', 'INACTIVE', 'CLOSED', 'EXPIRED'].includes(v)) return 'badge b-red';
  if (['FULL'].includes(v)) return 'badge b-purple';
  if (['DRAFT'].includes(v)) return 'badge b-gray';
  return 'badge b-blue';
}

export function StatusBadge({ value }) {
  return <span className={statusTone(value)}>{value}</span>;
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
