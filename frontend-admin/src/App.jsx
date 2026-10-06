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
import AdminSupport from './pages/admin/AdminSupport.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

function RequireAdmin({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/login" replace />;
  return children;
}

const MENU = [
  { to: '/', end: true, icon: '▦', label: 'Tổng quan' },
  { to: '/tours', icon: '✈', label: 'Quản lý tour' },
  { to: '/departures', icon: '🛫', label: 'Lịch khởi hành' },
  { to: '/bookings', icon: '🧾', label: 'Đơn đặt tour' },
  { to: '/payments', icon: '💳', label: 'Thanh toán' },
  { to: '/refunds', icon: '↩', label: 'Hoàn tiền' },
  { to: '/promotions', icon: '🏷', label: 'Khuyến mãi' },
  { to: '/reviews', icon: '★', label: 'Đánh giá' },
  { to: '/support', icon: '💬', label: 'Hỗ trợ' },
  { to: '/users', icon: '👥', label: 'Người dùng' },
];

const TITLES = {
  '/': ['Tổng quan', 'Báo cáo doanh thu và tour nổi bật'],
  '/tours': ['Quản lý tour', 'Thêm mới và đổi trạng thái tour'],
  '/departures': ['Lịch khởi hành', 'Lịch khởi hành theo từng tour'],
  '/bookings': ['Đơn đặt tour', 'Tra cứu và cập nhật trạng thái đơn đặt tour'],
  '/payments': ['Thanh toán', 'Xác minh giao dịch thanh toán'],
  '/refunds': ['Hoàn tiền', 'Tạo và duyệt yêu cầu hoàn tiền'],
  '/promotions': ['Khuyến mãi', 'Mã giảm giá và bật/tắt chương trình'],
  '/reviews': ['Đánh giá', 'Ẩn / hiện đánh giá của khách hàng'],
  '/support': ['Hỗ trợ', 'Tiếp nhận, gán người xử lý và phản hồi yêu cầu hỗ trợ'],
  '/admin/support': ['Hỗ trợ', 'Tiếp nhận, gán người xử lý và phản hồi yêu cầu hỗ trợ'],
  '/users': ['Người dùng', 'Khóa / mở khóa tài khoản người dùng'],
};

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [title, sub] = TITLES[pathname] || ['TravelViet', 'Trang quản trị'];
  const initial = (user?.full_name || user?.email || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className={`tv-shell${open ? ' side-open' : ''}`}>
      {open && <div className="tv-scrim" onClick={() => setOpen(false)} />}
      <aside className="tv-side">
        <div className="tv-brand">
          <img className="tv-brand-logo" src="/images/logo.png" alt="Logo TravelViet" />
          <div><b>TravelViet</b><small>Quản trị tour</small></div>
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
          <div className="muted">Tài khoản demo:</div>
          <div className="muted">admin@gmail.com / Admin123!</div>
        </div>
      </aside>
      <div className="tv-body">
        <header className="tv-top">
          <div className="tv-top-inner">
            <button className="btn ghost sm tv-burger" onClick={() => setOpen(!open)} aria-label="Mở menu">☰</button>
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
            <span><b>TravelViet</b> — Tổng quan, quản lý tour, lịch khởi hành, đơn đặt tour, thanh toán, hoàn tiền, khuyến mãi, đánh giá, người dùng.</span>
            <span>Tài khoản demo: admin@gmail.com / Admin123!</span>
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
      <Route path="/support" element={<RequireAdmin><AdminLayout><AdminSupport /></AdminLayout></RequireAdmin>} />
      <Route path="/admin/support" element={<RequireAdmin><AdminLayout><AdminSupport /></AdminLayout></RequireAdmin>} />
      <Route path="/users" element={<RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>} />
      <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang tổng quan</Link></div>} />
    </Routes>
  );
}
