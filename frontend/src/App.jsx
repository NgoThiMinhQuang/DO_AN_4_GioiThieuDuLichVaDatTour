import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Tours from './pages/Tours.jsx';
import TourDetail from './pages/TourDetail.jsx';
import Destinations from './pages/Destinations.jsx';
import DestinationDetail from './pages/DestinationDetail.jsx';
import Articles from './pages/Articles.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';
import BookingDetail from './pages/BookingDetail.jsx';
import Favorites from './pages/Favorites.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminTours from './pages/admin/AdminTours.jsx';
import AdminDepartures from './pages/admin/AdminDepartures.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ children, roles }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = role === 'STAFF' || role === 'ADMIN';
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">VietTour</Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tours">Tours</NavLink>
          <NavLink to="/destinations">Điểm đến</NavLink>
          <NavLink to="/articles">Bài viết</NavLink>
          {user && <NavLink to="/favorites">Yêu thích</NavLink>}
          {user && <NavLink to="/my-bookings">Booking của tôi</NavLink>}
          {user && <NavLink to="/notifications">Thông báo</NavLink>}
          {isStaff && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="header-spacer" />
        <nav className="nav">
          {!user && <NavLink to="/login">Đăng nhập</NavLink>}
          {user && <NavLink to="/profile">{user.full_name || user.email || 'Profile'}</NavLink>}
          {user && (
            <button
              className="btn secondary"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Đăng xuất{role ? ` (${role})` : ''}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="container admin-layout">
      <aside className="admin-side">
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/tours">Tours</NavLink>
        <NavLink to="/admin/departures">Departures</NavLink>
        <NavLink to="/admin/bookings">Bookings</NavLink>
        <NavLink to="/admin/payments">Payments</NavLink>
        <NavLink to="/admin/promotions">Promotions</NavLink>
        <NavLink to="/admin/reviews">Reviews</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/booking/:departureId?" element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/my-bookings/:id" element={<RequireAuth><BookingDetail /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

          <Route path="/admin" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><Dashboard /></AdminLayout></RequireRole>} />
          <Route path="/admin/tours" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminTours /></AdminLayout></RequireRole>} />
          <Route path="/admin/departures" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminDepartures /></AdminLayout></RequireRole>} />
          <Route path="/admin/bookings" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminBookings /></AdminLayout></RequireRole>} />
          <Route path="/admin/payments" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminPayments /></AdminLayout></RequireRole>} />
          <Route path="/admin/promotions" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminPromotions /></AdminLayout></RequireRole>} />
          <Route path="/admin/reviews" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminReviews /></AdminLayout></RequireRole>} />
          <Route path="/admin/users" element={<RequireRole roles={['ADMIN', 'STAFF']}><AdminLayout><AdminUsers /></AdminLayout></RequireRole>} />

          <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang chủ</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <b>VietTour</b> — Hệ thống giới thiệu du lịch & đặt tour (Tour → Departure → Booking → Payment).
          <div className="muted" style={{ color: '#a7f3d0' }}>Demo: admin@gmail.com / Admin123! — API: http://localhost:5000</div>
        </div>
      </footer>
    </>
  );
}
