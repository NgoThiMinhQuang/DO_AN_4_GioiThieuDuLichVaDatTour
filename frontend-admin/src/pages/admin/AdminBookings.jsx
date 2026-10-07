import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND, viStatus } from '../../components/ui.jsx';

const BSTATES = ['', 'PENDING', 'DEPOSIT_PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState('');

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/bookings', {
        params: {
          q: q || undefined,
          booking_status: status || undefined,
          payment_status: payStatus || undefined,
          limit: 50,
        },
      });
      setRows(res.data.data || []);
      if (!(res.data.data || []).length) setError('');
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  async function patchStatus(id, booking_status, noteValue) {
    try {
      const body = { booking_status };
      if (noteValue !== undefined) body.note = noteValue;
      await api.patch(`/admin/bookings/${id}/status`, body);
      setMsg(`Đã cập nhật đơn đặt tour #${id} thành “${viStatus(booking_status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function openDetail(b) {
    setSelected(b);
    setNote(b.note || '');
    setDetail(null);
    try {
      const res = await api.get(`/admin/bookings/${b.id}`);
      setDetail(res.data);
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const filtered = rows;

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Đơn đặt tour</h2><p>{rows.length} đơn đặt tour — tra cứu và cập nhật trạng thái.</p></div>
        <div className="page-actions">
          <button className="btn sm" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc đơn đặt tour</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã đơn / tên / email / số điện thoại..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {BSTATES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : viStatus(s)}</option>)}
          </select>
          <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
            <option value="">Mọi thanh toán</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PARTIAL">Thanh toán một phần</option>
            <option value="DEPOSITED">Đã đặt cọc</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="REFUNDED_PARTIAL">Đã hoàn một phần</option>
            <option value="REFUNDED_FULL">Đã hoàn toàn bộ</option>
          </select>
          <button className="btn sm" onClick={load}>Tìm kiếm</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Tên tour</th><th>Tổng tiền</th><th>Trạng thái đơn</th><th>Thanh toán</th><th>Đổi trạng thái</th><th>Chi tiết</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Không có đơn đặt tour nào.</div></td></tr>}
          {filtered.map((b) => (
            <tr key={b.id}>
              <td><b>{b.booking_code}</b></td><td>{b.tour_name}</td><td style={{ fontWeight: 700 }}>{formatVND(b.total_amount)}</td>
              <td><StatusBadge value={b.booking_status} /></td>
              <td><StatusBadge value={b.payment_status} /></td>
              <td>
                <select value={b.booking_status} onChange={(e) => patchStatus(b.id, e.target.value)}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select>
              </td>
              <td><button className="btn secondary sm" onClick={() => openDetail(b)}>Xem</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Chi tiết đơn {selected.booking_code}</h3>
              <button className="btn ghost sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
            <div className="modal-body">
              <div className="details-card">
                <div className="details-grid">
                  <div><span>Mã đơn</span><b>{selected.booking_code}</b></div>
                  <div><span>Tên tour</span><b>{selected.tour_name || '—'}</b></div>
                  <div><span>Tổng tiền</span><b>{formatVND(selected.total_amount)}</b></div>
                  <div><span>Trạng thái đơn</span><b>{viStatus(selected.booking_status)}</b></div>
                  <div><span>Thanh toán</span><b>{viStatus(selected.payment_status)}</b></div>
                  <div><span>Khách hàng</span><b>{selected.customer_name || selected.contact_name || '—'}</b></div>
                </div>
              </div>
              <div className="form-grid-2">
                <label>Đổi trạng thái<select value={selected.booking_status} onChange={(e) => { patchStatus(selected.id, e.target.value, note); setSelected({ ...selected, booking_status: e.target.value }); }}>
                  {BSTATES.filter(Boolean).map((s) => <option key={s} value={s}>{viStatus(s)}</option>)}
                </select></label>
                <label>Ghi chú<input placeholder="Ghi chú nội bộ" value={note} onChange={(e) => setNote(e.target.value)} /></label>
              </div>
              <div style={{ marginTop: 8 }}>
                <button className="btn sm" type="button" onClick={() => patchStatus(selected.id, selected.booking_status, note)}>Lưu ghi chú</button>
              </div>
              <div className="details-card" style={{ marginTop: 12 }}>
                <b>Hành khách ({(detail?.passengers || []).length})</b>
                {(detail?.passengers || []).length === 0
                  ? <div className="muted">Chưa có dữ liệu hành khách.</div>
                  : (detail.passengers.map((p) => (
                    <div key={p.id} className="muted">{p.full_name} — {p.passenger_type} — {p.phone || p.email || ''}</div>
                  )))}
              </div>
              <div className="details-card" style={{ marginTop: 8 }}>
                <b>Thanh toán ({(detail?.payments || []).length})</b>
                {(detail?.payments || []).length === 0
                  ? <div className="muted">Chưa có giao dịch.</div>
                  : (detail.payments.map((p) => (
                    <div key={p.id} className="muted">{p.transaction_code || `#${p.id}`} — {formatVND(p.amount)} — {viStatus(p.status)}</div>
                  )))}
              </div>
              <div className="details-card" style={{ marginTop: 8 }}>
                <b>Hoàn tiền ({(detail?.refunds || []).length})</b>
                {(detail?.refunds || []).length === 0
                  ? <div className="muted">Chưa có yêu cầu hoàn tiền.</div>
                  : (detail.refunds.map((r) => (
                    <div key={r.id} className="muted">{r.refund_code} — {formatVND(r.amount)} — {viStatus(r.status)}</div>
                  )))}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn secondary sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
