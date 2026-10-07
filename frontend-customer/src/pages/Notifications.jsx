import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { EmptyState, LoadError, notifTypeVi } from '../components/ui.jsx';

function notifIcon(type) {
  const v = String(type || '').toUpperCase();
  if (v === 'BOOKING') return '🧾';
  if (v === 'PAYMENT') return '💳';
  if (v === 'PROMOTION') return '🎁';
  if (v === 'REVIEW') return '⭐';
  if (v === 'SYSTEM') return '⚙️';
  return '🔔';
}

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
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
  async function markAll() {
    try {
      await Promise.all(rows.filter((n) => !n.is_read).map((n) => api.patch(`/notifications/${n.id}/read`)));
      load();
    } catch (_) {}
  }
  const unread = rows.filter((n) => !n.is_read).length;
  const visible = rows.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });
  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <span className="eyebrow">Cập nhật</span>
        <h2>Thông báo {unread > 0 && <span className="badge">{unread} chưa đọc</span>}</h2>
        <p>Ưu đãi, trạng thái đặt tour và thanh toán mới nhất.</p>
      </div>
      <div className="tv-dest-filter">
        <button className={`tv-chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
        <button className={`tv-chip${filter === 'unread' ? ' active' : ''}`} onClick={() => setFilter('unread')}>Chưa đọc{unread > 0 && ` (${unread})`}</button>
        <button className={`tv-chip${filter === 'read' ? ' active' : ''}`} onClick={() => setFilter('read')}>Đã đọc</button>
        {unread > 0 && <button className="btn ghost btn-sm" onClick={markAll} type="button">Đánh dấu tất cả đã đọc</button>}
      </div>
      {error && <LoadError error={error} icon="🔔" title="Không tải được thông báo" onRetry={() => load()} />}
      {visible.length === 0 && !error && (
        <EmptyState icon="🔔" title="Không có thông báo nào" hint="Ưu đãi, trạng thái đặt tour và thanh toán mới nhất sẽ hiện ở đây." />
      )}
      {visible.map((n) => (
        <div className={`card tv-notif${n.is_read ? ' read' : ' unread'}`} key={n.id} style={{ marginBottom: 12 }}>
          <div className="card-body" style={{ display: 'flex', gap: 14 }}>
            <span className="tv-notif-icon">{notifIcon(n.type)}</span>
            <div style={{ flex: 1 }}>
              <div><b>{n.title}</b>{!n.is_read && <span className="tv-notif-dot" title="Chưa đọc" />} <span className="badge">{notifTypeVi(n.type)}</span></div>
              <div>{n.content}</div>
              <div className="muted">{n.created_at ? new Date(n.created_at).toLocaleString('vi-VN') : ''}</div>
              {!n.is_read && <div style={{ marginTop: 8 }}><button className="btn secondary btn-sm" onClick={() => markRead(n.id)}>Đánh dấu đã đọc</button></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
