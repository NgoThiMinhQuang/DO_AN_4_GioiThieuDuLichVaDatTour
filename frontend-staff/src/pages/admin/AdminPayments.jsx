import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

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
      setMsg(`Giao dịch #${id} → ${viStatus(status)}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div className="staff-page">
      <div className="page-head">
        <h2>💳 Thanh toán</h2>
        <p>Xác nhận giao dịch thành công hay thất bại, đồng thời theo dõi các yêu cầu hoàn tiền.</p>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="page-head"><h2 style={{ fontSize: 17 }}>Danh sách thanh toán</h2></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã giao dịch</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th><th>Xác nhận</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="empty-row">Chưa có giao dịch thanh toán nào.</td></tr>}
          {rows.map((p) => (
            <tr key={p.id}>
              <td><span className="table-code">{p.transaction_code}</span></td><td>{p.booking_code}</td><td><span className="money">{formatVND(p.amount)}</span></td>
              <td><span className={statusBadge(p.status)}>{viStatus(p.status)}</span></td>
              <td>
                <div className="row-actions">
                  <button className="btn small secondary" onClick={() => verify(p.id, 'SUCCESS')}>Thành công</button>
                  <button className="btn small danger" onClick={() => verify(p.id, 'FAILED')}>Thất bại</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="page-head"><h2 style={{ fontSize: 17 }}>Danh sách hoàn tiền</h2></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã hoàn</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {refunds.length === 0 && <tr><td colSpan={4} className="empty-row">Chưa có yêu cầu hoàn tiền nào.</td></tr>}
          {refunds.map((r) => <tr key={r.id}><td><span className="table-code">{r.refund_code}</span></td><td>{r.booking_code}</td><td><span className="money">{formatVND(r.amount)}</span></td><td><span className={statusBadge(r.status)}>{viStatus(r.status)}</span></td></tr>)}
        </tbody>
      </table></div>
    </div>
  );
}
