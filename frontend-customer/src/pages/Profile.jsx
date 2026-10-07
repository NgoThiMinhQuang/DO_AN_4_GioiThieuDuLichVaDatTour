import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { friendlyError } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', date_of_birth: '', gender: '', avatar: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [pw, setPw] = useState({ old_password: '', new_password: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/me');
        setForm({
          full_name: res.data.full_name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          date_of_birth: res.data.date_of_birth ? String(res.data.date_of_birth).slice(0, 10) : '',
          gender: res.data.gender || '',
          avatar: res.data.avatar || ''
        });
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.put('/auth/me', { ...form, date_of_birth: form.date_of_birth || null, gender: form.gender || null });
      setMsg('Cập nhật hồ sơ thành công');
    } catch (err) { setMsg(friendlyError(err)); }
  }

  async function changePw(e) {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', pw);
      setMsg('Đổi mật khẩu thành công');
      setPw({ old_password: '', new_password: '' });
    } catch (err) { setMsg(friendlyError(err)); }
  }

  const initial = ((form.full_name || user?.email || 'T').trim().charAt(0) || 'T').toUpperCase();

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Tài khoản</span>
        <h2>Hồ sơ cá nhân</h2>
        <p>Cập nhật thông tin để đặt tour nhanh hơn và nhận ưu đãi phù hợp.</p>
      </div>
      <div className="panel tv-profile-head" style={{ textAlign: 'center', marginBottom: 16 }}>
        <span className="user-avatar tv-profile-avatar">
          {form.avatar ? <img src={form.avatar} alt="avatar" /> : initial}
        </span>
        <div className="tv-profile-name">{form.full_name || user?.email || ''}</div>
        <div className="muted">{user?.email || ''}</div>
        <div style={{ marginTop: 8 }}><span className="badge green">Thành viên TravelViet</span></div>
      </div>
      {error && (
        <div className="alert info">
          {/network|fetch|timeout|500/i.test(error)
            ? 'Không tải được hồ sơ lúc này. Vui lòng kiểm tra mạng rồi thử lại.'
            : error}
        </div>
      )}
      {msg && <div className="alert info">{msg}</div>}
      <div className="tv-profile-grid">
        <div className="panel profile-panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginTop: 0 }}>Thông tin chung</h3>
          <form className="form" onSubmit={save}>
            <div className="tv-form-2col">
              <label>Họ tên<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyễn Văn A" /></label>
              <label>SĐT<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" /></label>
            </div>
            <div className="tv-form-2col">
              <label>Ngày sinh<input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></label>
              <label>Giới tính
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">—</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </label>
            </div>
            <label>Địa chỉ<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" /></label>
            <label>Ảnh đại diện (đường dẫn ảnh)<input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." /></label>
            <div><button className="btn" type="submit">Lưu thay đổi</button></div>
          </form>
        </div>
        <div className="panel profile-panel">
          <h3 style={{ marginTop: 0 }}>Đổi mật khẩu</h3>
          <p className="muted" style={{ marginTop: 0 }}>Dùng mật khẩu mạnh ≥6 ký tự để bảo vệ tài khoản.</p>
          <form className="form" onSubmit={changePw}>
            <div className="tv-form-2col">
              <label>Mật khẩu hiện tại<input type="password" value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} placeholder="••••••••" /></label>
              <label>Mật khẩu mới<input type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} placeholder="••••••••" /></label>
            </div>
            <div><button className="btn secondary" type="submit">Đổi mật khẩu</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
