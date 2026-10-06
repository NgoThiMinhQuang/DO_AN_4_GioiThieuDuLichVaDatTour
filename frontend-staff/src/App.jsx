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
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">VietTour Staff</Link>
        <nav className="nav">
          <NavLink to="/departures">Theo dõi khởi hành</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
          <NavLink to="/payments">Payments</NavLink>
          <NavLink to="/refunds">Refunds</NavLink>
        </nav>
        <div className="header-spacer" />
        <nav className="nav">
          {!user && <NavLink to="/login">Đăng nhập</NavLink>}
          {user && <span className="muted">{user.full_name || user.email}</span>}
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
    { to: '/departures', title: 'Theo dõi khởi hành', desc: 'Xem lịch khởi hành và số chỗ còn lại (chỉ đọc).' },
    { to: '/bookings', title: 'Bookings', desc: 'Xem / tìm kiếm và xác nhận booking, ghi chú.' },
    { to: '/payments', title: 'Payments', desc: 'Xác nhận và ghi nhận thanh toán.' },
    { to: '/refunds', title: 'Refunds', desc: 'Xử lý hủy booking và hoàn tiền.' },
  ];
  return (
    <div className="container">
      <div className="hero">
        <h1>Xin chào nhân viên VietTour</h1>
        <p>Xem / tìm booking, xác nhận booking, xác nhận thanh toán, theo dõi lịch khởi hành, xử lý hủy + hoàn tiền.</p>
      </div>
      <div className="section">
        <h2>Công việc</h2>
        <div className="grid cols-2">
          {items.map((it) => (
            <div className="card" key={it.to}>
              <div className="card-body">
                <div className="card-title"><Link to={it.to}>{it.title}</Link></div>
                <div className="muted">{it.desc}</div>
                <div><Link className="btn" to={it.to}>Mở</Link></div>
              </div>
            </div>
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
          <b>VietTour Staff</b> — Kênh nghiệp vụ nhân viên (Booking → Payment → Refund, theo dõi khởi hành).
          <div className="muted" style={{ color: '#a7f3d0' }}>Demo: staff@gmail.com / Staff123! — API: http://localhost:5000</div>
        </div>
      </footer>
    </>
  );
}
