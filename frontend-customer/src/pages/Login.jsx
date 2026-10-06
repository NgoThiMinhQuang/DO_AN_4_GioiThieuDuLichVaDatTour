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
      // Verify role via /me
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
    <div className="container" style={{ maxWidth: 440 }}>
      <h2>Đăng nhập Khách hàng</h2>
      {error && <div className="alert error">{error}</div>}
      <form className="form" onSubmit={submit}>
        <label>Email hoặc SĐT<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn" type="submit">Đăng nhập</button>
      </form>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      <div className="alert info">Demo: customer@gmail.com / Customer123!</div>
    </div>
  );
}
