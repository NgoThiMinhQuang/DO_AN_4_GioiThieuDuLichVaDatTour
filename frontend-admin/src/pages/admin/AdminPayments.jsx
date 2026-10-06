import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
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
      setMsg(`Giao dịch thanh toán #${id} đã chuyển thành “${viStatus(status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const filtered = rows.filter((p) => {
    const okQ = !q || `${p.transaction_code} ${p.booking_code}`.toLowerCase().includes(q.toLowerCase());
    const okS = !status || String(p.status).toUpperCase() === status;
    return okQ && okS;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Thanh toán</h2><p>Xác minh giao dịch thanh toán và theo dõi hoàn tiền.</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} giao dịch</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc thanh toán</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã giao dịch / mã đơn..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="FAILED">Thất bại</option>
            <option value="PROCESSING">Đang xử lý</option>
          </select>
          <select value="" onChange={() => {}} aria-label="Phương thức">
            <option value="">Mọi phương thức</option>
          </select>
          <button className="btn secondary sm" onClick={() => { setQ(''); setStatus(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="tv-panel">
        <h3>💳 Danh sách thanh toán</h3>
        <div className="table-wrap" style={{ marginBottom: 0 }}><table>
          <thead><tr><th>Mã giao dịch</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th><th>Duyệt</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5}><div className="tv-empty">Chưa có giao dịch nào.</div></td></tr>}
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><b>{p.transaction_code}</b></td><td>{p.booking_code}</td><td style={{ fontWeight: 700 }}>{formatVND(p.amount)}</td>
                <td><StatusBadge value={p.status} /></td>
                <td>
                  <div className="tv-actions">
                    <button className="btn sm secondary" onClick={() => verify(p.id, 'SUCCESS')}>✓ Duyệt</button>
                    <button className="btn sm danger" onClick={() => verify(p.id, 'FAILED')}>✕ Từ chối</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div className="tv-panel">
        <h3>↩ Danh sách hoàn tiền</h3>
        <div className="details-card">
          <span className="muted">Có {refunds.length} yêu cầu hoàn tiền liên quan. Sang trang Hoàn tiền để duyệt chi tiết.</span>
        </div>
        <div className="table-wrap" style={{ marginBottom: 0, marginTop: 12 }}><table>
          <thead><tr><th>Mã hoàn tiền</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {refunds.length === 0 && <tr><td colSpan={4}><div className="tv-empty">Chưa có yêu cầu hoàn tiền nào.</div></td></tr>}
            {refunds.map((r) => <tr key={r.id}><td><b>{r.refund_code}</b></td><td>{r.booking_code}</td><td style={{ fontWeight: 700 }}>{formatVND(r.amount)}</td><td><StatusBadge value={r.status} /></td></tr>)}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
