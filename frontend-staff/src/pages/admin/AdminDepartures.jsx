import { useState } from 'react';
import api from '../../api/client.js';
import { formatVND, statusBadge } from '../../components/ui.jsx';

// App nhan vien: LUON chi doc — khong nut tao departure, khong doi trang thai.
// Chi xem lich khoi hanh + so cho con lai.
export default function AdminDepartures() {
  const [tourId, setTourId] = useState('');
  const [deps, setDeps] = useState([]);
  const [error, setError] = useState('');

  async function loadByTour() {
    setError('');
    try {
      const params = {};
      if (tourId) params.tour_id = tourId;
      const res = await api.get('/admin/departures', { params });
      setDeps(res.data.data || []);
      if (!(res.data.data || []).length) setError('Chưa có departure nào khớp điều kiện.');
    } catch (e) {
      setDeps([]);
      setError(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="staff-page">
      <div className="page-head">
        <h2>🗓️ Theo dõi lịch khởi hành</h2>
        <p>Chế độ chỉ đọc — xem ngày đi, số chỗ còn lại và trạng thái mở/đóng.</p>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="alert info">Nhập Tour ID (để trống = xem tất cả) — tài khoản nhân viên chỉ xem theo dõi.</div>
      <div className="filters">
        <div className="form-row">
          <input placeholder="Tour ID (VD: 1)" value={tourId} onChange={(e) => setTourId(e.target.value)} />
          <button className="btn" onClick={loadByTour}>Tải departures</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>ID</th><th>Ngày đi</th><th>Còn lại</th><th>Giá NL</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {deps.length === 0 && <tr><td colSpan={5} className="empty-row">Chưa có dữ liệu — bấm “Tải departures”.</td></tr>}
          {deps.map((d) => (
            <tr key={d.id}>
              <td>#{d.id}</td>
              <td>{String(d.departure_date).slice(0, 10)}</td>
              <td><b>{d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)}</b></td>
              <td>{formatVND(d.adult_price)}</td>
              <td><span className={statusBadge(d.status)}>{d.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
