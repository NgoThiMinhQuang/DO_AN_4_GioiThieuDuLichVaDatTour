import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND } from '../components/ui.jsx';

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
      setMsg('Đã xóa');
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }
  return (
    <div className="container">
      <h2>Tour yêu thích</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="grid tours">
        {rows.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-body">
              <Link to={`/tours/${t.id}`}>{t.name}</Link>
              <div className="price">{formatVND(t.adult_price)}</div>
              <button className="btn secondary" onClick={() => remove(t.id)}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
