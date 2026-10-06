import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, handleImgError, viStatus } from '../../components/ui.jsx';

const STATUSES = ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED'];

export default function AdminTours() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ code: '', name: '', departure_location: '', adult_price: '', status: 'OPEN' });

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/tours');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api.post('/admin/tours', { ...form, adult_price: Number(form.adult_price) || 0, duration_days: 3, duration_nights: 2 });
      setMsg('Thêm tour mới thành công.');
      setForm({ code: '', name: '', departure_location: '', adult_price: '', status: 'OPEN' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function changeStatus(id, status) {
    try {
      await api.put(`/admin/tours/${id}`, { status });
      setMsg(`Đã đổi trạng thái tour #${id} thành “${viStatus(status)}”.`);
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  const filtered = rows.filter((r) => !q || `${r.code} ${r.name}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Quản lý tour</h2><p>{rows.length} tour trong hệ thống — thêm mới và đổi trạng thái.</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <form className="filters" onSubmit={create}>
        <b>✚ Thêm tour mới</b>
        <div className="form-row">
          <input placeholder="Mã tour (ví dụ: TOUR-DN-01)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Tên tour" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Điểm khởi hành" value={form.departure_location} onChange={(e) => setForm({ ...form, departure_location: e.target.value })} />
          <input type="number" placeholder="Giá người lớn" value={form.adult_price} onChange={(e) => setForm({ ...form, adult_price: e.target.value })} />
        </div>
        <div><button className="btn sm" type="submit">＋ Thêm tour</button></div>
      </form>
      <div className="filters"><input placeholder="🔍 Tìm kiếm theo mã / tên tour..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Ảnh</th><th>Mã tour</th><th>Tên tour</th><th>Giá người lớn</th><th>Trạng thái</th><th>Đổi trạng thái</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Không có tour nào khớp.</div></td></tr>}
          {filtered.map((r) => (
            <tr key={r.id}>
              <td className="muted">#{r.id}</td>
              <td>
                <img
                  className="tv-thumb"
                  src={r.thumbnail || '/images/banner.jpg'}
                  alt={r.name}
                  loading="lazy"
                  onError={handleImgError}
                />
              </td>
              <td><b>{r.code}</b></td><td>{r.name}</td><td style={{ fontWeight: 700, color: '#1d4ed8' }}>{formatVND(r.adult_price)}</td>
              <td><StatusBadge value={r.status} /></td>
              <td>
                <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
