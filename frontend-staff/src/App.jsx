import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import AdminDepartures from './pages/admin/AdminDepartures.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminRefunds from './pages/admin/AdminRefunds.jsx';

// Tat ca trang nghiep vu (tru /login) yeu cau role STAFF.
function RequireStaff({ children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && role !== 'STAFF') return <Navigate to="/login" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => (isActive ? 'active' : '');
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="TravelViet" className="logo-img" />
          <span className="logo-staff">Nhân viên</span>
        </Link>
        <nav className="nav">
          <NavLink to="/departures" className={linkClass}>Lịch khởi hành</NavLink>
          <NavLink to="/bookings" className={linkClass}>Đơn đặt tour</NavLink>
          <NavLink to="/payments" className={linkClass}>Thanh toán</NavLink>
          <NavLink to="/refunds" className={linkClass}>Hoàn tiền</NavLink>
        </nav>
        <div className="header-spacer" />
        <nav className="nav">
          {!user && <NavLink to="/login" className={linkClass}>Đăng nhập</NavLink>}
          {user && <span className="user-chip">{user.full_name || user.email}</span>}
          {user && (
            <button
              className="btn secondary"
              onClick={() => {
                logout();
                navigate('/login');
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

function Home() {
  const items = [
    { to: '/departures', icon: '🗓️', title: 'Lịch khởi hành', desc: 'Xem lịch khởi hành và số chỗ còn lại (chỉ đọc).' },
    { to: '/bookings', icon: '📋', title: 'Đơn đặt tour', desc: 'Tra cứu, lọc và xác nhận đơn đặt tour.' },
    { to: '/payments', icon: '💳', title: 'Thanh toán', desc: 'Xác nhận và ghi nhận thanh toán.' },
    { to: '/refunds', icon: '↩️', title: 'Hoàn tiền', desc: 'Xử lý hủy đơn và hoàn tiền.' },
  ];
  return (
    <div className="container">
      <div className="hero hero-staff">
        <h1>Xin chào nhân viên TravelViet</h1>
        <p>Tra cứu đơn đặt tour, xác nhận đơn, xác nhận thanh toán, theo dõi lịch khởi hành, xử lý hủy và hoàn tiền.</p>
        <div className="hero-badges">
          <span>📋 Đơn đặt tour</span>
          <span>💳 Thanh toán</span>
          <span>↩️ Hoàn tiền</span>
          <span>🗓️ Lịch khởi hành</span>
        </div>
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
          <Route path="*" element={<div className="container"><h2>404 - Không tìm thấy trang</h2><Link to="/">Về trang chủ</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <span className="footer-brand">TravelViet</span> — Kênh nghiệp vụ nhân viên (Đơn đặt tour → Thanh toán → Hoàn tiền, theo dõi lịch khởi hành).
          <div className="muted" style={{ color: '#94a3b8' }}>Tài khoản dùng thử: staff@gmail.com / Staff123!</div>
        </div>
      </footer>
    </>
  );
}
