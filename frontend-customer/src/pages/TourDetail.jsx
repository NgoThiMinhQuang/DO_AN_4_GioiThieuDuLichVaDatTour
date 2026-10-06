import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox, formatVND, TourCard, resolveTourImg, handleImgError, durationLabel, tourStatusVi, formatDateVi } from '../components/ui.jsx';

export default function TourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [favMsg, setFavMsg] = useState('');
  const [selectedDep, setSelectedDep] = useState('');
  const [activeImg, setActiveImg] = useState('/images/banner.jpg');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tours/${id}`);
        setTour(res.data);
        const cover = resolveTourImg(res.data);
        setActiveImg(cover);
        const dep = (res.data.departures || [])[0];
        if (dep) setSelectedDep(String(dep.id));
        try {
          const r = await api.get(`/tours/${id}/related`);
          setRelated(r.data.data || []);
        } catch (_) {}
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      }
    })();
  }, [id]);

  async function toggleFav(add) {
    setFavMsg('');
    try {
      if (add) await api.post(`/favorites/${id}`);
      else await api.delete(`/favorites/${id}`);
      setFavMsg(add ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
    } catch (e) {
      setFavMsg(e.response?.data?.message || e.message);
    }
  }

  if (error) return <div className="container"><ErrorBox error={error} /></div>;
  if (!tour) return <div className="container"><p>Đang tải...</p></div>;

  const old = tour.adult_price ? Math.round(Number(tour.adult_price) * 1.15) : null;
  const rawGallery = tour.tour_images || tour.images || [];
  const albumUrls = rawGallery
    .map((g) => (typeof g === 'string' ? g : g?.image_url))
    .filter(Boolean);
  const thumbs = [tour.thumbnail, ...albumUrls].filter(Boolean);
  const uniqueThumbs = [...new Set(thumbs)];
  const reviewCount = (tour.reviews || []).length;
  const selDepObj = (tour.departures || []).find((d) => String(d.id) === String(selectedDep));

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">{tour.category_name || 'Tour du lịch'}</span>
        <h2>{tour.name}</h2>
        <div className="muted">Mã: {tour.code} • ⭐ {tour.avg_rating ? Number(tour.avg_rating).toFixed(1) : '—'} ({reviewCount} đánh giá) • <span className="badge">{tourStatusVi(tour.status)}</span></div>
      </div>
      <div className="detail-hero tv-gallery-main">
        <img src={activeImg || resolveTourImg(tour)} alt={tour.name} data-fallback="/images/banner.jpg" onError={handleImgError} />
        {durationLabel(tour) && <span className="tour-badge">{durationLabel(tour)}</span>}
      </div>
      {uniqueThumbs.length > 1 && (
        <div className="album-row">
          {uniqueThumbs.map((u) => (
            <button
              key={u}
              type="button"
              className={`album-thumb${activeImg === u ? ' active' : ''}`}
              onClick={() => setActiveImg(u)}
              title="Xem ảnh"
            >
              <img src={u} alt={tour.name} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError} />
            </button>
          ))}
        </div>
      )}
      <div className="tv-tour-layout">
        <div className="tv-tour-main">
          <div className="card"><div className="card-body">
            <h3 style={{ margin: '0 0 10px' }}>Mô tả tour</h3>
            <div className="tv-meta-list">
              <div><b>Điểm khởi hành:</b> {tour.departure_location || '—'}</div>
              <div><b>Thời lượng:</b> {tour.duration_days} ngày {tour.duration_nights} đêm</div>
              <div><b>Phương tiện:</b> {tour.transport || '—'}</div>
              <div><b>Điểm đến:</b> {(tour.destinations || []).map((d) => d.name).join(', ') || '—'}</div>
              <div><b>Bao gồm:</b> {tour.included_services || '—'}</div>
              <div><b>Không bao gồm:</b> {tour.excluded_services || '—'}</div>
              <div><b>Chính sách:</b> {tour.policy || '—'}</div>
              <div><b>Mô tả:</b> {tour.description || '—'}</div>
            </div>
          </div></div>

          <div className="itinerary" style={{ marginTop: 0 }}>
            <h3>Lịch trình chi tiết</h3>
            {(tour.itinerary || []).length > 0 ? (
              <div className="tv-timeline">
                {(tour.itinerary || []).map((it) => (
                  <div key={it.id} className="tv-timeline-item">
                    <b>Ngày {it.day_number}: {it.title}</b>
                    <div className="muted">{it.description}</div>
                    {it.meals && <div className="muted">🍽 Ăn uống: {it.meals}</div>}
                    {it.accommodation && <div className="muted">🏨 Lưu trú: {it.accommodation}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted">Chưa có lịch trình chi tiết.</div>
            )}
          </div>

          <div className="section" style={{ margin: 0 }}>
            <div className="section-head left">
              <span className="eyebrow">Đánh giá thật</span>
              <h2 style={{ fontSize: 20 }}>Đánh giá ({reviewCount})</h2>
            </div>
            {(tour.reviews || []).map((r) => (
              <div key={r.id} className="review-card" style={{ marginBottom: 12 }}>
                <div className="review-who" style={{ marginTop: 0 }}>
                  <span className="user-avatar">{(r.full_name || 'K').charAt(0)}</span>
                  <div><b>{r.full_name} — {r.rating}★</b></div>
                </div>
                <p style={{ marginBottom: 0 }}>{r.content}</p>
              </div>
            ))}
            {!(tour.reviews || []).length && <div className="muted">Chưa có đánh giá nào.</div>}
          </div>
        </div>

        <div className="card tv-price-card"><div className="card-body">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span className="price" style={{ fontSize: 24 }}>{formatVND(tour.adult_price)}</span>
            {old && <span className="old-price">{formatVND(old)}</span>}
          </div>
          <div className="muted">Giá người lớn / trẻ em / em bé</div>
          <div style={{ fontSize: 14 }}><span className="price">{formatVND(tour.adult_price)} / {formatVND(tour.child_price)} / {formatVND(tour.infant_price)}</span></div>
          <h3 style={{ margin: '14px 0 8px' }}>Chọn lịch khởi hành</h3>
          {(tour.departures || []).length === 0 && <div className="muted">Hiện chưa có lịch mở bán.</div>}
          <div className="tv-dep-list">
            {(tour.departures || []).map((d) => (
              <label
                key={d.id}
                className={`dep-option${String(selectedDep) === String(d.id) ? ' selected' : ''}`}
                style={{ flexDirection: 'row' }}
              >
                <input type="radio" name="dep" checked={String(selectedDep) === String(d.id)} onChange={() => setSelectedDep(String(d.id))} style={{ width: 'auto' }} />
                <span>{formatDateVi(d.departure_date)} — còn <b>{d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)}</b> chỗ — {formatVND(d.adult_price)} ({tourStatusVi(d.status)})</span>
              </label>
            ))}
          </div>
          {selDepObj && <div className="alert info" style={{ marginTop: 10 }}>Đã chọn: {formatDateVi(selDepObj.departure_date)} — {formatVND(selDepObj.adult_price)}/khách</div>}
          <div className="form-row" style={{ marginTop: 10 }}>
            {token && <button className="btn secondary" onClick={() => toggleFav(true)}>♥ Yêu thích</button>}
            <button
              className="btn"
              disabled={!selectedDep}
              onClick={() => navigate(`/booking/${selectedDep}?tourId=${tour.id}`)}
            >
              Đặt tour ngay
            </button>
          </div>
          {favMsg && <div className="alert info">{favMsg}</div>}
          <div className="muted" style={{ marginTop: 8 }}>📞 Hotline 1900 6868 (24/7) • Giữ chỗ tức thì</div>
        </div></div>
      </div>

      {related.length > 0 && (
        <div className="section">
          <div className="section-head left">
            <span className="eyebrow">Gợi ý thêm</span>
            <h2 style={{ fontSize: 20 }}>Tour liên quan</h2>
          </div>
          <div className="grid tours">
            {related.map((t) => <TourCard key={t.id} t={t} />)}
          </div>
        </div>
      )}
      <div style={{ display: 'none' }}><Link to="/">home</Link></div>
    </div>
  );
}
