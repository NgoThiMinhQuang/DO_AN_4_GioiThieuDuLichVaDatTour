import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND } from '../../components/ui.jsx';

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
      setMsg(`Đã cập nhật booking #${id} → ${booking_status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Quản lý Bookings</h2><p>{rows.length} đơn đặt tour — tra cứu & cập nhật trạng thái.</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <div className="form-row">
          <input placeholder="🔍 Tìm mã / tên / email / SĐT..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {BSTATES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : s}</option>)}
          </select>
          <button className="btn sm" onClick={load}>Tìm kiếm</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Tour</th><th>Tổng</th><th>Booking</th><th>Thanh toán</th><th>Đổi TT</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Không có booking nào.</div></td></tr>}
          {rows.map((b) => (
            <tr key={b.id}>
              <td><b>{b.booking_code}</b></td><td>{b.tour_name}</td><td style={{ fontWeight: 700 }}>{formatVND(b.total_amount)}</td>
              <td><StatusBadge value={b.booking_status} /></td>
              <td><StatusBadge value={b.payment_status} /></td>
              <td>
                <select value={b.booking_status} onChange={(e) => patchStatus(b.id, e.target.value)}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
