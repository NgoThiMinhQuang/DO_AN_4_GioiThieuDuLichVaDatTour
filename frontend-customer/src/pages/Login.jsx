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
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>Travel<span style={{ color: '#2563eb' }}>Viet</span></span>
          </div>
          <h2>Chào mừng trở lại</h2>
          <p className="sub">Đăng nhập để đặt tour và theo dõi chuyến đi</p>
          {error && <div className="alert error">{error}</div>}
          <form className="form" onSubmit={submit}>
            <label>Email hoặc SĐT<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="customer@gmail.com" /></label>
            <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button className="btn" type="submit">Đăng nhập</button>
          </form>
          <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          <div className="alert info">Demo: customer@gmail.com / Customer123!</div>
        </div>
      </div>
    </div>
  );
}
