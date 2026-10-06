import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, viStatus } from '../../components/ui.jsx';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
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

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Người dùng</h2><p>{rows.length} tài khoản — khóa / mở khóa quyền truy cập.</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="table-wrap"><table>
        <thead><tr><th>Mã số</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Khóa / Mở khóa</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6}><div className="tv-empty">Chưa có người dùng nào.</div></td></tr>}
          {rows.map((u) => (
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
