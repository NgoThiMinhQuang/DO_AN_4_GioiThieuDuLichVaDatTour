import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
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

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo">VietTour - Admin</Link>
          <div className="header-spacer" />
          <nav className="nav">
            <span className="muted">{user?.full_name || user?.email || ''}</span>
            <button
              className="btn secondary"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <div className="container admin-layout">
        <aside className="admin-side">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/tours">Tours</NavLink>
          <NavLink to="/departures">Departures</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
          <NavLink to="/payments">Payments</NavLink>
          <NavLink to="/refunds">Refunds</NavLink>
          <NavLink to="/promotions">Promotions</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
          <NavLink to="/users">Users</NavLink>
        </aside>
        <div className="admin-main">{children}</div>
      </div>
      <footer className="site-footer">
        <div className="container">
          <b>VietTour - Admin</b> — Dashboard / báo cáo, tours, departures, bookings, payments, refunds, promotions, reviews, users.
          <div className="muted" style={{ color: '#a7f3d0' }}>Demo: admin@gmail.com / Admin123! — API: http://localhost:5000</div>
        </div>
      </footer>
    </>
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
