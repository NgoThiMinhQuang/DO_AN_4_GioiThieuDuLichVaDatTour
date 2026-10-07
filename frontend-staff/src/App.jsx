import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import api from './api/client.js';
import Login from './pages/Login.jsx';
import AdminDepartures from './pages/admin/AdminDepartures.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminRefunds from './pages/admin/AdminRefunds.jsx';
import AdminSupport from './pages/admin/AdminSupport.jsx';

// Tat ca trang nghiep vu (tru /login) yeu cau role STAFF (ADMIN duoc phep vi co toan quyen backend).
function RequireStaff({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== 'STAFF' && role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => (isActive ? 'active' : '');
  const displayName = user?.full_name || user?.email || 'Nhân viên';
  const initial = (displayName || 'N').trim().charAt(0).toUpperCase();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="TravelViet Nhân viên - Trang chủ">
          <img src="/images/logo.png" alt="TravelViet" className="logo-img" />
          <span className="logo-staff">Nhân viên</span>
        </Link>
        <nav className="nav">
          <NavLink to="/departures" className={linkClass}>Lịch khởi hành</NavLink>
          <NavLink to="/bookings" className={linkClass}>Đơn đặt tour</NavLink>
          <NavLink to="/payments" className={linkClass}>Thanh toán</NavLink>
          <NavLink to="/refunds" className={linkClass}>Hoàn tiền</NavLink>
          <NavLink to="/support" className={linkClass}>Hỗ trợ</NavLink>
        </nav>
        <div className="header-actions">
          {!user && <NavLink to="/login" className={linkClass}>Đăng nhập</NavLink>}
          {user && (
            <span className="user-chip" title={displayName}>
              <span className="user-chip-avatar">{initial}</span>
              <span className="user-chip-name">{displayName}</span>
            </span>
          )}
          {user && (
            <button
              className="btn secondary btn-sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Home() {
  const items = [
    { to: '/departures', icon: '🗓️', title: 'Lịch khởi hành', desc: 'Xem lịch khởi hành và số chỗ còn lại (chỉ đọc).' },
    { to: '/bookings', icon: '📋', title: 'Đơn đặt tour', desc: 'Tra cứu, lọc và xác nhận đơn đặt tour.' },
    { to: '/payments', icon: '💳', title: 'Thanh toán', desc: 'Xác nhận và ghi nhận thanh toán.' },
    { to: '/refunds', icon: '↩️', title: 'Hoàn tiền', desc: 'Xử lý hủy đơn và hoàn tiền.' },
    { to: '/support', icon: '💬', title: 'Hỗ trợ', desc: 'Tiếp nhận và phản hồi yêu cầu hỗ trợ.' },
  ];
  const [stats, setStats] = useState({ pendingBookings: null, openDepartures: null, pendingPayments: null, pendingRefunds: null, openSupport: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [b, d, p, r, s] = await Promise.all([
          api.get('/admin/bookings', { params: { limit: 100 } }).catch(() => ({ data: { data: [] } })),
          api.get('/admin/departures', { params: { limit: 200 } }).catch(() => ({ data: { data: [] } })),
          api.get('/admin/payments').catch(() => ({ data: { data: [] } })),
          api.get('/admin/refunds').catch(() => ({ data: { data: [] } })),
          api.get('/admin/support').catch(() => ({ data: { data: [] } })),
        ]);
        if (!alive) return;
        const bookings = b.data.data || [];
        const deps = d.data.data || [];
        const payments = p.data.data || [];
        const refunds = r.data.data || [];
        const tickets = s.data.data || [];
        setStats({
          pendingBookings: bookings.filter((x) => ['PENDING', 'DEPOSIT_PENDING'].includes(String(x.booking_status || '').toUpperCase())).length,
          openDepartures: deps.filter((x) => ['OPEN', 'ALMOST_FULL'].includes(String(x.status || '').toUpperCase())).length,
          pendingPayments: payments.filter((x) => !['SUCCESS', 'FAILED'].includes(String(x.status || '').toUpperCase())).length,
          pendingRefunds: refunds.filter((x) => ['PENDING', 'PROCESSING'].includes(String(x.status || '').toUpperCase())).length,
          openSupport: tickets.filter((x) => ['OPEN', 'IN_PROGRESS'].includes(String(x.status || '').toUpperCase())).length,
        });
      } catch (_) { /* giu nguyen null -> hien thi — */ }
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    { ic: '📋', cls: '', label: 'Đơn chờ xác nhận', value: stats.pendingBookings },
    { ic: '🗓️', cls: 'g2', label: 'Lịch đang mở', value: stats.openDepartures },
    { ic: '💳', cls: 'g3', label: 'Thanh toán chờ duyệt', value: stats.pendingPayments },
    { ic: '↩️', cls: 'g4', label: 'Hoàn tiền chờ xử lý', value: stats.pendingRefunds },
    { ic: '💬', cls: '', label: 'Hỗ trợ chờ xử lý', value: stats.openSupport },
  ];

  return (
    <div className="container">
      <div className="hero hero-staff">
        <h1>Xin chào nhân viên TravelViet</h1>
        <p>Tra cứu đơn đặt tour, xác nhận đơn, xác nhận thanh toán, theo dõi lịch khởi hành, xử lý hủy và hoàn tiền, hỗ trợ khách hàng.</p>
        <div className="hero-badges">
          <span>📋 Đơn đặt tour</span>
          <span>💳 Thanh toán</span>
          <span>↩️ Hoàn tiền</span>
          <span>🗓️ Lịch khởi hành</span>
          <span>💬 Hỗ trợ</span>
        </div>
      </div>
      <div className="stat-cards">
        {cards.map((c) => (
          <div className="stat" key={c.label}>
            <span className={`stat-ic ${c.cls}`}>{c.ic}</span>
            <div><span className="muted">{c.label}</span><b>{c.value === null || c.value === undefined ? '—' : c.value}</b><div className="stat-sub">Cập nhật theo dữ liệu hiện tại</div></div>
          </div>
        ))}
      </div>
      <div className="section">
        <h2>Công việc hôm nay</h2>
        <div className="section-sub">Chọn một nghiệp vụ để bắt đầu xử lý.</div>
        <div className="work-grid">
          {items.map((it) => (
            <Link className="work-card" key={it.to} to={it.to}>
              <div className="work-icon">{it.icon}</div>
              <div className="work-title">{it.title}</div>
              <div className="work-desc">{it.desc}</div>
              <div className="work-link">Mở ngay →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireStaff><Home /></RequireStaff>} />
          <Route path="/departures" element={<RequireStaff><div className="container" style={{ marginTop: 16 }}><AdminDepartures /></div></RequireStaff>} />
          <Route path="/bookings" element={<RequireStaff><div className="container" style={{ marginTop: 16 }}><AdminBookings /></div></RequireStaff>} />
          <Route path="/payments" element={<RequireStaff><div className="container" style={{ marginTop: 16 }}><AdminPayments /></div></RequireStaff>} />
          <Route path="/refunds" element={<RequireStaff><div className="container" style={{ marginTop: 16 }}><AdminRefunds /></div></RequireStaff>} />
          <Route path="/support" element={<RequireStaff><div className="container" style={{ marginTop: 16 }}><AdminSupport /></div></RequireStaff>} />
          <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang chủ</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <span className="footer-brand">TravelViet</span> — Kênh nghiệp vụ nhân viên (Đơn đặt tour → Thanh toán → Hoàn tiền, theo dõi lịch khởi hành).
          <div className="muted" style={{ color: '#94a3b8' }}>Hotline hỗ trợ: 1900 6868</div>
        </div>
      </footer>
    </>
  );
}
