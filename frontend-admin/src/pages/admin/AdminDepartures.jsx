import { useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

const STATUSES = ['OPEN', 'ALMOST_FULL', 'FULL', 'CLOSED', 'ONGOING', 'DONE', 'CANCELLED'];

export default function AdminDepartures() {
  const { role } = useAuth();
  const readOnly = role === 'STAFF'; // Nhân viên chỉ theo dõi lịch khởi hành, không thêm/sửa
  const [tourId, setTourId] = useState('');
  const [deps, setDeps] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [createForm, setCreateForm] = useState({ departure_date: '', capacity: 30, status: 'OPEN' });

  async function loadByTour() {
    setError('');
    try {
      const params = {};
      if (tourId) params.tour_id = tourId;
      const res = await api.get('/admin/departures', { params });
      setDeps(res.data.data || []);
      if (!(res.data.data || []).length) setError('Chưa có lịch khởi hành nào khớp điều kiện.');
    } catch (e) {
      setDeps([]);
      setError(e.response?.data?.message || e.message);
    }
  }

  async function create() {
    setMsg('');
    try {
      const res = await api.post(`/admin/tours/${tourId}/departures`, createForm);
      setMsg(`Thêm lịch khởi hành #${res.data.id} thành công.`);
      loadByTour();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/admin/departures/${id}`, { status });
      setMsg(`Đã đổi trạng thái lịch khởi hành #${id} thành “${viStatus(status)}”.`);
      loadByTour();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Lịch khởi hành</h2><p>Lịch khởi hành theo từng tour — đổi trạng thái khi cần.</p></div>
      </div>
      {error && <div className="alert error">{error}</div>}
      {msg && <div className="alert info">{msg}</div>}
      <div className="alert info">Nhập mã tour (để trống là xem tất cả){readOnly ? ' — tài khoản nhân viên chỉ được xem theo dõi.' : '.'}</div>
      <div className="filters">
        <div className="form-row">
          <input placeholder="Mã tour (ví dụ: 1)" value={tourId} onChange={(e) => setTourId(e.target.value)} />
          <button className="btn sm" onClick={loadByTour}>Tải lịch khởi hành</button>
        </div>
        {!readOnly && (
        <div className="form-row">
          <input type="date" value={createForm.departure_date} onChange={(e) => setCreateForm({ ...createForm, departure_date: e.target.value })} />
          <input type="number" placeholder="Sức chứa" value={createForm.capacity} onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })} />
          <button className="btn secondary sm" onClick={create}>Thêm lịch khởi hành</button>
        </div>
        )}
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Ngày khởi hành</th><th>Chỗ còn lại</th><th>Giá người lớn</th><th>Trạng thái</th>{!readOnly && <th>Đổi trạng thái</th>}</tr></thead>
        <tbody>
          {deps.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Nhập mã tour rồi bấm “Tải lịch khởi hành”.</div></td></tr>}
          {deps.map((d) => (
            <tr key={d.id}>
              <td className="muted">#{d.id}</td>
              <td><b>{String(d.departure_date).slice(0, 10)}</b></td>
              <td>{d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)}</td>
              <td style={{ fontWeight: 500 }}>{formatVND(d.adult_price)}</td>
              <td><StatusBadge value={d.status} /></td>
              {!readOnly && (
              <td>
                <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
