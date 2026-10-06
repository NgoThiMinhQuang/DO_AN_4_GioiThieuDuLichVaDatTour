import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [identifier, setIdentifier] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440 }}>
      <h2>Đăng nhập</h2>
      {error && <div className="alert error">{error}</div>}
      <form className="form" onSubmit={submit}>
        <label>Email hoặc SĐT<input value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn" type="submit">Đăng nhập</button>
      </form>
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
      <div className="alert info">Demo: admin@gmail.com / Admin123!</div>
    </div>
  );
}
