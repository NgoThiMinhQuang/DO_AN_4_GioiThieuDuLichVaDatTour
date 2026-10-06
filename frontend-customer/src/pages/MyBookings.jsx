import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND, bookingStatusVi, paymentStatusVi, formatDateVi } from '../components/ui.jsx';

function statusClass(s) {
  const v = String(s || '').toUpperCase();
  if (['CONFIRMED', 'COMPLETED', 'PAID', 'SUCCESS'].includes(v)) return 'badge green';
  if (['PENDING', 'DEPOSIT_PENDING', 'PARTIAL', 'PARTIALLY_PAID', 'PENDING_PAYMENT', 'DEPOSITED'].includes(v)) return 'badge amber';
  if (['CANCELLED', 'FAILED', 'EXPIRED'].includes(v)) return 'badge red';
  return 'badge';
}

export default function MyBookings() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/my');
        setRows(res.data.data || []);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);
  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Lịch sử đặt tour</span>
        <h2>Đặt tour của tôi ({rows.length})</h2>
        <p>Theo dõi trạng thái đặt tour và thanh toán của bạn.</p>
      </div>
      <ErrorBox error={error} />
      {rows.length === 0 && !error && (
        <div className="tv-empty">
          <div className="tv-empty-icon">🧳</div>
          <b>Chưa có chuyến nào được đặt</b>
          <p>Khám phá hàng trăm tour khởi hành mỗi tuần và giữ chỗ chỉ trong 5 phút.</p>
          <Link className="btn" to="/tours">Đặt tour ngay →</Link>
        </div>
      )}
      {rows.length > 0 && (
        <>
          <div className="tv-booking-cards">
            {rows.map((b) => (
              <div className="tv-booking-card" key={b.id}>
                <div className="tv-notif-icon">🧾</div>
                <div className="tv-booking-card-main">
                  <div><b>{b.booking_code}</b> — {b.tour_name}</div>
                  <div className="muted">Khởi hành: {b.departure_date ? formatDateVi(b.departure_date) : '—'} • Khách: {b.adult_count}+{b.child_count}+{b.infant_count} • <span className="price">{formatVND(b.total_amount)}</span></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    <span className={statusClass(b.booking_status)}>{bookingStatusVi(b.booking_status)}</span>
                    <span className={statusClass(b.payment_status)}>{paymentStatusVi(b.payment_status)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn btn-sm" to={`/my-bookings/${b.id}`}>Chi tiết</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="table-wrap" style={{ marginTop: 16 }}><table>
            <thead><tr><th>Mã</th><th>Tour</th><th>Khởi hành</th><th>Khách</th><th>Tổng</th><th>Đặt tour</th><th>Thanh toán</th><th></th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td><b>{b.booking_code}</b></td>
                  <td>{b.tour_name}</td>
                  <td>{b.departure_date ? formatDateVi(b.departure_date) : ''}</td>
                  <td>{b.adult_count}+{b.child_count}+{b.infant_count}</td>
                  <td><span className="price">{formatVND(b.total_amount)}</span></td>
                  <td><span className={statusClass(b.booking_status)}>{bookingStatusVi(b.booking_status)}</span></td>
                  <td><span className={statusClass(b.payment_status)}>{paymentStatusVi(b.payment_status)}</span></td>
                  <td><Link to={`/my-bookings/${b.id}`}>Chi tiết</Link></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </div>
  );
}
