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
  const maxRevenue = revenue.reduce((m, r) => Math.max(m, Number(r.revenue) || 0), 0);
  const totalTx = revenue.reduce((s, r) => s + (Number(r.transactions) || 0), 0);

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>👋 Xin chào, quản trị viên!</h2><p>Tổng quan kinh doanh và hiệu suất tour hôm nay.</p></div>
        <div className="page-actions">
          <span className="badge b-blue">{totalTx} giao dịch trong kỳ</span>
        </div>
      </div>
      <ErrorBox error={error} />
      {data && (
        <>
          <div className="stat-cards">
            <div className="stat"><span className="stat-ic">✈</span><div><span className="muted">Tổng số tour</span><b>{data.total_tours}</b><div className="stat-sub">Đang khai thác</div></div></div>
            <div className="stat"><span className="stat-ic g2">🧾</span><div><span className="muted">Tổng số đơn</span><b>{data.bookings?.total ?? 0}</b><div className="stat-sub">Chờ duyệt {data.bookings?.pending ?? 0} • Đã xác nhận {data.bookings?.confirmed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g3">👥</span><div><span className="muted">Tổng số khách</span><b>{data.total_customers}</b><div className="stat-sub">Đã hủy {data.bookings?.cancelled ?? 0} • Hoàn thành {data.bookings?.completed ?? 0}</div></div></div>
            <div className="stat"><span className="stat-ic g4">💰</span><div><span className="muted">Tổng doanh thu</span><b>{formatVND(data.total_revenue)}</b><div className="stat-sub">Đã hoàn {formatVND(data.total_refunded)}</div></div></div>
            <div className="stat"><span className="stat-ic g5">⏳</span><div><span className="muted">Đơn chờ duyệt</span><b>{data.bookings?.pending ?? 0}</b><div className="stat-sub">Cần xử lý sớm</div></div></div>
            <div className="stat"><span className="stat-ic g6">✅</span><div><span className="muted">Đơn hoàn thành</span><b>{data.bookings?.completed ?? 0}</b><div className="stat-sub">Tỉ lệ thành công cao</div></div></div>
          </div>
        </>
      )}
      <div className="grid dash-2">
        <div className="tv-panel">
          <h3>📈 Biểu đồ doanh thu theo tháng <span className="muted">(ghi nhận lúc thanh toán)</span></h3>
          {revenue.length === 0
            ? <div className="tv-empty">Chưa có dữ liệu doanh thu.</div>
            : (
              <div className="tv-bars">
                {revenue.map((r, i) => {
                  const pct = maxRevenue > 0 ? Math.max(4, Math.round((Number(r.revenue) / maxRevenue) * 100)) : 0;
                  return (
                    <div className="tv-bar-row" key={i}>
                      <span className="tv-bar-label">{r.period}</span>
                      <div className="tv-bar-track"><div className="tv-bar-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="tv-bar-value">{formatVND(r.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          <div className="table-wrap" style={{ marginBottom: 0, marginTop: 14 }}><table>
            <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Số giao dịch</th></tr></thead>
            <tbody>
              {revenue.length === 0 && <tr><td colSpan={3}><div className="tv-empty">Chưa có dữ liệu doanh thu.</div></td></tr>}
              {revenue.map((r, i) => <tr key={i}><td><b>{r.period}</b></td><td style={{ color: '#1d4ed8', fontWeight: 700 }}>{formatVND(r.revenue)}</td><td>{r.transactions}</td></tr>)}
            </tbody>
          </table></div>
        </div>
        <div className="tv-panel">
          <h3>🔥 Tour nổi bật <span className="muted">(tỉ lệ lấp đầy)</span></h3>
          {upcoming.length === 0
            ? <div className="tv-empty">Chưa có dữ liệu tour nổi bật.</div>
            : (
              <div className="tv-top-list">
                {upcoming.map((t, idx) => (
                  <div className="tv-top-item" key={t.id}>
                    <span className="tv-rank-num">{idx + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                      <div className="muted">{t.bookings} đơn đặt • {t.guests} khách • {formatVND(t.revenue)}</div>
                      <div className="tv-progress"><i style={{ width: `${Math.min(100, Number(t.fill_rate) || 0)}%` }} /></div>
                    </div>
                    <StatusBadge value={`${t.fill_rate}%`} />
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
      <div className="grid dash-2">
        <div className="tv-panel">
          <h3>🛫 Lịch khởi hành sắp tới <span className="muted">(tour có nhu cầu cao)</span></h3>
          <div className="details-card">
            {upcoming.length === 0
              ? <span className="muted">Chưa có lịch khởi hành nào sắp tới.</span>
              : upcoming.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <b style={{ color: '#0f172a' }}>{t.name}</b>
                  <span className="muted">{t.guests} khách • Lấp đầy {t.fill_rate}%</span>
                </div>
              ))}
          </div>
        </div>
        <div className="tv-panel">
          <h3>🏆 Chi tiết tour nổi bật (tỉ lệ lấp đầy)</h3>
          <div className="table-wrap" style={{ marginBottom: 0 }}><table>
            <thead><tr><th>Tên tour</th><th>Số đơn đặt</th><th>Số khách</th><th>Doanh thu</th><th>Tỉ lệ lấp đầy</th></tr></thead>
            <tbody>
              {topTours.length === 0 && <tr><td colSpan={5}><div className="tv-empty">Chưa có dữ liệu.</div></td></tr>}
              {topTours.map((t) => <tr key={t.id}><td><b>{t.name}</b></td><td>{t.bookings}</td><td>{t.guests}</td><td style={{ fontWeight: 700 }}>{formatVND(t.revenue)}</td><td>{t.fill_rate}%</td></tr>)}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
