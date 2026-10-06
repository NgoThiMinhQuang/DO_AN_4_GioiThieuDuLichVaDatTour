import { useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminTours from './pages/admin/AdminTours.jsx';
import AdminDepartures from './pages/admin/AdminDepartures.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminRefunds from './pages/admin/AdminRefunds.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

function RequireAdmin({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
}

const MENU = [
  { to: '/', end: true, icon: '▦', label: 'Dashboard' },
  { to: '/tours', icon: '✈', label: 'Tours' },
  { to: '/departures', icon: '🛫', label: 'Departures' },
  { to: '/bookings', icon: '🧾', label: 'Bookings' },
  { to: '/payments', icon: '💳', label: 'Payments' },
  { to: '/refunds', icon: '↩', label: 'Refunds' },
  { to: '/promotions', icon: '🏷', label: 'Promotions' },
  { to: '/reviews', icon: '★', label: 'Reviews' },
  { to: '/users', icon: '👥', label: 'Users' },
];

const TITLES = {
  '/': ['Tổng quan', 'Dashboard · báo cáo doanh thu, top tour'],
  '/tours': ['Quản lý Tours', 'Tạo nhanh & đổi trạng thái tour'],
  '/departures': ['Quản lý Departures', 'Lịch khởi hành theo tour'],
  '/bookings': ['Quản lý Bookings', 'Tra cứu & cập nhật trạng thái đặt tour'],
  '/payments': ['Payments & Refunds', 'Xác minh giao dịch thanh toán'],
  '/refunds': ['Quản lý Hoàn tiền', 'Tạo & duyệt yêu cầu hoàn tiền'],
  '/promotions': ['Quản lý Promotions', 'Mã giảm giá & bật/tắt chương trình'],
  '/reviews': ['Quản lý Reviews', 'Ẩn / hiện đánh giá của khách'],
  '/users': ['Quản lý Users', 'Khóa / mở tài khoản người dùng'],
};

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [title, sub] = TITLES[pathname] || ['TravelViet Admin', 'Trang quản trị'];
  const initial = (user?.full_name || user?.email || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className={`tv-shell${open ? ' side-open' : ''}`}>
      {open && <div className="tv-scrim" onClick={() => setOpen(false)} />}
      <aside className="tv-side">
        <div className="tv-brand">
          <span className="tv-brand-mark">T</span>
          <div><b>TravelViet Admin</b><small>Quản trị tour</small></div>
        </div>
        <div className="tv-menu-label">Menu chính</div>
        <nav className="tv-menu" onClick={() => setOpen(false)}>
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end}>
              <span className="tv-mi-ic">{m.icon}</span>{m.label}
            </NavLink>
          ))}
        </nav>
        <div className="tv-side-foot">
          <div className="muted">API: http://localhost:5000</div>
          <div className="muted">Demo: admin@gmail.com / Admin123!</div>
        </div>
      </aside>
      <div className="tv-body">
        <header className="tv-top">
          <div className="tv-top-inner">
            <button className="btn ghost sm tv-burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
            <div className="tv-page-crumb"><b>{title}</b>{sub}</div>
            <div className="header-spacer" />
            <span className="tv-user-chip"><span className="tv-avatar">{initial}</span>{user?.full_name || user?.email || ''}</span>
            <button
              className="btn secondary sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="tv-main">{children}</main>
        <footer className="tv-footer">
          <div className="tv-footer-inner">
            <span><b>TravelViet Admin</b> — Dashboard / báo cáo, tours, departures, bookings, payments, refunds, promotions, reviews, users.</span>
            <span>Demo: admin@gmail.com / Admin123!</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAdmin><AdminLayout><Dashboard /></AdminLayout></RequireAdmin>} />
      <Route path="/tours" element={<RequireAdmin><AdminLayout><AdminTours /></AdminLayout></RequireAdmin>} />
      <Route path="/departures" element={<RequireAdmin><AdminLayout><AdminDepartures /></AdminLayout></RequireAdmin>} />
      <Route path="/bookings" element={<RequireAdmin><AdminLayout><AdminBookings /></AdminLayout></RequireAdmin>} />
      <Route path="/payments" element={<RequireAdmin><AdminLayout><AdminPayments /></AdminLayout></RequireAdmin>} />
      <Route path="/refunds" element={<RequireAdmin><AdminLayout><AdminRefunds /></AdminLayout></RequireAdmin>} />
      <Route path="/promotions" element={<RequireAdmin><AdminLayout><AdminPromotions /></AdminLayout></RequireAdmin>} />
      <Route path="/reviews" element={<RequireAdmin><AdminLayout><AdminReviews /></AdminLayout></RequireAdmin>} />
      <Route path="/users" element={<RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>} />
      <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về Dashboard</Link></div>} />
    </Routes>
  );
}
