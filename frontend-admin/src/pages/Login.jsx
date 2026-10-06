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
        setError('Đây là trang dành cho quản trị viên. Vui lòng đăng nhập bằng tài khoản quản trị.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-split">
        <div className="login-banner">
          <div className="login-banner-inner">
            <span className="login-banner-badge">TravelViet • Quản trị</span>
            <b>Khám phá Việt Nam, quản lý dễ dàng</b>
            <p>Quản lý tour, lịch khởi hành, đơn đặt tour, thanh toán và doanh thu trên một màn hình.</p>
          </div>
        </div>
        <div className="login-pane">
          <div className="login-brand">
            <img className="login-logo" src="/images/logo.png" alt="Logo TravelViet" />
            <div><b style={{ color: '#0f172a' }}>TravelViet</b><div className="muted">Hệ thống quản trị tour du lịch</div></div>
          </div>
          <h2>Đăng nhập quản trị</h2>
          <div className="muted">Chào mừng trở lại! Đăng nhập để quản lý tour, đơn đặt tour và doanh thu.</div>
          {error && <div className="alert error">{error}</div>}
          <form className="form" onSubmit={submit} style={{ marginTop: 12 }}>
            <label>Email hoặc số điện thoại<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Nhập email hoặc số điện thoại" /></label>
            <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" /></label>
            <button className="btn" type="submit">Đăng nhập</button>
          </form>
          <div className="alert info">Tài khoản demo: admin@gmail.com / Admin123!</div>
        </div>
      </div>
    </div>
  );
}
