import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND } from '../../components/ui.jsx';

const RSTATES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'];

// STAFF + ADMIN: xu ly yeu cau huy va hoan tien (README muc 37-38)
export default function AdminRefunds() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ booking_id: '', payment_id: '', amount: '', reason: '' });

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/refunds');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setMsg('');
    try {
      const res = await api.post('/admin/refunds', {
        booking_id: Number(form.booking_id),
        payment_id: form.payment_id ? Number(form.payment_id) : null,
        amount: Number(form.amount),
        reason: form.reason,
      });
      setMsg(`Tạo yêu cầu hoàn ${res.data.refund_code} thành công (số tiền hoàn ≤ đã thanh toán - BR23)`);
      setForm({ booking_id: '', payment_id: '', amount: '', reason: '' });
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function patch(id, status) {
    try {
      await api.patch(`/admin/refunds/${id}`, { status });
      setMsg(`Refund #${id} → ${status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <h2>Quản lý Hoàn tiền</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <div className="form-row">
          <input placeholder="Booking ID" value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })} />
          <input placeholder="Payment ID (không bắt buộc)" value={form.payment_id} onChange={(e) => setForm({ ...form, payment_id: e.target.value })} />
          <input placeholder="Số tiền hoàn" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input placeholder="Lý do" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button className="btn" onClick={create}>Tạo yêu cầu hoàn</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn</th><th>Booking</th><th>Số tiền</th><th>Lý do</th><th>Trạng thái</th><th>Duyệt</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.refund_code}</td><td>{r.booking_code}</td><td>{formatVND(r.amount)}</td>
              <td>{r.reason}</td><td><span className="badge">{r.status}</span></td>
              <td>
                <select value={r.status} onChange={(e) => patch(r.id, e.target.value)}>
                  {RSTATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
