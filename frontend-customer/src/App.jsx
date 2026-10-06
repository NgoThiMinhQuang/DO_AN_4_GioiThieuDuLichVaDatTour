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
import LichKhoiHanh from './pages/LichKhoiHanh.jsx';
import LienHe from './pages/LienHe.jsx';
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

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
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
          <img src="/images/logo.png" alt="TravelViet" />
        </Link>
        <nav className="nav">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/tours">Tour</NavLink>
          <NavLink to="/lich-khoi-hanh">Lịch khởi hành</NavLink>
          <NavLink to="/destinations">Điểm đến</NavLink>
          <NavLink to="/articles">Bài viết</NavLink>
          <NavLink to="/lien-he">Liên hệ</NavLink>
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
                  <div className="dd-head">
                    <span className="user-avatar dd-avatar">
                      {user.avatar ? <img src={user.avatar} alt={displayName} /> : initial}
                    </span>
                    <div className="dd-id"><b>{displayName}</b><span>{user.email || user.phone || ''}</span></div>
                  </div>
                  <Link to="/profile" onClick={() => setOpen(false)}><UserIcon /> Hồ sơ cá nhân</Link>
                  <Link to="/my-bookings" onClick={() => setOpen(false)}><ReceiptIcon /> Đặt tour của tôi</Link>
                  <Link to="/favorites" onClick={() => setOpen(false)}><HeartIcon /> Tour yêu thích</Link>
                  <Link to="/notifications" onClick={() => setOpen(false)}><BellIcon /> Thông báo</Link>
                  <div className="dd-divider" />
                  <button
                    className="dd-logout"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                  >
                    <LogoutIcon /> Đăng xuất
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
    <footer className="main-footer">
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path className="shape-fill" d="M0,0 C300,90 900,90 1200,30 L1200,0 L0,0 Z" />
        </svg>
      </div>
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link to="/" className="footer-logo-link" aria-label="TravelViet - Trang chủ">
              <span className="footer-logo">Travel<span>Viet</span></span>
            </Link>
            <p className="footer-slogan">Khám phá Việt Nam — đặt tour dễ dàng, thanh toán an toàn, trải nghiệm trọn vẹn.</p>
            <div className="footer-social-wrapper">
              <a className="footer-social-icon facebook" href="#" aria-label="Facebook">f</a>
              <a className="footer-social-icon youtube" href="#" aria-label="Youtube">▶</a>
              <a className="footer-social-icon instagram" href="#" aria-label="Instagram">◎</a>
              <a className="footer-social-icon tiktok" href="#" aria-label="Tiktok">♪</a>
            </div>
          </div>
          <div>
            <h4 className="footer-section-title">Khám phá</h4>
            <ul className="footer-nav-links">
              <li><Link to="/tours">Tất cả tour</Link></li>
              <li><Link to="/lich-khoi-hanh">Lịch khởi hành</Link></li>
              <li><Link to="/destinations">Điểm đến</Link></li>
              <li><Link to="/articles">Bài viết du lịch</Link></li>
              <li><Link to="/favorites">Tour yêu thích</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-section-title">Dịch vụ</h4>
            <ul className="footer-nav-links">
              <li><Link to="/my-bookings">Đặt tour của tôi</Link></li>
              <li><Link to="/lien-he">Liên hệ hỗ trợ</Link></li>
              <li><Link to="/profile">Hồ sơ cá nhân</Link></li>
              <li><Link to="/notifications">Thông báo</Link></li>
              <li><Link to="/register">Đăng ký thành viên</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-section-title">Liên hệ</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span className="icon-box">☎</span>
                <span className="text-box"><span>Hotline hỗ trợ 24/7</span><b>1900 6868</b></span>
              </div>
              <div className="footer-contact-item">
                <span className="icon-box">✉</span>
                <span className="text-box"><span>Email hỗ trợ</span><b>hotro@travelviet.vn</b></span>
              </div>
              <div className="footer-contact-item">
                <span className="icon-box">📍</span>
                <span className="text-box"><span>Văn phòng</span><b>12 Nguyễn Huệ, Q.1, TP.HCM</b></span>
              </div>
            </div>
          </div>
        </div>
        <hr className="footer-light-divider" />
        <div className="footer-bottom-bar">
          <span className="copy-text">© 2026 <span className="brand-accent">TravelViet</span> — Khám phá tour, điểm đến &amp; đặt tour trực tuyến.</span>
          <span className="footer-legal-links">
            <Link to="/tours">Tour</Link>
            <Link to="/destinations">Điểm đến</Link>
            <Link to="/articles">Bài viết</Link>
          </span>
          <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Về đầu trang">↑</button>
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
          <Route path="/lich-khoi-hanh" element={<LichKhoiHanh />} />
          <Route path="/lien-he" element={<LienHe />} />
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
