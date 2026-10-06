import { Link } from 'react-router-dom';

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
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
