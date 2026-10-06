import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

const BSTATES = ['', 'PENDING', 'DEPOSIT_PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState(null);

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
      setMsg(`Đã cập nhật đơn đặt tour #${id} thành “${viStatus(booking_status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const filtered = rows.filter((b) => !payStatus || String(b.payment_status).toUpperCase() === payStatus);

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Đơn đặt tour</h2><p>{rows.length} đơn đặt tour — tra cứu và cập nhật trạng thái.</p></div>
        <div className="page-actions">
          <button className="btn sm" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc đơn đặt tour</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã đơn / tên / email / số điện thoại..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {BSTATES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : viStatus(s)}</option>)}
          </select>
          <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
            <option value="">Mọi thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="FAILED">Thất bại</option>
          </select>
          <button className="btn sm" onClick={load}>Tìm kiếm</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Tên tour</th><th>Tổng tiền</th><th>Trạng thái đơn</th><th>Thanh toán</th><th>Đổi trạng thái</th><th>Chi tiết</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Không có đơn đặt tour nào.</div></td></tr>}
          {filtered.map((b) => (
            <tr key={b.id}>
              <td><b>{b.booking_code}</b></td><td>{b.tour_name}</td><td style={{ fontWeight: 700 }}>{formatVND(b.total_amount)}</td>
              <td><StatusBadge value={b.booking_status} /></td>
              <td><StatusBadge value={b.payment_status} /></td>
              <td>
                <select value={b.booking_status} onChange={(e) => patchStatus(b.id, e.target.value)}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
              <td><button className="btn secondary sm" onClick={() => setSelected(b)}>Xem</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Chi tiết đơn {selected.booking_code}</h3>
              <button className="btn ghost sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
            <div className="modal-body">
              <div className="details-card">
                <div className="details-grid">
                  <div><span>Mã đơn</span><b>{selected.booking_code}</b></div>
                  <div><span>Tên tour</span><b>{selected.tour_name || '—'}</b></div>
                  <div><span>Tổng tiền</span><b>{formatVND(selected.total_amount)}</b></div>
                  <div><span>Trạng thái đơn</span><b>{viStatus(selected.booking_status)}</b></div>
                  <div><span>Thanh toán</span><b>{viStatus(selected.payment_status)}</b></div>
                  <div><span>Khách hàng</span><b>{selected.customer_name || selected.contact_name || '—'}</b></div>
                </div>
              </div>
              <div className="form-grid-2">
                <label>Đổi trạng thái<select value={selected.booking_status} onChange={(e) => { patchStatus(selected.id, e.target.value); setSelected({ ...selected, booking_status: e.target.value }); }}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select></label>
                <label>Ghi chú<input placeholder="Ghi chú nội bộ (không lưu)" /></label>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn secondary sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
