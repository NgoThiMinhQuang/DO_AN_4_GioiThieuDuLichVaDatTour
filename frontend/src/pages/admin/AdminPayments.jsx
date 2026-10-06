import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND } from '../../components/ui.jsx';

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
      <h2>Quản lý Payments & Refunds</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <h3>Payments</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã GD</th><th>Booking</th><th>Số tiền</th><th>TT</th><th>Verify</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.transaction_code}</td><td>{p.booking_code}</td><td>{formatVND(p.amount)}</td>
              <td><span className="badge">{p.status}</span></td>
              <td>
                <button className="btn secondary" onClick={() => verify(p.id, 'SUCCESS')}>SUCCESS</button>{' '}
                <button className="btn danger" onClick={() => verify(p.id, 'FAILED')}>FAILED</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <h3>Refunds</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn</th><th>Booking</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
        <tbody>{refunds.map((r) => <tr key={r.id}><td>{r.refund_code}</td><td>{r.booking_code}</td><td>{formatVND(r.amount)}</td><td>{r.status}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
