import { Link, useNavigate } from 'react-router-dom';

export function formatVND(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('vi-VN') + 'đ';
}

export function tourImg(t, w = 640, h = 400) {
  if (t?.thumbnail) return t.thumbnail;
  const seed = t?.code || t?.id || 'travelviet';
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function handleImgError(e) {
  e.currentTarget.onerror = null;
  const seed = e.currentTarget.dataset.seed || 'travelviet';
  e.currentTarget.src = `https://picsum.photos/seed/${seed}/640/400`;
}

export function durationLabel(t) {
  if (t?.duration_days) return `${t.duration_days}N${t.duration_nights ?? ''}Đ`;
  return '';
}

export function TourCard({ t }) {
  const navigate = useNavigate();
  const seed = t?.code || t?.id || 'travelviet';
  const old = t?.original_price || (t?.adult_price ? Math.round(Number(t.adult_price) * 1.15) : null);
  return (
    <div className="card">
      <div className="tour-media">
        <Link to={`/tours/${t.id}`}>
          <img src={tourImg(t)} alt={t.name} loading="lazy" data-seed={seed} onError={handleImgError} />
        </Link>
        {durationLabel(t) && <span className="tour-badge">{durationLabel(t)}</span>}
        <span className="tour-rating">⭐ {t.avg_rating ? Number(t.avg_rating).toFixed(1) : '—'}</span>
      </div>
      <div className="card-body">
        <div className="tour-loc">{t.departure_location || t.category_name || ''}</div>
        <div className="card-title"><Link to={`/tours/${t.id}`}>{t.name}</Link></div>
        <div className="muted">{t.review_count ?? 0} đánh giá{t.code ? ` • ${t.code}` : ''}</div>
        <div>
          <span className="price">{formatVND(t.adult_price)}</span>
          {old && old > Number(t.adult_price) && <span className="old-price">{formatVND(old)}</span>}
        </div>
        <div className="tour-foot">
          <span className="muted">{t.transport || ''}</span>
          <button className="btn btn-sm" onClick={() => navigate(`/tours/${t.id}`)}>Đặt ngay</button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="alert error">{String(error)}</div>;
}

export { handleImgError };
