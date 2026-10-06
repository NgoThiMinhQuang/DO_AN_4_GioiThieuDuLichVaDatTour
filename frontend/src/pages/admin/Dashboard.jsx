import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, formatVND } from '../../components/ui.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topTours, setTopTours] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [d, r, t] = await Promise.all([
          api.get('/admin/reports/dashboard'),
          api.get('/admin/reports/revenue', { params: { by: 'month' } }),
          api.get('/admin/reports/tours')
        ]);
        setData(d.data);
        setRevenue(r.data.data || []);
        setTopTours(t.data.data || []);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <ErrorBox error={error} />
      {data && (
        <>
          <div className="stat-cards">
            <div className="stat"><span className="muted">Tổng tour</span><b>{data.total_tours}</b></div>
            <div className="stat"><span className="muted">Booking</span><b>{data.bookings?.total ?? 0}</b></div>
            <div className="stat"><span className="muted">Khách hàng</span><b>{data.total_customers}</b></div>
            <div className="stat"><span className="muted">Doanh thu</span><b>{formatVND(data.total_revenue)}</b></div>
          </div>
          <div className="muted">Chờ: {data.bookings?.pending} • Xác nhận: {data.bookings?.confirmed} • Hủy: {data.bookings?.cancelled} • Hoàn thành: {data.bookings?.completed} • Hoàn tiền: {formatVND(data.total_refunded)}</div>
        </>
      )}
      <h3>Doanh thu theo tháng (ghi nhận lúc thanh toán)</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Giao dịch</th></tr></thead>
        <tbody>{revenue.map((r, i) => <tr key={i}><td>{r.period}</td><td>{formatVND(r.revenue)}</td><td>{r.transactions}</td></tr>)}</tbody>
      </table></div>
      <h3>Top tour (fill-rate)</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Tour</th><th>Bookings</th><th>Khách</th><th>Doanh thu</th><th>Fill-rate</th></tr></thead>
        <tbody>{topTours.map((t) => <tr key={t.id}><td>{t.name}</td><td>{t.bookings}</td><td>{t.guests}</td><td>{formatVND(t.revenue)}</td><td>{t.fill_rate}%</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
