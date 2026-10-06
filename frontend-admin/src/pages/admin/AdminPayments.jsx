import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND } from '../../components/ui.jsx';

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
    <div>
      <div className="tv-pagehead">
        <div><h2>Quản lý Payments & Refunds</h2><p>Xác minh giao dịch thanh toán & theo dõi hoàn tiền.</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="tv-panel">
        <h3>💳 Payments</h3>
        <div className="table-wrap" style={{ marginBottom: 0 }}><table>
          <thead><tr><th>Mã GD</th><th>Booking</th><th>Số tiền</th><th>TT</th><th>Verify</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5}><div className="tv-empty">Chưa có giao dịch nào.</div></td></tr>}
            {rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.transaction_code}</b></td><td>{p.booking_code}</td><td style={{ fontWeight: 700 }}>{formatVND(p.amount)}</td>
                <td><StatusBadge value={p.status} /></td>
                <td>
                  <div className="tv-actions">
                    <button className="btn sm secondary" onClick={() => verify(p.id, 'SUCCESS')}>✓ SUCCESS</button>
                    <button className="btn sm danger" onClick={() => verify(p.id, 'FAILED')}>✕ FAILED</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div className="tv-panel">
        <h3>↩ Refunds</h3>
        <div className="table-wrap" style={{ marginBottom: 0 }}><table>
          <thead><tr><th>Mã hoàn</th><th>Booking</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {refunds.length === 0 && <tr><td colSpan={4}><div className="tv-empty">Chưa có yêu cầu hoàn nào.</div></td></tr>}
            {refunds.map((r) => <tr key={r.id}><td><b>{r.refund_code}</b></td><td>{r.booking_code}</td><td style={{ fontWeight: 700 }}>{formatVND(r.amount)}</td><td><StatusBadge value={r.status} /></td></tr>)}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
