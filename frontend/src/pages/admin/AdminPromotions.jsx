import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox } from '../../components/ui.jsx';

export default function AdminPromotions() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ code: '', name: '', discount_type: 'PERCENT', discount_value: 10, status: 'ACTIVE' });

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/promotions');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api.post('/admin/promotions', form);
      setMsg('Tạo khuyến mãi thành công');
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function toggle(id, status) {
    try {
      await api.put(`/admin/promotions/${id}`, { status });
      setMsg(`Promotion #${id} → ${status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <h2>Quản lý Promotions</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <form className="filters" onSubmit={create}>
        <div className="form-row">
          <input placeholder="Mã (VD: SALE10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input placeholder="Tên CT" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
          <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
        </div>
        <div><button className="btn" type="submit">Tạo mã</button></div>
      </form>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Tên</th><th>Loại</th><th>Giá trị</th><th>Đã dùng</th><th>Trạng thái</th><th>Đổi TT</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td><td>{p.name}</td><td>{p.discount_type}</td><td>{p.discount_value}</td>
              <td>{p.used_count}/{p.usage_limit ?? '∞'}</td>
              <td><span className="badge">{p.status}</span></td>
              <td>
                <button className="btn secondary" onClick={() => toggle(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                  {p.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
