import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox } from '../../components/ui.jsx';

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
      setMsg(`User #${id} → ${status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <h2>Quản lý Users</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="table-wrap"><table>
        <thead><tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Role</th><th>Trạng thái</th><th>Khóa/Mở</th></tr></thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.role}</td>
              <td><span className="badge">{u.status}</span></td>
              <td>
                <button className="btn secondary" onClick={() => lock(u.id, u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')}>
                  {u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
