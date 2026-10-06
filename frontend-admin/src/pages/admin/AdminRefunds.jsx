import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

const RSTATES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'];

// Nhân viên + quản trị viên: xử lý yêu cầu hủy và hoàn tiền
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
      setMsg(`Đã tạo yêu cầu hoàn tiền ${res.data.refund_code} thành công (số tiền hoàn không vượt quá số đã thanh toán).`);
      setForm({ booking_id: '', payment_id: '', amount: '', reason: '' });
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function patch(id, status) {
    try {
      await api.patch(`/admin/refunds/${id}`, { status });
      setMsg(`Yêu cầu hoàn tiền #${id} đã chuyển thành “${viStatus(status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Hoàn tiền</h2><p>Tạo và duyệt yêu cầu hoàn tiền (số tiền hoàn không vượt quá số đã thanh toán).</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>✚ Thêm yêu cầu hoàn tiền</b>
        <div className="form-row">
          <input placeholder="Mã đơn đặt tour" value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })} />
          <input placeholder="Mã thanh toán (không bắt buộc)" value={form.payment_id} onChange={(e) => setForm({ ...form, payment_id: e.target.value })} />
          <input placeholder="Số tiền hoàn" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input placeholder="Lý do hoàn tiền" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button className="btn sm" onClick={create}>Thêm yêu cầu</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn tiền</th><th>Mã đơn</th><th>Số tiền</th><th>Lý do</th><th>Trạng thái</th><th>Duyệt</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Chưa có yêu cầu hoàn tiền nào.</div></td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td><b>{r.refund_code}</b></td><td>{r.booking_code}</td><td style={{ fontWeight: 500 }}>{formatVND(r.amount)}</td>
              <td>{r.reason}</td><td><StatusBadge value={r.status} /></td>
              <td>
                <select value={r.status} onChange={(e) => patch(r.id, e.target.value)}>
                  {RSTATES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
