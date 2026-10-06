import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, TourCard } from '../components/ui.jsx';

export default function Favorites() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  async function load() {
    try {
      const res = await api.get('/favorites');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);
  async function remove(id) {
    try {
      await api.delete(`/favorites/${id}`);
      setMsg('Đã xóa khỏi yêu thích');
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }
  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Đã lưu</span>
        <h2>Tour yêu thích ({rows.length})</h2>
        <p>Những hành trình bạn đã tim — đặt ngay khi sẵn sàng.</p>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      {rows.length === 0 && !error && (
        <div className="tv-empty">
          <div className="tv-empty-icon">♡</div>
          <b>Chưa có tour yêu thích nào</b>
          <p>Nhấn biểu tượng tim ở mỗi tour để lưu lại hành trình bạn thích.</p>
          <Link className="btn" to="/tours">Khám phá tour ngay</Link>
        </div>
      )}
      <div className="grid tours">
        {rows.map((t) => (
          <div key={t.tour_id || t.id} className="tv-fav-wrap">
            <TourCard t={t.tour_id ? { ...t, id: t.tour_id } : t} />
            <button className="btn secondary btn-sm tv-fav-remove" onClick={() => remove(t.tour_id || t.id)}>✕ Xóa khỏi yêu thích</button>
          </div>
        ))}
      </div>
    </div>
  );
}
