import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { friendlyError } from '../components/ui.jsx';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(friendlyError(err));
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
              <p>Tham gia cùng 120.000+ khách du lịch mỗi năm — ưu đãi thành viên, giữ chỗ sớm, hỗ trợ 24/7.</p>
              <div className="auth-side-quote">🎒 Tạo tài khoản miễn phí để nhận mã giảm giá cho chuyến đi đầu tiên.</div>
            </div>
          </div>
          <div className="auth-main">
            <h2>Tạo tài khoản</h2>
            <p className="sub">Tham gia cùng 120.000+ khách du lịch mỗi năm</p>
            {error && <div className="alert error">{error}</div>}
            <form className="form" onSubmit={submit}>
              <label>Họ tên<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Nguyễn Văn A" /></label>
              <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@email.com" /></label>
              <label>SĐT<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" /></label>
              <label>Mật khẩu (≥6 ký tự)<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" /></label>
              <button className="btn auth-submit" type="submit">Đăng ký miễn phí</button>
            </form>
            <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
