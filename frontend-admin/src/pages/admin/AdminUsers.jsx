import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, viStatus } from '../../components/ui.jsx';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/users');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function lock(id, status) {
    try {
      await api.patch(`/admin/users/${id}/lock`, { status });
      setMsg(`Tài khoản #${id} đã chuyển thành “${viStatus(status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  const filtered = rows.filter((u) => {
    const okQ = !q || `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase());
    const okR = !role || String(u.role).toUpperCase() === role;
    return okQ && okR;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Người dùng</h2><p>{rows.length} tài khoản — khóa / mở khóa quyền truy cập.</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} hiển thị</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc người dùng</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo tên / email..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Mọi vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
          <select value="" onChange={() => {}} aria-label="Trạng thái">
            <option value="">Mọi trạng thái</option>
          </select>
          <button className="btn secondary sm" type="button" onClick={() => { setQ(''); setRole(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Khóa / Mở khóa</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Chưa có người dùng nào.</div></td></tr>}
          {filtered.map((u) => (
            <tr key={u.id}>
              <td className="muted">#{u.id}</td><td><b>{u.full_name}</b></td><td>{u.email}</td><td><span className="badge b-cyan">{viStatus(u.role)}</span></td>
              <td><StatusBadge value={u.status} /></td>
              <td>
                <button className="btn secondary sm" onClick={() => lock(u.id, u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')}>
                  {u.status === 'ACTIVE' ? '🔒 Khóa' : '🔓 Mở khóa'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
