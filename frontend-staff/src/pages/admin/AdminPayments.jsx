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

  const successCount = rows.filter((p) => String(p.status || '').toUpperCase() === 'SUCCESS').length;
  const pendingCount = rows.filter((p) => !['SUCCESS', 'FAILED'].includes(String(p.status || '').toUpperCase())).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>💳 Thanh toán</h2>
          <p>Xác nhận giao dịch thành công hay thất bại, đồng thời theo dõi các yêu cầu hoàn tiền.</p>
        </div>
        <div className="admin-page-header-actions">
          <span className="page-head-count">💳 {rows.length} giao dịch</span>
          <button className="admin-filter-button" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card"><span className="admin-kpi-icon">💳</span><div className="admin-kpi-body"><span className="admin-muted">Tổng giao dịch</span><b>{rows.length}</b><div className="admin-muted">Tất cả phương thức</div></div></div>
        <div className="admin-kpi-card"><span className="admin-kpi-icon g2">✅</span><div className="admin-kpi-body"><span className="admin-muted">Đã thành công</span><b>{successCount}</b><div className="admin-muted">Ghi nhận doanh thu</div></div></div>
        <div className="admin-kpi-card"><span className="admin-kpi-icon g3">⏳</span><div className="admin-kpi-body"><span className="admin-muted">Chờ xác nhận</span><b>{pendingCount}</b><div className="admin-muted">Cần nhân viên duyệt</div></div></div>
        <div className="admin-kpi-card"><span className="admin-kpi-icon g4">↩️</span><div className="admin-kpi-body"><span className="admin-muted">Yêu cầu hoàn</span><b>{refunds.length}</b><div className="admin-muted">Theo dõi bên dưới</div></div></div>
      </div>
      <div className="sub-head"><h3>Danh sách thanh toán</h3><span className="admin-muted">{rows.length} giao dịch</span></div>
      <div className="admin-page-card"><table className="admin-table">
        <thead><tr><th>Mã giao dịch</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th><th>Xác nhận</th></tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={5}>
              <div className="admin-empty-block">
                <div className="admin-empty-icon">💳</div>
                <b>Chưa có giao dịch thanh toán nào</b>
                <p>Giao dịch mới của khách sẽ hiện tại đây để xác nhận.</p>
              </div>
            </td></tr>
          )}
          {rows.map((p) => (
            <tr key={p.id}>
              <td><span className="table-code">{p.transaction_code}</span></td><td>{p.booking_code}</td><td><span className="admin-price">{formatVND(p.amount)}</span></td>
              <td><span className={statusBadge(p.status)}>{viStatus(p.status)}</span></td>
              <td>
                <div className="admin-inline-actions">
                  <button className="admin-filter-button" onClick={() => verify(p.id, 'SUCCESS')}>Thành công</button>
                  <button className="admin-danger-button" onClick={() => verify(p.id, 'FAILED')}>Thất bại</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="sub-head"><h3>Danh sách hoàn tiền</h3><span className="admin-muted">{refunds.length} yêu cầu</span></div>
      <div className="admin-page-card"><table className="admin-table">
        <thead><tr><th>Mã hoàn</th><th>Mã đơn</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {refunds.length === 0 && (
            <tr><td colSpan={4}>
              <div className="admin-empty-block">
                <div className="admin-empty-icon">↩️</div>
                <b>Chưa có yêu cầu hoàn tiền nào</b>
                <p>Sang trang “Hoàn tiền” để tạo yêu cầu mới.</p>
              </div>
            </td></tr>
          )}
          {refunds.map((r) => <tr key={r.id}><td><span className="table-code">{r.refund_code}</span></td><td>{r.booking_code}</td><td><span className="admin-price">{formatVND(r.amount)}</span></td><td><span className={statusBadge(r.status)}>{viStatus(r.status)}</span></td></tr>)}
        </tbody>
      </table></div>
    </div>
  );
}
