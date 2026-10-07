import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

const RSTATES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'];

// Nhân viên + quản trị viên: xử lý yêu cầu hủy và hoàn tiền
export default function AdminRefunds() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
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

  const filtered = rows.filter((r) => {
    const okQ = !q || `${r.refund_code} ${r.booking_code}`.toLowerCase().includes(q.toLowerCase());
    const okS = !status || String(r.status).toUpperCase() === status;
    return okQ && okS;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Hoàn tiền</h2><p>Tạo và duyệt yêu cầu hoàn tiền (số tiền hoàn không vượt quá số đã thanh toán).</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} yêu cầu</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>✚ Thêm yêu cầu hoàn tiền</b>
        <div className="form-grid-2">
          <input placeholder="Mã đơn đặt tour" value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })} />
          <input placeholder="Mã thanh toán (không bắt buộc)" value={form.payment_id} onChange={(e) => setForm({ ...form, payment_id: e.target.value })} />
          <input placeholder="Số tiền hoàn" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input placeholder="Lý do hoàn tiền" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <div><button className="btn sm" onClick={create}>Thêm yêu cầu</button></div>
      </div>
      <div className="filters">
        <b>Bộ lọc hoàn tiền</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã hoàn tiền / mã đơn..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {RSTATES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
          </select>
          <select value="" onChange={() => {}} aria-label="Thời gian">
            <option value="">Mọi thời gian</option>
          </select>
          <button className="btn secondary sm" onClick={() => { setQ(''); setStatus(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn tiền</th><th>Mã đơn</th><th>Số tiền</th><th>Lý do</th><th>Trạng thái</th><th>Duyệt</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Chưa có yêu cầu hoàn tiền nào.</div></td></tr>}
          {filtered.map((r) => (
            <tr key={r.id}>
              <td><b>{r.refund_code}</b></td><td>{r.booking_code}</td><td style={{ fontWeight: 700 }}>{formatVND(r.amount)}</td>
              <td>{r.reason}</td><td><StatusBadge value={r.status} /></td>
              <td>
                <select value={r.status} onChange={(e) => patch(r.id, e.target.value)}>
                  {r.status === 'PENDING' && <option value="PENDING">{viStatus('PENDING')}</option>}
                  {['PROCESSING', 'SUCCESS', 'FAILED'].map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
