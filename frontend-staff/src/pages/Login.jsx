import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

// Trang dang nhap NHAN VIEN: chi chap nhan role STAFF.
// Login xong goi /auth/me, neu role !== 'STAFF' thi logout + bao loi.
export default function Login() {
  const [identifier, setIdentifier] = useState('staff@gmail.com');
  const [password, setPassword] = useState('Staff123!');
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      let role = null;
      try {
        const me = await api.get('/auth/me');
        role = me.data?.role || null;
      } catch (_) {
        role = null;
      }
      if (role !== 'STAFF') {
        logout();
        setError('Đây là trang dành cho nhân viên. Vui lòng dùng tài khoản nhân viên.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand"><img src="/images/logo.png" alt="TravelViet" className="login-logo" /><span className="logo-staff">Nhân viên</span></div>
        <h2>Đăng nhập nhân viên</h2>
        <div className="login-sub">Kênh nghiệp vụ: Đơn đặt tour → Thanh toán → Hoàn tiền, theo dõi lịch khởi hành.</div>
        {error && <div className="alert error">{error}</div>}
        <form className="form" onSubmit={submit}>
          <label>Email hoặc số điện thoại<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="staff@gmail.com" /></label>
          <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button className="btn" type="submit">Đăng nhập</button>
        </form>
        <div className="demo-box">Tài khoản dùng thử: staff@gmail.com / Staff123!</div>
      </div>
    </div>
  );
}
