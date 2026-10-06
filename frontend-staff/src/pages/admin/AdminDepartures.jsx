import { useState } from 'react';
import api from '../../api/client.js';
import { formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

// App nhan vien: LUON chi doc — khong nut tao lich khoi hanh, khong doi trang thai.
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
      if (!(res.data.data || []).length) setError('Chưa có lịch khởi hành nào khớp điều kiện.');
    } catch (e) {
      setDeps([]);
      setError(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="staff-page">
      <div className="page-head">
        <h2>🗓️ Lịch khởi hành</h2>
        <p>Chế độ chỉ đọc — xem ngày đi, số chỗ còn lại và trạng thái mở/đóng.</p>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="alert info">Nhập mã tour (để trống = xem tất cả) — tài khoản nhân viên chỉ được xem theo dõi.</div>
      <div className="filters">
        <div className="form-row">
          <input placeholder="Mã tour (ví dụ: 1)" value={tourId} onChange={(e) => setTourId(e.target.value)} />
          <button className="btn" onClick={loadByTour}>Tải lịch khởi hành</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Ngày đi</th><th>Còn lại</th><th>Giá người lớn</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {deps.length === 0 && <tr><td colSpan={5} className="empty-row">Chưa có dữ liệu — bấm “Tải lịch khởi hành”.</td></tr>}
          {deps.map((d) => (
            <tr key={d.id}>
              <td>#{d.id}</td>
              <td>{String(d.departure_date).slice(0, 10)}</td>
              <td><b>{d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)}</b></td>
              <td>{formatVND(d.adult_price)}</td>
              <td><span className={statusBadge(d.status)}>{viStatus(d.status)}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
