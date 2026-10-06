import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function Login() {
  const [identifier, setIdentifier] = useState('customer@gmail.com');
  const [password, setPassword] = useState('Customer123!');
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      const res = await api.get('/auth/me');
      if (res.data?.role !== 'CUSTOMER') {
        logout();
        setError('Đây là trang Khách hàng, hãy dùng app Nhân viên/Admin');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-wrap auth-split-wrap">
        <div className="auth-card auth-split-card">
          <div className="auth-side">
            <div className="auth-side-overlay" />
            <div className="auth-side-inner">
              <div className="auth-logo">
                <img src="/images/logo.png" alt="TravelViet" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <h3>Khởi đầu hành trình đáng nhớ của bạn</h3>
              <p>Hàng trăm tour khởi hành mỗi tuần với lịch trình rõ ràng, giá minh bạch và đội ngũ đồng hành 24/7.</p>
              <div className="auth-side-quote">✈ Đặt tour chỉ mất 5 phút — giữ chỗ tức thì, thanh toán an toàn.</div>
            </div>
          </div>
          <div className="auth-main">
            <h2>Chào mừng trở lại</h2>
            <p className="sub">Đăng nhập để đặt tour và theo dõi chuyến đi</p>
            {error && <div className="alert error">{error}</div>}
            <form className="form" onSubmit={submit}>
              <label>Email hoặc SĐT<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="customer@gmail.com" /></label>
              <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
              <button className="btn auth-submit" type="submit">Đăng nhập</button>
            </form>
            <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
            <div className="alert info">Demo: customer@gmail.com / Customer123!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
