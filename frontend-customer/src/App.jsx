import { useEffect, useRef, useState } from 'react';
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

function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const displayName = user?.full_name || user?.email || 'Tài khoản';
  const initial = (displayName || 'T').trim().charAt(0).toUpperCase();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo brand logo-img" aria-label="TravelViet - Trang chủ">
          <img src="/images/logo.png" alt="TravelViet" style={{ height: 48 }} />
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/tours">Tour</NavLink>
          <NavLink to="/destinations">Điểm đến</NavLink>
          <NavLink to="/articles">Bài viết</NavLink>
        </nav>
        <div className="header-spacer" />
        <div className="header-actions">
          <NavLink to="/favorites" className="icon-btn" title="Tour yêu thích"><HeartIcon /></NavLink>
          <NavLink to="/notifications" className="icon-btn" title="Thông báo"><BellIcon /><span className="dot" style={{ display: 'none' }} /></NavLink>
          {!user && (
            <>
              <NavLink to="/login" className="btn secondary btn-sm">Đăng nhập</NavLink>
              <NavLink to="/register" className="btn btn-sm">Đăng ký</NavLink>
            </>
          )}
          {user && (
            <div className="user-wrap" ref={wrapRef}>
              <button className="user-pill" onClick={() => setOpen((v) => !v)}>
                <span className="user-avatar">
                  {user.avatar ? <img src={user.avatar} alt={displayName} /> : initial}
                </span>
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                <span style={{ color: '#64748b' }}>▾</span>
              </button>
              {open && (
                <div className="user-dropdown">
                  <div className="dd-head"><b>{displayName}</b><span>{user.email || user.phone || ''}</span></div>
                  <Link to="/profile" onClick={() => setOpen(false)}>👤 Hồ sơ cá nhân</Link>
                  <Link to="/my-bookings" onClick={() => setOpen(false)}>🧾 Đặt tour của tôi</Link>
                  <Link to="/favorites" onClick={() => setOpen(false)}>♡ Tour yêu thích</Link>
                  <Link to="/notifications" onClick={() => setOpen(false)}>🔔 Thông báo</Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                  >
                    ⎋ Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <svg className="footer-wave" viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ height: 60 }}>
        <path d="M0,40 C240,80 480,0 720,25 C960,50 1200,70 1440,30 L1440,0 L0,0 Z" fill="#f4f7fb" />
      </svg>
      <div className="footer-inner">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Travel<span style={{ color: '#60a5fa' }}>Viet</span></div>
              <p className="footer-slogan">Khám phá Việt Nam — đặt tour dễ dàng, thanh toán an toàn, trải nghiệm trọn vẹn.</p>
              <div className="social-row">
                <a className="social-btn" href="#" aria-label="Facebook">f</a>
                <a className="social-btn" href="#" aria-label="Youtube">▶</a>
                <a className="social-btn" href="#" aria-label="Instagram">◎</a>
                <a className="social-btn" href="#" aria-label="Tiktok">♪</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Khám phá</h4>
              <Link to="/tours">Tất cả tour</Link>
              <Link to="/destinations">Điểm đến</Link>
              <Link to="/articles">Bài viết du lịch</Link>
              <Link to="/favorites">Tour yêu thích</Link>
            </div>
            <div className="footer-col">
              <h4>Dịch vụ</h4>
              <Link to="/my-bookings">Đặt tour của tôi</Link>
              <Link to="/profile">Hồ sơ cá nhân</Link>
              <Link to="/notifications">Thông báo</Link>
              <Link to="/register">Đăng ký thành viên</Link>
            </div>
            <div className="footer-col">
              <h4>Liên hệ</h4>
              <div>Hotline hỗ trợ 24/7</div>
              <div className="hotline">1900 6868</div>
              <div>✉ hotro@travelviet.vn</div>
              <div>📍 12 Nguyễn Huệ, Q.1, TP.HCM</div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 TravelViet — Khám phá tour, điểm đến &amp; đặt tour trực tuyến.</span>
            <span className="footer-demo">Demo: customer@gmail.com / Customer123!</span>
            <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Về đầu trang">↑</button>
          </div>
        </div>
      </div>
    </footer>
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

          <Route path="*" element={<div className="container"><div className="empty-box" style={{ marginTop: 32 }}><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang chủ</Link></div></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
