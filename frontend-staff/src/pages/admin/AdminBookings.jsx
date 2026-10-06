import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND, statusBadge, viStatus } from '../../components/ui.jsx';

const BSTATES = ['', 'PENDING', 'DEPOSIT_PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/bookings', { params: { q: q || undefined, booking_status: status || undefined, limit: 50 } });
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  async function patchStatus(id, booking_status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { booking_status });
      setMsg(`Đã cập nhật đơn #${id} → ${viStatus(booking_status)}`);
      load();
      if (selectedId === id) openDetail(id);
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function openDetail(id) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/bookings/${id}`);
      setDetail(res.data);
    } catch (e) {
      setDetail({ _error: e.response?.data?.message || e.message });
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>📋 Đơn đặt tour</h2>
          <p>Tra cứu theo mã đơn / tên / email / số điện thoại, lọc trạng thái và xác nhận đơn.</p>
        </div>
        <div className="admin-page-header-actions">
          <span className="page-head-count">🧾 {rows.length} đơn</span>
          <button className="admin-filter-button" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="admin-filter-toolbar is-compact">
        <div className="admin-filter-field">
          <input placeholder="🔍 Tìm mã đơn / tên / email / số điện thoại..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-filter-field">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {BSTATES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : viStatus(s)}</option>)}
          </select>
        </div>
        <button className="admin-primary-button" onClick={load}>Tìm kiếm</button>
      </div>
      <div className="admin-page-card"><table className="admin-table">
        <thead><tr><th>Mã đơn</th><th>Tên tour</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái đơn</th><th>Thanh toán</th><th>Thao tác</th></tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={7}>
              <div className="admin-empty-block">
                <div className="admin-empty-icon">📋</div>
                <b>Chưa có đơn đặt tour nào</b>
                <p>Thử đổi từ khóa hoặc trạng thái lọc rồi bấm “Tìm kiếm”.</p>
              </div>
            </td></tr>
          )}
          {rows.map((b) => (
            <tr key={b.id}>
              <td><span className="table-code">{b.booking_code}</span></td>
              <td><div className="admin-table-stack"><span>{b.tour_name}</span><span className="admin-muted">{b.departure_date ? String(b.departure_date).slice(0, 10) : ''}</span></div></td>
              <td><div className="admin-table-stack"><span>{b.contact_name || b.customer_name || '—'}</span><span className="admin-muted">{b.contact_phone || ''}</span></div></td>
              <td><span className="admin-price">{formatVND(b.total_amount)}</span></td>
              <td><span className={statusBadge(b.booking_status)}>{viStatus(b.booking_status)}</span></td>
              <td><span className={statusBadge(b.payment_status)}>{viStatus(b.payment_status)}</span></td>
              <td>
                <div className="admin-inline-actions">
                  <button className="admin-filter-button" onClick={() => openDetail(b.id)}>Xem</button>
                  <select value={b.booking_status} onChange={(e) => patchStatus(b.id, e.target.value)}>
                    {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {selectedId && (
        <div className="admin-details-card">
          <h4>📄 Chi tiết đơn #{selectedId} — khách hàng &amp; hành khách</h4>
          <div className="admin-inline-actions" style={{ marginBottom: 10 }}>
            <button className="admin-filter-button" onClick={closeDetail}>Đóng chi tiết</button>
          </div>
          {detailLoading && <div className="admin-muted">Đang tải chi tiết...</div>}
          {!detailLoading && detail?._error && <div className="alert error">{detail._error}</div>}
          {!detailLoading && detail && !detail._error && (
            <>
              <div className="admin-details-grid">
                <div className="admin-details-item"><small>Mã đơn</small><span>{detail.booking_code}</span></div>
                <div className="admin-details-item"><small>Tour</small><span>{detail.tour_name}</span></div>
                <div className="admin-details-item"><small>Người liên hệ</small><span>{detail.contact_name || detail.customer_name || '—'} ({detail.contact_phone || '—'})</span></div>
                <div className="admin-details-item"><small>Email</small><span>{detail.contact_email || detail.customer_email || '—'}</span></div>
                <div className="admin-details-item"><small>Tổng tiền</small><span>{formatVND(detail.total_amount)}</span></div>
                <div className="admin-details-item"><small>Đã thanh toán</small><span>{formatVND(detail.paid_amount)}</span></div>
              </div>
              <h4 style={{ marginTop: 14 }}>🧍 Hành khách ({(detail.passengers || []).length})</h4>
              {(detail.passengers || []).length === 0 && <div className="admin-muted">Chưa có thông tin hành khách.</div>}
              {(detail.passengers || []).length > 0 && (
                <div className="mini-table-wrap"><table>
                  <thead><tr><th>Họ tên</th><th>Loại vé</th><th>Ngày sinh</th><th>Giấy tờ</th></tr></thead>
                  <tbody>
                    {detail.passengers.map((p, i) => (
                      <tr key={p.id || i}>
                        <td>{p.full_name}</td>
                        <td>{viStatus(p.ticket_type) !== p.ticket_type ? viStatus(p.ticket_type) : (p.passenger_type || p.ticket_type || '—')}</td>
                        <td>{p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '—'}</td>
                        <td>{p.id_number || p.passport || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
              <h4 style={{ marginTop: 14 }}>💳 Thanh toán &amp; hoàn tiền</h4>
              <div className="admin-details-grid">
                <div className="admin-details-item"><small>Giao dịch</small><span>{(detail.payments || []).length} giao dịch</span></div>
                <div className="admin-details-item"><small>Hoàn tiền</small><span>{(detail.refunds || []).length} yêu cầu</span></div>
              </div>
              {(detail.payments || []).length > 0 && (
                <div className="mini-table-wrap"><table>
                  <thead><tr><th>Mã giao dịch</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    {detail.payments.map((p) => (
                      <tr key={p.id}><td>{p.transaction_code || `#${p.id}`}</td><td>{formatVND(p.amount)}</td><td><span className={statusBadge(p.status)}>{viStatus(p.status)}</span></td></tr>
                    ))}
                  </tbody>
                </table></div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
