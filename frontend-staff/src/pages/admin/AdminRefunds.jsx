import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

// Backend PATCH /api/admin/refunds/:id chỉ nhận PROCESSING | SUCCESS | FAILED.
// PENDING là trạng thái khởi tạo (POST tạo ra), không gửi PATCH PENDING.
const PATCH_STATES = ['PROCESSING', 'SUCCESS', 'FAILED'];

// STAFF: xu ly yeu cau huy va hoan tien
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
    const bookingId = Number(form.booking_id);
    const amount = Number(form.amount);
    if (!form.booking_id || !bookingId || bookingId <= 0) {
      setMsg('Vui lòng nhập mã đơn đặt tour hợp lệ.');
      return;
    }
    if (!form.amount || !(amount > 0)) {
      setMsg('Vui lòng nhập số tiền hoàn lớn hơn 0.');
      return;
    }
    try {
      const res = await api.post('/admin/refunds', {
        booking_id: bookingId,
        payment_id: form.payment_id ? Number(form.payment_id) : null,
        amount,
        reason: form.reason,
      });
      setMsg(`Đã tạo yêu cầu hoàn ${res.data.refund_code} (số tiền hoàn không vượt quá số đã thanh toán)`);
      setForm({ booking_id: '', payment_id: '', amount: '', reason: '' });
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function patch(id, status) {
    if (!PATCH_STATES.includes(status)) {
      setMsg('Trạng thái duyệt phải là Đang xử lý / Thành công / Thất bại.');
      return;
    }
    try {
      await api.patch(`/admin/refunds/${id}`, { status });
      setMsg(`Yêu cầu hoàn #${id} → ${viStatus(status)}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const up = (v) => String(v || '').toUpperCase();
  const pendingCount = rows.filter((r) => ['PENDING', 'PROCESSING'].includes(up(r.status))).length;
  const successCount = rows.filter((r) => up(r.status) === 'SUCCESS').length;
  const totalRefunded = rows.filter((r) => up(r.status) === 'SUCCESS').reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>↩️ Hoàn tiền</h2>
          <p>Tạo yêu cầu hoàn cho đơn bị hủy và cập nhật trạng thái xử lý.</p>
        </div>
        <div className="admin-page-header-actions">
          <span className="page-head-count">⏳ {pendingCount} chờ xử lý / {rows.length} yêu cầu</span>
          <button className="admin-filter-button" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      {rows.length > 0 && (
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card"><span className="admin-kpi-icon">↩️</span><div className="admin-kpi-body"><span className="admin-muted">Tổng yêu cầu</span><b>{rows.length}</b><div className="admin-muted">Tất cả trạng thái</div></div></div>
          <div className="admin-kpi-card"><span className="admin-kpi-icon g3">⏳</span><div className="admin-kpi-body"><span className="admin-muted">Chờ xử lý</span><b>{pendingCount}</b><div className="admin-muted">Mới + đang xử lý</div></div></div>
          <div className="admin-kpi-card"><span className="admin-kpi-icon g2">✅</span><div className="admin-kpi-body"><span className="admin-muted">Đã hoàn thành</span><b>{successCount}</b><div className="admin-muted">Hoàn tiền thành công</div></div></div>
          <div className="admin-kpi-card"><span className="admin-kpi-icon g4">💰</span><div className="admin-kpi-body"><span className="admin-muted">Đã hoàn</span><b>{formatVND(totalRefunded)}</b><div className="admin-muted">Tổng tiền hoàn thành công</div></div></div>
        </div>
      )}
      <div className="sub-head"><h3>Tạo yêu cầu hoàn mới</h3><span className="admin-muted">Số tiền không vượt quá số đã thanh toán</span></div>
      <div className="admin-filter-toolbar">
        <div className="admin-filter-field">
          <input placeholder="Mã đơn đặt tour *" value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })} />
        </div>
        <div className="admin-filter-field">
          <input placeholder="Mã thanh toán (không bắt buộc)" value={form.payment_id} onChange={(e) => setForm({ ...form, payment_id: e.target.value })} />
        </div>
        <div className="admin-filter-field">
          <input placeholder="Số tiền hoàn *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <button className="admin-primary-button" onClick={create}>Tạo yêu cầu hoàn</button>
        <div className="admin-filter-field full-width">
          <input placeholder="Lý do hoàn tiền (ví dụ: khách hủy tour, tour không khởi hành...)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </div>
      <div className="sub-head"><h3>Danh sách yêu cầu hoàn</h3><span className="admin-muted">{rows.length} yêu cầu</span></div>
      <div className="admin-page-card"><table className="admin-table">
        <thead><tr><th>Mã hoàn</th><th>Mã đơn</th><th>Số tiền</th><th>Lý do</th><th>Trạng thái</th><th>Duyệt</th></tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={6}>
              <div className="admin-empty-block">
                <div className="admin-empty-icon">↩️</div>
                <b>Chưa có yêu cầu hoàn tiền nào</b>
                <p>Nhập mã đơn và số tiền ở biểu mẫu trên để tạo yêu cầu mới.</p>
              </div>
            </td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.id}>
              <td><span className="table-code">{r.refund_code}</span></td><td>{r.booking_code || (r.booking_id ? `#${r.booking_id}` : '—')}</td><td><span className="admin-price">{formatVND(r.amount)}</span></td>
              <td>{r.reason || '—'}</td><td><span className={statusBadge(r.status)}>{viStatus(r.status)}</span></td>
              <td>
                <div className="admin-inline-actions">
                  <select
                    value={PATCH_STATES.includes(up(r.status)) ? up(r.status) : ''}
                    onChange={(e) => { if (e.target.value) patch(r.id, e.target.value); }}
                  >
                    <option value="">{up(r.status) === 'PENDING' ? 'Chờ xử lý — chọn bước tiếp' : viStatus(r.status)}</option>
                    {PATCH_STATES.map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                  </select>
                  {up(r.status) === 'PENDING' && (
                    <button className="admin-filter-button" onClick={() => patch(r.id, 'PROCESSING')}>Tiếp nhận</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="admin-details-card">
        <h4>📌 Lưu ý nghiệp vụ hoàn tiền</h4>
        <div className="admin-details-grid">
          <div className="admin-details-item"><small>Điều kiện</small><span>Số tiền hoàn ≤ số đã thanh toán</span></div>
          <div className="admin-details-item"><small>Quy trình</small><span>Chờ xử lý → Đang xử lý → Thành công / Thất bại</span></div>
        </div>
      </div>
    </div>
  );
}
