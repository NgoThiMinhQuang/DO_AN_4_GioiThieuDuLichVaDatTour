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
        <div><h2>👋 Xin chào, quản trị viên!</h2><p>Tổng quan kinh doanh và hiệu suất tour hôm nay.</p></div>
      </div>
      <ErrorBox error={error} />
      {data && (
        <>
          <div className="stat-cards">
            <div className="stat"><span className="stat-ic">✈</span><div><span className="muted">Tổng số tour</span><b>{data.total_tours}</b><div className="stat-sub">Đang khai thác</div></div></div>
            <div className="stat"><span className="stat-ic g2">🧾</span><div><span className="muted">Tổng số đơn</span><b>{data.bookings?.total ?? 0}</b><div className="stat-sub">Chờ duyệt {data.bookings?.pending ?? 0} • Đã xác nhận {data.bookings?.confirmed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g3">👥</span><div><span className="muted">Tổng số khách</span><b>{data.total_customers}</b><div className="stat-sub">Đã hủy {data.bookings?.cancelled ?? 0} • Hoàn thành {data.bookings?.completed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g4">💰</span><div><span className="muted">Tổng doanh thu</span><b>{formatVND(data.total_revenue)}</b><div className="stat-sub">Đã hoàn {formatVND(data.total_refunded)}</div></div></div>
          </div>
        </>
      )}
      <div className="grid dash-2">
        <div className="tv-panel">
          <h3>📈 Biểu đồ doanh thu theo tháng <span className="muted">(ghi nhận lúc thanh toán)</span></h3>
          <div className="table-wrap" style={{ marginBottom: 0 }}><table>
            <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Số giao dịch</th></tr></thead>
            <tbody>
              {revenue.length === 0 && <tr><td colSpan={3}><div className="tv-empty">Chưa có dữ liệu doanh thu.</div></td></tr>}
              {revenue.map((r, i) => <tr key={i}><td><b>{r.period}</b></td><td style={{ color: '#1d4ed8', fontWeight: 600 }}>{formatVND(r.revenue)}</td><td>{r.transactions}</td></tr>)}
            </tbody>
          </table></div>
        </div>
        <div className="tv-panel">
          <h3>🔥 Tour nổi bật <span className="muted">(tỉ lệ lấp đầy)</span></h3>
          <div className="table-wrap" style={{ marginBottom: 0 }}><table>
            <thead><tr><th>Tên tour</th><th>Số khách</th><th>Tỉ lệ lấp đầy</th></tr></thead>
            <tbody>
              {upcoming.length === 0 && <tr><td colSpan={3}><div className="tv-empty">Chưa có dữ liệu tour nổi bật.</div></td></tr>}
              {upcoming.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.name}</b><div className="muted">{t.bookings} đơn đặt • {formatVND(t.revenue)}</div></td>
                  <td>{t.guests}</td>
                  <td><StatusBadge value={`${t.fill_rate}%`} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
      <div className="tv-panel">
        <h3>🏆 Chi tiết tour nổi bật (tỉ lệ lấp đầy)</h3>
        <div className="table-wrap" style={{ marginBottom: 0 }}><table>
          <thead><tr><th>Tên tour</th><th>Số đơn đặt</th><th>Số khách</th><th>Doanh thu</th><th>Tỉ lệ lấp đầy</th></tr></thead>
          <tbody>
            {topTours.length === 0 && <tr><td colSpan={5}><div className="tv-empty">Chưa có dữ liệu.</div></td></tr>}
            {topTours.map((t) => <tr key={t.id}><td><b>{t.name}</b></td><td>{t.bookings}</td><td>{t.guests}</td><td style={{ fontWeight: 500 }}>{formatVND(t.revenue)}</td><td>{t.fill_rate}%</td></tr>)}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
