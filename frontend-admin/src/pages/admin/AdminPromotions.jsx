import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, viStatus } from '../../components/ui.jsx';

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
      setMsg('Thêm mã khuyến mãi thành công.');
      load();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
  }

  async function toggle(id, status) {
    try {
      await api.put(`/admin/promotions/${id}`, { status });
      setMsg(`Khuyến mãi #${id} đã chuyển thành “${viStatus(status)}”.`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  function discountText(p) {
    if (p.discount_type === 'PERCENT') return `${p.discount_value}%`;
    return `${Number(p.discount_value).toLocaleString('vi-VN')}đ`;
  }

  return (
    <div>
      <div className="tv-pagehead">
        <div><h2>Khuyến mãi</h2><p>Mã giảm giá và bật/tắt chương trình khuyến mãi.</p></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <form className="filters" onSubmit={create}>
        <b>✚ Thêm mã khuyến mãi</b>
        <div className="form-row">
          <input placeholder="Mã (ví dụ: CHAO10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input placeholder="Tên chương trình" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="FIXED">Số tiền cố định</option>
          </select>
          <input type="number" placeholder="Giá trị giảm" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
        </div>
        <div><button className="btn sm" type="submit">＋ Thêm mã</button></div>
      </form>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã giảm giá</th><th>Tên chương trình</th><th>Loại giảm</th><th>Giá trị</th><th>Đã dùng</th><th>Trạng thái</th><th>Đổi trạng thái</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Chưa có khuyến mãi nào.</div></td></tr>}
          {rows.map((p) => (
            <tr key={p.id}>
              <td><b style={{ color: '#1d4ed8' }}>{p.code}</b></td><td>{p.name}</td><td>{viStatus(p.discount_type)}</td><td style={{ fontWeight: 700 }}>{discountText(p)}</td>
              <td>{p.used_count}/{p.usage_limit ?? '∞'}</td>
              <td><StatusBadge value={p.status} /></td>
              <td>
                <button className="btn secondary sm" onClick={() => toggle(p.id, p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                  {p.status === 'ACTIVE' ? '⏸ Ngừng áp dụng' : '▶ Áp dụng'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
