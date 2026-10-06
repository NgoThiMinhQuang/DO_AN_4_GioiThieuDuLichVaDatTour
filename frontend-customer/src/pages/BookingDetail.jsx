import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND } from '../components/ui.jsx';

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
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function doCancel() {
    if (!confirm('Xác nhận hủy booking?')) return;
    try {
      const res = await api.post(`/bookings/${id}/cancel`);
      setMsg(res.data.message);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  async function doReview() {
    try {
      await api.post(`/bookings/${id}/reviews`, { rating: Number(review.rating), content: review.content });
      setMsg('Đánh giá thành công');
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  if (error) return <div className="container"><ErrorBox error={error} /></div>;
  if (!b) return <div className="container"><p>Đang tải...</p></div>;

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Chi tiết booking</span>
        <h2>Booking {b.booking_code}</h2>
        <div><span className="badge">{b.booking_status}</span> <span className="badge">{b.payment_status}</span></div>
      </div>
      {msg && <div className="alert info">{msg}</div>}
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Thông tin chuyến đi</h3>
          <div className="form">
            <div><b>Tour:</b> {b.tour_name}</div>
            <div><b>Khởi hành:</b> {b.departure_date ? new Date(b.departure_date).toLocaleDateString('vi-VN') : ''} — về {b.return_date ? new Date(b.return_date).toLocaleDateString('vi-VN') : ''}</div>
            <div><b>Liên hệ:</b> {b.contact_name} • {b.contact_phone} • {b.contact_email}</div>
            <div><b>Giá snapshot NL/TE/EB:</b> {formatVND(b.adult_price)} / {formatVND(b.child_price)} / {formatVND(b.infant_price)}</div>
            <div><b>Tạm tính:</b> {formatVND(b.subtotal)} • <b>Giảm:</b> {formatVND(b.discount_amount)} • <b>Tổng:</b> <span className="price">{formatVND(b.total_amount)}</span></div>
            <div><b>Đã trả:</b> {formatVND(b.paid_amount)} • <b>Còn lại:</b> <span className="price">{formatVND(b.remaining_amount)}</span></div>
          </div>
        </div>
        <div className="panel">
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
            <button className="btn" onClick={doPay}>Thanh toán</button>
            <button className="btn danger" onClick={doCancel}>Hủy booking</button>
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
      <h3>Hành khách</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Họ tên</th><th>Loại</th><th>Ngày sinh</th></tr></thead>
        <tbody>{(b.passengers || []).map((p) => <tr key={p.id}><td>{p.full_name}</td><td><span className="badge">{p.passenger_type}</span></td><td>{p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : ''}</td></tr>)}</tbody>
      </table></div>
      <h3>Lịch sử thanh toán</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã GD</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th></tr></thead>
        <tbody>{(b.payments || []).map((p) => <tr key={p.id}><td>{p.transaction_code}</td><td>{formatVND(p.amount)}</td><td>{p.payment_method}</td><td><span className="badge">{p.status}</span></td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
