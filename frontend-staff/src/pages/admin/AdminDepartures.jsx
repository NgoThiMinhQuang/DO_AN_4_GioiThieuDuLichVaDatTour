import { useState } from 'react';
import api from '../../api/client.js';
import { formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

// App nhan vien: LUON chi doc — khong nut tao lich khoi hanh, khong doi trang thai.
// Chi xem lich khoi hanh + so cho con lai.
export default function AdminDepartures() {
  const [tourId, setTourId] = useState('');
  const [deps, setDeps] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function loadByTour() {
    setError('');
    try {
      const params = {};
      if (tourId) params.tour_id = tourId;
      const res = await api.get('/admin/departures', { params });
      setDeps(res.data.data || []);
      setLoaded(true);
      if (!(res.data.data || []).length) setError('Chưa có lịch khởi hành nào khớp điều kiện.');
    } catch (e) {
      setDeps([]);
      setLoaded(true);
      setError(e.response?.data?.message || e.message);
    }
  }

  const remainingOf = (d) => d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats);
  const totalRemaining = deps.reduce((s, d) => s + (Number(remainingOf(d)) || 0), 0);
  const openCount = deps.filter((d) => ['OPEN', 'ALMOST_FULL', 'AVAILABLE'].includes(String(d.status || '').toUpperCase())).length;

  return (
    <div className="staff-page">
      <div className="page-head">
        <div>
          <h2>🗓️ Lịch khởi hành</h2>
          <p>Chế độ chỉ đọc — xem ngày đi, số chỗ còn lại và trạng thái mở/đóng.</p>
        </div>
        <div className="page-head-actions">
          <span className="page-head-count">📅 {deps.length} lịch</span>
          <button className="btn secondary" onClick={loadByTour}>Tải lại</button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="alert info">Nhập mã tour (để trống = xem tất cả) — tài khoản nhân viên chỉ được xem theo dõi.</div>
      {loaded && deps.length > 0 && (
        <div className="stat-cards">
          <div className="stat"><span className="stat-ic">🗓️</span><div><span className="muted">Tổng lịch</span><b>{deps.length}</b><div className="stat-sub">Khớp điều kiện lọc</div></div></div>
          <div className="stat"><span className="stat-ic g2">✅</span><div><span className="muted">Đang mở</span><b>{openCount}</b><div className="stat-sub">Có thể nhận khách</div></div></div>
          <div className="stat"><span className="stat-ic g3">💺</span><div><span className="muted">Chỗ còn lại</span><b>{totalRemaining}</b><div className="stat-sub">Tổng số chỗ trống</div></div></div>
        </div>
      )}
      <div className="filters">
        <div className="form-row single">
          <input placeholder="Mã tour (ví dụ: 1, để trống = xem tất cả)" value={tourId} onChange={(e) => setTourId(e.target.value)} />
          <button className="btn" onClick={loadByTour}>Tải lịch khởi hành</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Ngày đi</th><th>Còn lại</th><th>Giá người lớn</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {deps.length === 0 && (
            <tr><td colSpan={5}>
              <div className="empty-state">
                <div className="empty-state-ic">🗓️</div>
                <b>{loaded ? 'Chưa có lịch khởi hành nào' : 'Chưa tải dữ liệu'}</b>
                <p>{loaded ? 'Thử đổi mã tour hoặc bấm “Tải lại”.' : 'Bấm “Tải lịch khởi hành” để xem danh sách.'}</p>
              </div>
            </td></tr>
          )}
          {deps.map((d) => (
            <tr key={d.id}>
              <td>#{d.id}</td>
              <td>{String(d.departure_date).slice(0, 10)}</td>
              <td><span className="table-code">{remainingOf(d)}</span></td>
              <td><span className="money">{formatVND(d.adult_price)}</span></td>
              <td><span className={statusBadge(d.status)}>{viStatus(d.status)}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
