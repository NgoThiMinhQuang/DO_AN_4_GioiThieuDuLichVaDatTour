import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [identifier, setIdentifier] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const { login, fetchMe, logout } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      const me = await fetchMe();
      if (!me || me.role !== 'ADMIN') {
        logout();
        setError('Đây là trang Quản trị viên');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="tv-brand-mark">T</span>
          <div><b style={{ color: '#0f172a' }}>TravelViet Admin</b><div className="muted">Hệ thống quản trị tour du lịch</div></div>
        </div>
        <h2>Đăng nhập</h2>
        <div className="muted">Chào mừng trở lại! Đăng nhập để quản lý tours, bookings & doanh thu.</div>
        {error && <div className="alert error">{error}</div>}
        <form className="form" onSubmit={submit} style={{ marginTop: 12 }}>
          <label>Email hoặc SĐT<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="admin@gmail.com" /></label>
          <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button className="btn" type="submit">Đăng nhập →</button>
        </form>
        <div className="alert info">Demo: admin@gmail.com / Admin123!</div>
      </div>
    </div>
  );
}
