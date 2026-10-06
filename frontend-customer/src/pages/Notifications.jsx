import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { ErrorBox, notifTypeVi } from '../components/ui.jsx';

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
  const unread = rows.filter((n) => !n.is_read).length;
  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <span className="eyebrow">Cập nhật</span>
        <h2>Thông báo {unread > 0 && <span className="badge">{unread} chưa đọc</span>}</h2>
      </div>
      <ErrorBox error={error} />
      {rows.length === 0 && !error && <div className="empty-box">Không có thông báo nào.</div>}
      {rows.map((n) => (
        <div className="card" key={n.id} style={{ marginBottom: 12, opacity: n.is_read ? 0.72 : 1, borderLeft: n.is_read ? undefined : '4px solid #2563eb' }}>
          <div className="card-body">
            <div><b>{n.title}</b> <span className="badge">{notifTypeVi(n.type)}</span></div>
            <div>{n.content}</div>
            <div className="muted">{n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : ''}</div>
            {!n.is_read && <div><button className="btn secondary btn-sm" onClick={() => markRead(n.id)}>Đánh dấu đã đọc</button></div>}
          </div>
        </div>
      ))}
    </div>
  );
}
