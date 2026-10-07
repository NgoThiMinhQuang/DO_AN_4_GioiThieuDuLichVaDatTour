import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { LoadError, formatVND, bookingStatusVi, paymentStatusVi, paymentMethodVi, passengerTypeVi, formatDateVi, friendlyError } from '../components/ui.jsx';

function badgeClass(s) {
  const v = String(s || '').toUpperCase();
  if (['CONFIRMED', 'COMPLETED', 'PAID', 'SUCCESS', 'DEPOSITED'].includes(v)) return 'badge green';
  if (['PENDING', 'DEPOSIT_PENDING', 'PARTIAL', 'PARTIALLY_PAID', 'PENDING_PAYMENT'].includes(v)) return 'badge amber';
  if (['CANCELLED', 'FAILED', 'EXPIRED'].includes(v)) return 'badge red';
  return 'badge';
}

export default function BookingDetail() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [pay, setPay] = useState({ amount: '', method: 'BANK_TRANSFER' });
  const [review, setReview] = useState({ rating: 5, content: '' });

  async function load() {
    setError('');
    try {
      const res = await api.get(`/bookings/${id}`);
      setB(res.data);
      setPay((p) => ({ ...p, amount: res.data.remaining_amount || '' }));
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); // eslint-disable-next-line
  }, [id]);

  async function doPay() {
    setMsg('');
    try {
      await api.post('/payments', { bookingId: Number(id), amount: Number(pay.amount), method: pay.method });
      setMsg('Thanh toán thành công');
      load();
    } catch (e) { setMsg(friendlyError(e)); }
  }

  async function doCancel() {
    if (!confirm('Xác nhận hủy đặt tour?')) return;
    try {
      const res = await api.post(`/bookings/${id}/cancel`);
      setMsg(res.data.message);
      load();
    } catch (e) { setMsg(friendlyError(e)); }
  }

  async function doReview() {
    try {
      await api.post(`/bookings/${id}/reviews`, { rating: Number(review.rating), content: review.content });
      setMsg('Đánh giá thành công');
      load();
    } catch (e) { setMsg(friendlyError(e)); }
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <LoadError error={error} icon="🧾" title="Không tải được chi tiết đặt tour" onRetry={() => window.location.reload()}>
          <Link className="btn secondary" to="/my-bookings">Về danh sách đặt tour</Link>
        </LoadError>
      </div>
    );
  }
  if (!b) return <div className="container"><p>Đang tải...</p></div>;
  const canPay = Number(b.remaining_amount) > 0 && !['CANCELLED', 'EXPIRED'].includes(String(b.booking_status).toUpperCase());
  const canCancel = !['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(String(b.booking_status).toUpperCase());

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Chi tiết đặt tour</span>
        <h2>Đặt tour {b.booking_code}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className={badgeClass(b.booking_status)}>{bookingStatusVi(b.booking_status)}</span>
          <span className={badgeClass(b.payment_status)}>{paymentStatusVi(b.payment_status)}</span>
        </div>
        <p className="muted" style={{ marginTop: 8 }}><Link to="/my-bookings">← Về danh sách đặt tour</Link></p>
      </div>
      {msg && <div className="alert info">{msg}</div>}
      <div className="grid cols-2 tv-detail-grid" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Thông tin chuyến đi</h3>
            <div className="form">
              <div><b>Tour:</b> {b.tour_name}</div>
              <div><b>Khởi hành:</b> {b.departure_date ? formatDateVi(b.departure_date) : ''} — về {b.return_date ? formatDateVi(b.return_date) : ''}</div>
              <div><b>Liên hệ:</b> {b.contact_name} • {b.contact_phone} • {b.contact_email}</div>
              <div><b>Giá tại thời điểm đặt (người lớn / trẻ em / em bé):</b> {formatVND(b.adult_price)} / {formatVND(b.child_price)} / {formatVND(b.infant_price)}</div>
              <div><b>Tạm tính:</b> {formatVND(b.subtotal)} • <b>Giảm:</b> {formatVND(b.discount_amount)} • <b>Tổng:</b> <span className="price">{formatVND(b.total_amount)}</span></div>
              <div><b>Đã trả:</b> {formatVND(b.paid_amount)} • <b>Còn lại:</b> <span className="price">{formatVND(b.remaining_amount)}</span></div>
            </div>
          </div>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Hành khách ({(b.passengers || []).length})</h3>
            <div className="table-wrap"><table>
              <thead><tr><th>Họ tên</th><th>Loại</th><th>Ngày sinh</th></tr></thead>
              <tbody>{(b.passengers || []).map((p) => <tr key={p.id}><td>{p.full_name}</td><td><span className="badge">{passengerTypeVi(p.passenger_type)}</span></td><td>{p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : ''}</td></tr>)}</tbody>
            </table></div>
          </div>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Lịch sử thanh toán</h3>
            {(b.payments || []).length === 0 && <div className="muted">Chưa có giao dịch nào.</div>}
            {(b.payments || []).length > 0 && (
              <div className="tv-pay-timeline">
                {(b.payments || []).map((p) => (
                  <div className="tv-pay-item" key={p.id}>
                    <div><b>{formatVND(p.amount)}</b> • {paymentMethodVi(p.payment_method)} • <span className={badgeClass(p.status)}>{paymentStatusVi(p.status)}</span></div>
                    <div className="muted">{p.transaction_code} {p.paid_at ? `• ${formatDateVi(p.paid_at)}` : ''}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="table-wrap" style={{ marginTop: 12 }}><table>
              <thead><tr><th>Mã giao dịch</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th></tr></thead>
              <tbody>{(b.payments || []).map((p) => <tr key={p.id}><td>{p.transaction_code}</td><td>{formatVND(p.amount)}</td><td>{paymentMethodVi(p.payment_method)}</td><td><span className={badgeClass(p.status)}>{paymentStatusVi(p.status)}</span></td></tr>)}</tbody>
            </table></div>
          </div>
        </div>
        <div className="panel tv-sticky">
          <h3 style={{ marginTop: 0 }}>Thanh toán thêm</h3>
          <div className="form-row">
            <input type="number" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} placeholder="Số tiền" />
            <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CASH">Tiền mặt</option>
              <option value="VNPAY">VNPay</option>
              <option value="MOMO">MoMo</option>
            </select>
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <button className="btn" onClick={doPay} disabled={!canPay}>Thanh toán</button>
            <button className="btn danger" onClick={doCancel} disabled={!canCancel}>Hủy đặt tour</button>
          </div>
          <h3>Đánh giá (khi hoàn thành)</h3>
          <div className="form-row">
            <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} sao</option>)}
            </select>
            <input value={review.content} onChange={(e) => setReview({ ...review, content: e.target.value })} placeholder="Nội dung" />
          </div>
          <div style={{ marginTop: 8 }}><button className="btn secondary" onClick={doReview}>Gửi đánh giá</button></div>
        </div>
      </div>
    </div>
  );
}
