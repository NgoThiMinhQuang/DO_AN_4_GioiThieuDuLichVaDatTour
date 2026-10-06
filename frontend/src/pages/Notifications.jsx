import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { ErrorBox } from '../components/ui.jsx';

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  async function load() {
    try {
      const res = await api.get('/notifications');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);
  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      load();
    } catch (_) {}
  }
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2>Thông báo</h2>
      <ErrorBox error={error} />
      {rows.map((n) => (
        <div className="card" key={n.id} style={{ marginBottom: 8, opacity: n.is_read ? 0.7 : 1 }}>
          <div className="card-body">
            <b>{n.title}</b> <span className="badge">{n.type}</span>
            <div>{n.content}</div>
            <div className="muted">{n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : ''}</div>
            {!n.is_read && <button className="btn secondary" onClick={() => markRead(n.id)}>Đánh dấu đã đọc</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
