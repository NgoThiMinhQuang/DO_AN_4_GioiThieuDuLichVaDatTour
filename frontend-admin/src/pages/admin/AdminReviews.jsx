import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, viStatus } from '../../components/ui.jsx';

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/reviews');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/admin/reviews/${id}`, { status });
      setMsg(`Đánh giá #${id} đã chuyển thành “${viStatus(status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const filtered = rows.filter((r) => {
    const okQ = !q || `${r.tour_name} ${r.full_name} ${r.content}`.toLowerCase().includes(q.toLowerCase());
    const okS = !status || String(r.status).toUpperCase() === status;
    return okQ && okS;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Đánh giá</h2><p>{rows.length} đánh giá của khách hàng — ẩn / hiện nội dung.</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} hiển thị</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc đánh giá</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo tour / khách hàng / nội dung..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="VISIBLE">Hiển thị</option>
            <option value="HIDDEN">Đã ẩn</option>
            <option value="PUBLISHED">Đã đăng</option>
          </select>
          <select value="" onChange={() => {}} aria-label="Điểm số">
            <option value="">Mọi điểm số</option>
          </select>
          <button className="btn secondary sm" type="button" onClick={() => { setQ(''); setStatus(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Tên tour</th><th>Khách hàng</th><th>Điểm số</th><th>Nội dung</th><th>Trạng thái</th><th>Ẩn / Hiện</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Chưa có đánh giá nào.</div></td></tr>}
          {filtered.map((r) => (
            <tr key={r.id}>
              <td className="muted">#{r.id}</td><td><b>{r.tour_name}</b></td><td>{r.full_name}</td><td style={{ color: '#d97706', fontWeight: 700 }}>★ {r.rating}</td>
              <td>{(r.content || '').slice(0, 80)}</td>
              <td><StatusBadge value={r.status} /></td>
              <td>
                <button className="btn secondary sm" onClick={() => updateStatus(r.id, r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}>
                  {r.status === 'VISIBLE' ? '🙈 Ẩn' : '👁 Hiện'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
