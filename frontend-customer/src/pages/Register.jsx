import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
          <h2>Tạo tài khoản</h2>
          <p className="sub">Tham gia cùng 120K+ traveler mỗi năm</p>
          {error && <div className="alert error">{error}</div>}
          <form className="form" onSubmit={submit}>
            <label>Họ tên<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Nguyễn Văn A" /></label>
            <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@email.com" /></label>
            <label>SĐT<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" /></label>
            <label>Mật khẩu (≥6 ký tự)<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" /></label>
            <button className="btn" type="submit">Đăng ký miễn phí</button>
          </form>
          <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
}
