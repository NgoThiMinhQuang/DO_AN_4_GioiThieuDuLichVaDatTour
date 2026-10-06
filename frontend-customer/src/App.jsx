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

function RequireAuth({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== 'CUSTOMER') return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">VietTour Khách hàng</Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tours">Tours</NavLink>
          <NavLink to="/destinations">Điểm đến</NavLink>
          <NavLink to="/articles">Bài viết</NavLink>
          <NavLink to="/favorites">Yêu thích</NavLink>
          <NavLink to="/my-bookings">Booking của tôi</NavLink>
          <NavLink to="/notifications">Thông báo</NavLink>
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
              Đăng xuất
            </button>
          )}
        </nav>
      </div>
    </header>
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

          <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang chủ</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <b>VietTour Khách hàng</b> — Khám phá tour, điểm đến & đặt tour trực tuyến.
          <div className="muted" style={{ color: '#a7f3d0' }}>Demo: customer@gmail.com / Customer123! — API: http://localhost:5000</div>
        </div>
      </footer>
    </>
  );
}
