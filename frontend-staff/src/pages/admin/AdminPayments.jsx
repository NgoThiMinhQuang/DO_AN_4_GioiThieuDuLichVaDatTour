import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND, statusBadge } from '../../components/ui.jsx';

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setError('');
    try {
      const [p, r] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/refunds').catch(() => ({ data: { data: [] } }))
      ]);
      setRows(p.data.data || []);
      setRefunds(r.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function verify(id, status) {
    try {
      await api.patch(`/admin/payments/${id}/verify`, { status });
      setMsg(`Payment #${id} → ${status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div className="staff-page">
      <div className="page-head">
        <h2>💳 Quản lý Payments & Refunds</h2>
        <p>Xác nhận giao dịch thành công / thất bại, theo dõi các yêu cầu hoàn tiền.</p>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="page-head"><h2 style={{ fontSize: 17 }}>Payments</h2></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã GD</th><th>Booking</th><th>Số tiền</th><th>TT</th><th>Verify</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="empty-row">Chưa có payment nào.</td></tr>}
          {rows.map((p) => (
            <tr key={p.id}>
              <td><b>{p.transaction_code}</b></td><td>{p.booking_code}</td><td>{formatVND(p.amount)}</td>
              <td><span className={statusBadge(p.status)}>{p.status}</span></td>
              <td>
                <div className="row-actions">
                  <button className="btn small secondary" onClick={() => verify(p.id, 'SUCCESS')}>SUCCESS</button>
                  <button className="btn small danger" onClick={() => verify(p.id, 'FAILED')}>FAILED</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="page-head"><h2 style={{ fontSize: 17 }}>Refunds</h2></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn</th><th>Booking</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {refunds.length === 0 && <tr><td colSpan={4} className="empty-row">Chưa có refund nào.</td></tr>}
          {refunds.map((r) => <tr key={r.id}><td><b>{r.refund_code}</b></td><td>{r.booking_code}</td><td>{formatVND(r.amount)}</td><td><span className={statusBadge(r.status)}>{r.status}</span></td></tr>)}
        </tbody>
      </table></div>
    </div>
  );
}
