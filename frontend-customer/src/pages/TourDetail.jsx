import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox, formatVND, TourCard, resolveTourImg, handleImgError, tourStatusVi, formatDateVi } from '../components/ui.jsx';

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
  const avgRating = tour.avg_rating ? Number(tour.avg_rating).toFixed(1) : '—';
  const selDepObj = (tour.departures || []).find((d) => String(d.id) === String(selectedDep));
  const itinerary = tour.itinerary || [];

  return (
    <div className="tour-detail-page">
      <div className="tour-detail-container">
        <nav className="tour-detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="crumb-sep">/</span>
          <Link to="/tours">Tour</Link>
          <span className="crumb-sep">/</span>
          <span>{tour.code}</span>
        </nav>

        <div className="tour-detail-hero-card">
          <div className="tour-detail-hero-media">
            <img src={activeImg || resolveTourImg(tour)} alt={tour.name} data-fallback="/images/banner.jpg" onError={handleImgError} />
            <span className="tour-detail-status-tag">{tourStatusVi(tour.status)}</span>
          </div>
          {uniqueThumbs.length > 1 && (
            <div className="tour-detail-gallery-strip">
              {uniqueThumbs.map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`tour-detail-gallery-thumb${activeImg === u ? ' is-active' : ''}`}
                  onClick={() => setActiveImg(u)}
                  title="Xem ảnh"
                >
                  <img src={u} alt={tour.name} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tour-detail-layout" style={{ marginTop: 16 }}>
          <div className="tour-detail-main-column">
            <div className="tour-detail-summary-card">
              <div className="tour-detail-header-top">
                <span className="tour-detail-code">{tour.code}</span>
                <span className="tour-detail-rating-inline">
                  <span className="inline-stars">★</span>
                  <span className="inline-avg">{avgRating}</span>
                  <span className="inline-count">({reviewCount} đánh giá)</span>
                </span>
              </div>
              <h1 className="tour-detail-title">{tour.name}</h1>
              <div className="tour-detail-facts-grid">
                <div className="tour-detail-fact-item">
                  <span className="tour-detail-fact-label">Thời lượng</span>
                  <p className="tour-detail-fact-value">{tour.duration_days} ngày {tour.duration_nights} đêm</p>
                </div>
                <div className="tour-detail-fact-item">
                  <span className="tour-detail-fact-label">Khởi hành từ</span>
                  <p className="tour-detail-fact-value">{tour.departure_location || '—'}</p>
                </div>
                <div className="tour-detail-fact-item">
                  <span className="tour-detail-fact-label">Phương tiện</span>
                  <p className="tour-detail-fact-value">{tour.transport || '—'}</p>
                </div>
                <div className="tour-detail-fact-item">
                  <span className="tour-detail-fact-label">Loại tour</span>
                  <p className="tour-detail-fact-value">{tour.category_name || tour.tour_type || '—'}</p>
                </div>
              </div>
            </div>

            <div className="tour-detail-section-card">
              <h3 className="tour-detail-section-title">Tổng quan tour</h3>
              <p className="tour-detail-overview-text">{tour.description || '—'}</p>
              {(tour.destinations || []).length > 0 && (
                <div className="tour-detail-destination-list">
                  {(tour.destinations || []).map((d) => (
                    <span key={d.id || d.name} className="tour-detail-destination-tag">{d.name}</span>
                  ))}
                </div>
              )}
              <div className="tour-detail-overview-text" style={{ marginTop: 16 }}>
                <div><b>Bao gồm:</b> {tour.included_services || '—'}</div>
                <div><b>Không bao gồm:</b> {tour.excluded_services || '—'}</div>
                <div><b>Chính sách:</b> {tour.policy || '—'}</div>
              </div>
            </div>

            <div className="tour-detail-section-card">
              <h3 className="tour-detail-section-title">Lịch trình chi tiết</h3>
              {itinerary.length > 0 ? (
                itinerary.map((it, idx) => (
                  <div key={it.id || idx} className="tour-detail-day-block">
                    <div className="tour-detail-day-header">
                      <span className="tour-detail-day-badge">{it.day_number ?? idx + 1}</span>
                      <h4 className="tour-detail-day-title">Ngày {it.day_number}: {it.title}</h4>
                    </div>
                    <div className="tour-detail-timeline-body">
                      <div>{it.description}</div>
                      {(it.start_time || it.end_time) && (
                        <div className="tour-detail-timeline-meta">
                          🕑 Thời gian: {it.start_time ? String(it.start_time).slice(0, 5) : '—'} – {it.end_time ? String(it.end_time).slice(0, 5) : '—'}
                        </div>
                      )}
                      {it.meals && <div className="tour-detail-timeline-meta">🍽 Ăn uống: {it.meals}</div>}
                      {it.accommodation && <div className="tour-detail-timeline-meta">🏨 Lưu trú: {it.accommodation}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="muted">Chưa có lịch trình chi tiết.</div>
              )}
            </div>

            <div className="tour-detail-section-card">
              <h3 className="tour-detail-section-title">Lịch khởi hành</h3>
              {(tour.departures || []).length > 0 ? (
                <div className="tour-detail-departure-list">
                  {(tour.departures || []).map((d) => {
                    const left = d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats);
                    const isSel = String(selectedDep) === String(d.id);
                    return (
                      <div
                        key={d.id}
                        className={`tour-detail-departure-card${isSel ? ' is-selected' : ''}`}
                        onClick={() => setSelectedDep(String(d.id))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedDep(String(d.id)); }}
                      >
                        <div>
                          <div className="tour-detail-departure-top-row">
                            <span className="tour-detail-departure-code">{d.departure_code || `Đợt #${d.id}`}</span>
                            <span className="tour-detail-departure-status">{tourStatusVi(d.status)}</span>
                          </div>
                          <div className="tour-detail-departure-grid">
                            <div>
                              <div className="tour-detail-departure-label">Ngày khởi hành</div>
                              <p className="tour-detail-departure-value">
                                {formatDateVi(d.departure_date)}{d.return_date ? ` → ${formatDateVi(d.return_date)}` : ''}
                              </p>
                            </div>
                            <div>
                              <div className="tour-detail-departure-label">Số chỗ còn lại</div>
                              <p className="tour-detail-departure-value">{left} chỗ</p>
                            </div>
                          </div>
                          <div className="tour-detail-departure-grid" style={{ marginTop: 8 }}>
                            <div>
                              <div className="tour-detail-departure-label">Điểm tập trung</div>
                              <p className="tour-detail-departure-value">📍 {d.meeting_point || 'Liên hệ 1900 6868 để biết điểm tập trung'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="tour-detail-departure-right">
                          <span className="tour-detail-departure-price-label">Giá người lớn</span>
                          <p className="tour-detail-departure-price">{formatVND(d.adult_price)}</p>
                          <button type="button" className="tour-detail-departure-pick">{isSel ? 'Đã chọn' : 'Chọn lịch này'}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="muted">Hiện chưa có lịch mở bán.</div>
              )}
            </div>

            <div className="tour-detail-section-card">
              <h3 className="tour-detail-section-title">Đánh giá của khách hàng</h3>
              <div className="tour-detail-reviews-summary">
                <div className="review-summary-stats">
                  <p className="review-summary-avg">{avgRating}</p>
                  <div className="review-summary-info">
                    <span className="review-summary-stars">★★★★★</span>
                    <span className="review-summary-count">Dựa trên {reviewCount} đánh giá</span>
                  </div>
                </div>
              </div>
              <div className="tour-detail-review-list">
                {(tour.reviews || []).map((r) => (
                  <div key={r.id} className="tour-detail-review-item">
                    <p className="review-item-author">{r.full_name}</p>
                    <div className="review-item-meta">
                      <span className="review-item-stars">{'★'.repeat(Number(r.rating) || 5)}</span>
                      <span className="review-item-date">{formatDateVi(r.created_at)}</span>
                    </div>
                    <p className="review-item-content">{r.content}</p>
                  </div>
                ))}
              </div>
              {!(tour.reviews || []).length && <div className="muted">Chưa có đánh giá nào.</div>}
            </div>
          </div>

          <aside className="tour-detail-sidebar">
            <div className="tour-detail-sidebar-card">
              <span className="tour-detail-sidebar-price-label">Giá chỉ từ</span>
              <p className="tour-detail-sidebar-price">{formatVND(tour.adult_price)}</p>
              {old && <span className="tour-detail-sidebar-old">{formatVND(old)}</span>}
              <span className="tour-detail-sidebar-price-note">
                Người lớn / trẻ em / em bé: {formatVND(tour.adult_price)} / {formatVND(tour.child_price)} / {formatVND(tour.infant_price)}
              </span>
              <div className="tour-detail-sidebar-section">
                <p className="tour-detail-sidebar-section-title">Chọn lịch khởi hành</p>
                <select className="tour-detail-sidebar-select" value={selectedDep} onChange={(e) => setSelectedDep(e.target.value)}>
                  <option value="">-- Chọn lịch khởi hành --</option>
                  {(tour.departures || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDateVi(d.departure_date)} — còn {d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)} chỗ
                    </option>
                  ))}
                </select>
                {selDepObj && <div className="alert info" style={{ margin: 0 }}>Đã chọn: {formatDateVi(selDepObj.departure_date)} — {formatVND(selDepObj.adult_price)}/khách{selDepObj.meeting_point ? ` • Tập trung: ${selDepObj.meeting_point}` : ''}</div>}
              </div>
              <div className="tour-detail-sidebar-actions">
                <button
                  className="btn tour-detail-primary-button"
                  disabled={!selectedDep}
                  onClick={() => navigate(`/booking/${selectedDep}?tourId=${tour.id}`)}
                >
                  Đặt tour ngay
                </button>
                {token && <button className="btn secondary tour-detail-secondary-button" onClick={() => toggleFav(true)}>♥ Thêm vào yêu thích</button>}
              </div>
              {favMsg && <div className="alert info" style={{ margin: 0 }}>{favMsg}</div>}
              <span className="tour-detail-sidebar-price-note">📞 Hotline 1900 6868 (24/7) • Giữ chỗ tức thì</span>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="tour-detail-related">
            <div className="section-head left">
              <span className="eyebrow">Gợi ý thêm</span>
              <h2 style={{ fontSize: 20 }}>Tour liên quan</h2>
            </div>
            <div className="grid tours">
              {related.map((t) => <TourCard key={t.id} t={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
