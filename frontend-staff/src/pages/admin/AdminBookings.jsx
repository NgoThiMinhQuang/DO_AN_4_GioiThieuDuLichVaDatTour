import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

const BSTATES = ['', 'PENDING', 'DEPOSIT_PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/bookings', { params: { q: q || undefined, booking_status: status || undefined, limit: 50 } });
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  async function patchStatus(id, booking_status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { booking_status });
      setMsg(`Đã cập nhật đơn #${id} → ${viStatus(booking_status)}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div className="staff-page">
      <div className="page-head">
        <h2>📋 Đơn đặt tour</h2>
        <p>Tra cứu theo mã đơn / tên / email / số điện thoại, lọc trạng thái và xác nhận đơn.</p>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <div className="form-row">
          <input placeholder="Tìm mã đơn / tên / email / số điện thoại..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {BSTATES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : viStatus(s)}</option>)}
          </select>
          <button className="btn" onClick={load}>Tìm kiếm</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Tên tour</th><th>Tổng tiền</th><th>Trạng thái đơn</th><th>Thanh toán</th><th>Cập nhật</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="empty-row">Chưa có đơn đặt tour nào.</td></tr>}
          {rows.map((b) => (
            <tr key={b.id}>
              <td><b>{b.booking_code}</b></td><td>{b.tour_name}</td><td>{formatVND(b.total_amount)}</td>
              <td><span className={statusBadge(b.booking_status)}>{viStatus(b.booking_status)}</span></td>
              <td><span className={statusBadge(b.payment_status)}>{viStatus(b.payment_status)}</span></td>
              <td>
                <select value={b.booking_status} onChange={(e) => patchStatus(b.id, e.target.value)}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
