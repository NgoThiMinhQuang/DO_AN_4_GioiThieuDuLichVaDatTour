import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import {
  ErrorBox,
  formatDateVi,
  formatVND,
  handleImgError,
  resolveTourImg,
  tourStatusVi,
} from '../components/ui.jsx';

export default function LichKhoiHanh() {
  const [rows, setRows] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fTour, setFTour] = useState('');
  const [fDate, setFDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/tours', { params: { sort: 'newest', limit: 30 } });
        const tourRows = res.data.data || [];
        if (!alive) return;
        setTours(tourRows);
        const details = await Promise.all(
          tourRows.map((tour) =>
            api.get(`/tours/${tour.id}`).then((r) => r.data).catch(() => null)
          )
        );
        if (!alive) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const all = [];
        details.forEach((detail, i) => {
          if (!detail) return;
          const img = resolveTourImg({ ...tourRows[i], ...detail });
          (detail.departures || []).forEach((dep) => {
            const st = String(dep.status || '').toUpperCase();
            if (!['OPEN', 'ALMOST_FULL'].includes(st)) return;
            const dd = new Date(dep.departure_date);
            if (Number.isNaN(dd.getTime()) || dd < today) return;
            const remaining =
              dep.remaining ?? (dep.capacity - (dep.confirmed_seats || 0) - (dep.held_seats || 0));
            all.push({
              id: dep.id,
              tourId: detail.id,
              tourName: detail.name,
              tourCode: detail.code,
              tourImg: img,
              depCode: dep.departure_code || `Đợt #${dep.id}`,
              status: dep.status,
              date: dep.departure_date,
              returnDate: dep.return_date,
              meetingPoint: dep.meeting_point,
              remaining: Number.isFinite(Number(remaining)) ? Number(remaining) : null,
              price: dep.adult_price ?? detail.adult_price,
            });
          });
        });
        all.sort((a, b) => new Date(a.date) - new Date(b.date));
        setRows(all);
      } catch (e) {
        if (alive) setError(e.response?.data?.message || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (fTour && String(r.tourId) !== String(fTour)) return false;
      if (fDate && new Date(r.date) < new Date(`${fDate}T00:00:00`)) return false;
      return true;
    });
  }, [rows, fTour, fDate]);

  function clearFilter() {
    setFTour('');
    setFDate('');
  }

  return (
    <div className="container">
      <div className="tv-tours-hero">
        <div className="tv-tours-hero-inner">
          <span className="eyebrow" style={{ color: '#bfdbfe' }}>Giữ chỗ sớm</span>
          <h2>Lịch khởi hành ({visible.length})</h2>
          <p>Tất cả đợt khởi hành sắp tới còn giữ chỗ — chọn ngày phù hợp và đặt tour ngay.</p>
        </div>
      </div>

      <div className="tv-dest-filter" style={{ marginTop: 18 }}>
        <select value={fTour} onChange={(e) => setFTour(e.target.value)} aria-label="Lọc theo tour" style={{ flex: 2, minWidth: 200 }}>
          <option value="">Tất cả tour</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>{t.code ? `${t.code} — ` : ''}{t.name}</option>
          ))}
        </select>
        <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} aria-label="Từ ngày" title="Chỉ hiện đợt khởi hành từ ngày này" />
        {(fTour || fDate) && <button className="btn ghost btn-sm" type="button" onClick={clearFilter}>Xóa lọc</button>}
        <span className="tv-filter-count">Tìm thấy {visible.length} đợt khởi hành</span>
      </div>

      <ErrorBox error={error} />
      {loading && <div className="empty-box">Đang tải lịch khởi hành...</div>}

      {!loading && visible.length === 0 && !error && (
        <div className="tv-empty">
          <div className="tv-empty-icon">📅</div>
          <b>Chưa có lịch khởi hành phù hợp</b>
          <p>Thử nới lỏng điều kiện lọc hoặc xem chi tiết từng tour để nhận thông báo mở bán sớm nhất.</p>
          <Link className="btn secondary" to="/tours">Xem tất cả tour</Link>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="tv-dep-grid">
          {visible.map((dep) => (
            <div className="tv-dep-card" key={dep.id}>
              <Link to={`/tours/${dep.tourId}`} className="tour-media" style={{ borderRadius: 12, overflow: 'hidden', display: 'block' }}>
                <img
                  src={dep.tourImg}
                  alt={dep.tourName}
                  loading="lazy"
                  data-fallback="/images/banner.jpg"
                  onError={handleImgError}
                  style={{ aspectRatio: '16 / 9' }}
                />
              </Link>
              <div className="tv-dep-date">
                <b>{formatDateVi(dep.date)}{dep.returnDate ? ` → ${formatDateVi(dep.returnDate)}` : ''}</b>
                {dep.remaining != null && <span>Còn {dep.remaining} chỗ</span>}
              </div>
              <div className="tv-dep-body">
                <Link className="tv-dep-name" to={`/tours/${dep.tourId}`}>{dep.tourName}</Link>
                <div className="tv-dep-meta" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  <span>Mã đợt: <b>{dep.depCode}</b> • {tourStatusVi(dep.status)}</span>
                  <span>📍 Điểm tập trung: {dep.meetingPoint || 'Xem chi tiết tour'}</span>
                  {dep.tourCode && <span>Mã tour: {dep.tourCode}</span>}
                </div>
                <div className="tv-dep-meta" style={{ marginTop: 6 }}>
                  {dep.price != null && <span className="price">{formatVND(dep.price)}</span>}
                  <span className="muted"> / người lớn</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/booking/${dep.id}?tourId=${dep.tourId}`)}
                  disabled={dep.remaining === 0}
                >
                  Đặt tour
                </button>
                <Link className="btn secondary btn-sm" to={`/tours/${dep.tourId}`}>Chi tiết tour</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
