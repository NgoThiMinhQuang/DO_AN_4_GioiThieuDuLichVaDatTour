import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox, formatVND } from '../components/ui.jsx';

export default function TourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [favMsg, setFavMsg] = useState('');
  const [selectedDep, setSelectedDep] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tours/${id}`);
        setTour(res.data);
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

  return (
    <div className="container">
      <h2>{tour.name}</h2>
      <div className="muted">Mã: {tour.code} • Danh mục: {tour.category_name || '—'} • ⭐ {tour.avg_rating ? Number(tour.avg_rating).toFixed(1) : '—'}</div>
      {tour.thumbnail && <img className="detail-img" src={tour.thumbnail} alt={tour.name} style={{ marginTop: 12 }} />}
      <div className="grid cols-2" style={{ marginTop: 12 }}>
        <div className="card"><div className="card-body">
          <div><b>Điểm khởi hành:</b> {tour.departure_location}</div>
          <div><b>Thời lượng:</b> {tour.duration_days} ngày {tour.duration_nights} đêm</div>
          <div><b>Phương tiện:</b> {tour.transport}</div>
          <div><b>Giá NL/TE/EB:</b> <span className="price">{formatVND(tour.adult_price)} / {formatVND(tour.child_price)} / {formatVND(tour.infant_price)}</span></div>
          <div><b>Điểm đến:</b> {(tour.destinations || []).map((d) => d.name).join(', ') || '—'}</div>
          <div><b>Bao gồm:</b> {tour.included_services || '—'}</div>
          <div><b>Không bao gồm:</b> {tour.excluded_services || '—'}</div>
          <div><b>Chính sách:</b> {tour.policy || '—'}</div>
          <div><b>Mô tả:</b> {tour.description || '—'}</div>
        </div></div>
        <div className="card"><div className="card-body">
          <h3 style={{ margin: '0 0 8px' }}>Lịch khởi hành còn chỗ</h3>
          {(tour.departures || []).length === 0 && <div className="muted">Hiện chưa có lịch mở bán.</div>}
          {(tour.departures || []).map((d) => (
            <label key={d.id} style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid #e2e8e6', borderRadius: 8, padding: 8 }}>
              <input type="radio" name="dep" checked={String(selectedDep) === String(d.id)} onChange={() => setSelectedDep(String(d.id))} style={{ width: 'auto' }} />
              <span>{new Date(d.departure_date).toLocaleDateString('vi-VN')} — còn <b>{d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)}</b> chỗ — {formatVND(d.adult_price)} ({d.status})</span>
            </label>
          ))}
          <div className="form-row" style={{ marginTop: 10 }}>
            {token && <button className="btn secondary" onClick={() => toggleFav(true)}>♥ Yêu thích</button>}
            <button
              className="btn"
              disabled={!selectedDep}
              onClick={() => navigate(`/booking/${selectedDep}?tourId=${tour.id}`)}
            >
              Đặt tour
            </button>
          </div>
          {favMsg && <div className="alert info">{favMsg}</div>}
        </div></div>
      </div>

      <div className="itinerary">
        <h3>Lịch trình</h3>
        {(tour.itinerary || []).map((it) => (
          <div key={it.id} style={{ marginBottom: 8 }}>
            <b>Ngày {it.day_number}: {it.title}</b>
            <div className="muted">{it.description}</div>
            {it.meals && <div className="muted">Ăn uống: {it.meals}</div>}
            {it.accommodation && <div className="muted">Lưu trú: {it.accommodation}</div>}
          </div>
        ))}
        {!(tour.itinerary || []).length && <div className="muted">Chưa có lịch trình chi tiết.</div>}
      </div>

      <div className="section">
        <h3>Đánh giá ({(tour.reviews || []).length})</h3>
        {(tour.reviews || []).map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: 8 }}><div className="card-body">
            <b>{r.full_name} — {r.rating}★</b>
            <div>{r.content}</div>
          </div></div>
        ))}
      </div>

      {related.length > 0 && (
        <div className="section">
          <h3>Tour liên quan</h3>
          <div className="grid tours">
            {related.map((t) => (
              <div className="card" key={t.id}><div className="card-body">
                <Link to={`/tours/${t.id}`}>{t.name}</Link>
                <div className="price">{formatVND(t.adult_price)}</div>
              </div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
