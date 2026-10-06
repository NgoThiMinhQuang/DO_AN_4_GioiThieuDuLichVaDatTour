import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, handleImgError, viStatus } from '../../components/ui.jsx';

const STATUSES = ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED'];

export default function AdminTours() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ code: '', name: '', departure_location: '', adult_price: '', status: 'OPEN', is_featured: false });
  const [itin, setItin] = useState({ tour_id: '', day_number: '', title: '', start_time: '', end_time: '' });

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
      await api.post('/admin/tours', { ...form, adult_price: Number(form.adult_price) || 0, duration_days: 3, duration_nights: 2, is_featured: form.is_featured ? 1 : 0 });
      setMsg('Thêm tour mới thành công.');
      setForm({ code: '', name: '', departure_location: '', adult_price: '', status: 'OPEN', is_featured: false });
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function toggleFeatured(id, current) {
    try {
      await api.put(`/admin/tours/${id}`, { is_featured: current ? 0 : 1 });
      setMsg(current ? `Đã bỏ ghim tour nổi bật #${id}.` : `Đã ghim tour #${id} lên nổi bật.`);
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function createItinerary(e) {
    e.preventDefault();
    if (!itin.tour_id || !itin.day_number || !itin.title) {
      setMsg('Vui lòng nhập mã tour, số ngày và tiêu đề lịch trình.');
      return;
    }
    try {
      const res = await api.post(`/admin/tours/${itin.tour_id}/itinerary`, {
        day_number: Number(itin.day_number),
        title: itin.title,
        start_time: itin.start_time || null,
        end_time: itin.end_time || null,
      });
      setMsg(`Thêm lịch trình #${res.data.id} cho tour #${itin.tour_id} thành công.`);
      setItin({ tour_id: '', day_number: '', title: '', start_time: '', end_time: '' });
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function changeStatus(id, status) {
    try {
      await api.put(`/admin/tours/${id}`, { status });
      setMsg(`Đã đổi trạng thái tour #${id} thành “${viStatus(status)}”.`);
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  const filtered = rows.filter((r) => {
    const okQ = !q || `${r.code} ${r.name}`.toLowerCase().includes(q.toLowerCase());
    const okS = !status || r.status === status;
    return okQ && okS;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Quản lý tour</h2><p>{rows.length} tour trong hệ thống — thêm mới và đổi trạng thái.</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} tour hiển thị</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <form className="filters" onSubmit={create}>
        <b>✚ Thêm tour mới</b>
        <div className="form-grid-2">
          <input placeholder="Mã tour (ví dụ: TOUR-DN-01)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Tên tour" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Điểm khởi hành" value={form.departure_location} onChange={(e) => setForm({ ...form, departure_location: e.target.value })} />
          <input type="number" placeholder="Giá người lớn" value={form.adult_price} onChange={(e) => setForm({ ...form, adult_price: e.target.value })} />
        </div>
        <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, fontWeight: 400 }}>
          <input type="checkbox" style={{ width: 'auto', minHeight: 'auto' }} checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Tour nổi bật
        </label>
        <div><button className="btn sm" type="submit">＋ Thêm tour</button></div>
      </form>
      <form className="filters" onSubmit={createItinerary}>
        <b>✚ Thêm lịch trình cho tour</b>
        <div className="form-grid-2">
          <input placeholder="Mã tour (ví dụ: 1)" value={itin.tour_id} onChange={(e) => setItin({ ...itin, tour_id: e.target.value })} />
          <input type="number" min="1" placeholder="Ngày thứ mấy" value={itin.day_number} onChange={(e) => setItin({ ...itin, day_number: e.target.value })} />
          <input placeholder="Tiêu đề lịch trình" value={itin.title} onChange={(e) => setItin({ ...itin, title: e.target.value })} />
          <label>Giờ bắt đầu<input type="time" value={itin.start_time} onChange={(e) => setItin({ ...itin, start_time: e.target.value })} /></label>
          <label>Giờ kết thúc<input type="time" value={itin.end_time} onChange={(e) => setItin({ ...itin, end_time: e.target.value })} /></label>
        </div>
        <div><button className="btn secondary sm" type="submit">＋ Thêm lịch trình</button></div>
      </form>
      <div className="filters">
        <b>Bộ lọc tour</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm kiếm theo mã / tên tour..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
          </select>
          <select value="" onChange={() => {}} aria-label="Sắp xếp">
            <option value="">Sắp xếp: Mới nhất</option>
          </select>
          <button className="btn secondary sm" type="button" onClick={() => { setQ(''); setStatus(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Ảnh</th><th>Mã tour</th><th>Tên tour</th><th>Giá người lớn</th><th>Nổi bật</th><th>Trạng thái</th><th>Đổi trạng thái</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={8}><div className="tv-empty">Không có tour nào khớp.</div></td></tr>}
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
              <td><b>{r.code}</b></td><td>{r.name}</td><td style={{ fontWeight: 600, color: '#1d4ed8' }}>{formatVND(r.adult_price)}</td>
              <td>
                {Number(r.is_featured) === 1 ? <span className="badge b-amber">Nổi bật</span> : <span className="muted">—</span>}
                <div><button className="btn secondary sm" type="button" onClick={() => toggleFeatured(r.id, Number(r.is_featured) === 1)}>{Number(r.is_featured) === 1 ? 'Bỏ ghim' : 'Ghim'}</button></div>
              </td>
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
