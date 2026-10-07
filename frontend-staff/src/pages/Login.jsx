import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

// Trang dang nhap NHAN VIEN: chi chap nhan role STAFF (ADMIN co toan quyen nen van vao duoc).
// Login xong goi /auth/me, neu role khong phai STAFF/ADMIN thi logout + bao loi.
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
      if (role !== 'STAFF' && role !== 'ADMIN') {
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
      <div className="login-split">
        <div className="login-banner">
          <div className="login-banner-content">
            <h2>TravelViet — Kênh nhân viên</h2>
            <p>Tra cứu đơn đặt tour, xác nhận thanh toán, theo dõi lịch khởi hành và xử lý hoàn tiền mỗi ngày.</p>
            <div className="login-banner-badges">
              <span>📋 Đơn đặt tour</span>
              <span>💳 Thanh toán</span>
              <span>↩️ Hoàn tiền</span>
              <span>🗓️ Lịch khởi hành</span>
            </div>
          </div>
        </div>
        <div className="login-form-side">
          <div className="login-brand"><img src="/images/logo.png" alt="TravelViet" className="login-logo" /><span className="logo-staff">Nhân viên</span></div>
          <h2>Đăng nhập nhân viên</h2>
          <div className="login-sub">Kênh nghiệp vụ: Đơn đặt tour → Thanh toán → Hoàn tiền, theo dõi lịch khởi hành.</div>
          {error && <div className="alert error">{error}</div>}
          <form className="form" onSubmit={submit}>
            <label>Email hoặc số điện thoại<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="staff@gmail.com" /></label>
            <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
            <button className="btn" type="submit">Đăng nhập</button>
          </form>
          <div className="demo-box">Tài khoản: staff@gmail.com / Staff123!</div>
        </div>
      </div>
    </div>
  );
}
