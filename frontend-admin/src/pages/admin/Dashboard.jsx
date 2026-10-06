import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, formatVND } from '../../components/ui.jsx';

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

  const upcoming = topTours.slice(0, 5);

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>👋 Xin chào, Admin!</h2><p>Tổng quan kinh doanh & hiệu suất tour hôm nay.</p></div>
      </div>
      <ErrorBox error={error} />
      {data && (
        <>
          <div className="stat-cards">
            <div className="stat"><span className="stat-ic">✈</span><div><span className="muted">Tổng tour</span><b>{data.total_tours}</b><div className="stat-sub">Đang khai thác</div></div></div>
            <div className="stat"><span className="stat-ic g2">🧾</span><div><span className="muted">Booking</span><b>{data.bookings?.total ?? 0}</b><div className="stat-sub">Chờ {data.bookings?.pending ?? 0} • XN {data.bookings?.confirmed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g3">👥</span><div><span className="muted">Khách hàng</span><b>{data.total_customers}</b><div className="stat-sub">Hủy {data.bookings?.cancelled ?? 0} • HT {data.bookings?.completed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g4">💰</span><div><span className="muted">Doanh thu</span><b>{formatVND(data.total_revenue)}</b><div className="stat-sub">Hoàn {formatVND(data.total_refunded)}</div></div></div>
          </div>
        </>
      )}
      <div className="grid dash-2">
        <div className="tv-panel">
          <h3>📈 Doanh thu theo tháng <span className="muted">(ghi nhận lúc thanh toán)</span></h3>
          <div className="table-wrap" style={{ marginBottom: 0 }}><table>
            <thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Giao dịch</th></tr></thead>
            <tbody>
              {revenue.length === 0 && <tr><td colSpan={3}><div className="tv-empty">Chưa có dữ liệu doanh thu.</div></td></tr>}
              {revenue.map((r, i) => <tr key={i}><td><b>{r.period}</b></td><td style={{ color: '#1d4ed8', fontWeight: 800 }}>{formatVND(r.revenue)}</td><td>{r.transactions}</td></tr>)}
            </tbody>
          </table></div>
        </div>
        <div className="tv-panel">
          <h3>🔥 Top tour nổi bật <span className="muted">(fill-rate)</span></h3>
          <div className="table-wrap" style={{ marginBottom: 0 }}><table>
            <thead><tr><th>Tour</th><th>Khách</th><th>Fill-rate</th></tr></thead>
            <tbody>
              {upcoming.length === 0 && <tr><td colSpan={3}><div className="tv-empty">Chưa có dữ liệu top tour.</div></td></tr>}
              {upcoming.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.name}</b><div className="muted">{t.bookings} bookings • {formatVND(t.revenue)}</div></td>
                  <td>{t.guests}</td>
                  <td><StatusBadge value={`${t.fill_rate}%`} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
      <div className="tv-panel">
        <h3>🏆 Chi tiết top tour (fill-rate)</h3>
        <div className="table-wrap" style={{ marginBottom: 0 }}><table>
          <thead><tr><th>Tour</th><th>Bookings</th><th>Khách</th><th>Doanh thu</th><th>Fill-rate</th></tr></thead>
          <tbody>
            {topTours.length === 0 && <tr><td colSpan={5}><div className="tv-empty">Chưa có dữ liệu.</div></td></tr>}
            {topTours.map((t) => <tr key={t.id}><td><b>{t.name}</b></td><td>{t.bookings}</td><td>{t.guests}</td><td style={{ fontWeight: 700 }}>{formatVND(t.revenue)}</td><td>{t.fill_rate}%</td></tr>)}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
