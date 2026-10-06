import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND } from '../components/ui.jsx';

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
      <h2>Booking của tôi</h2>
      <ErrorBox error={error} />
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Tour</th><th>Khởi hành</th><th>Khách</th><th>Tổng</th><th>Booking</th><th>Thanh toán</th><th></th></tr></thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{b.booking_code}</td>
              <td>{b.tour_name}</td>
              <td>{b.departure_date ? new Date(b.departure_date).toLocaleDateString('vi-VN') : ''}</td>
              <td>{b.adult_count}+{b.child_count}+{b.infant_count}</td>
              <td>{formatVND(b.total_amount)}</td>
              <td><span className="badge">{b.booking_status}</span></td>
              <td><span className="badge">{b.payment_status}</span></td>
              <td><Link to={`/my-bookings/${b.id}`}>Chi tiết</Link></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
