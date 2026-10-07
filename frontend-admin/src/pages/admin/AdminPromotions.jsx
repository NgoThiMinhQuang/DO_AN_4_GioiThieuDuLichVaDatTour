import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox, StatusBadge, viStatus } from '../../components/ui.jsx';

export default function AdminPromotions() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ code: '', name: '', description: '', discount_type: 'PERCENT', discount_value: 10, minimum_order_value: '', maximum_discount: '', start_date: '', end_date: '', usage_limit: '', status: 'ACTIVE' });

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
      await api.post('/admin/promotions', {
        code: form.code,
        name: form.name || null,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        minimum_order_value: form.minimum_order_value === '' ? null : Number(form.minimum_order_value),
        maximum_discount: form.maximum_discount === '' ? null : Number(form.maximum_discount),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
        status: form.status,
      });
      setMsg('Thêm mã khuyến mãi thành công.');
      setForm({ code: '', name: '', description: '', discount_type: 'PERCENT', discount_value: 10, minimum_order_value: '', maximum_discount: '', start_date: '', end_date: '', usage_limit: '', status: 'ACTIVE' });
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

  const filtered = rows.filter((p) => {
    const okQ = !q || `${p.code} ${p.name}`.toLowerCase().includes(q.toLowerCase());
    const okS = !status || p.status === status;
    return okQ && okS;
  });

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Khuyến mãi</h2><p>Mã giảm giá và bật/tắt chương trình khuyến mãi.</p></div>
        <div className="page-actions"><span className="badge b-blue">{filtered.length} mã</span></div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <form className="filters" onSubmit={create}>
        <b>✚ Thêm mã khuyến mãi</b>
        <div className="form-grid-2">
          <input placeholder="Mã (ví dụ: CHAO10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <input placeholder="Tên chương trình" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="FIXED">Số tiền cố định</option>
          </select>
          <input type="number" placeholder="Giá trị giảm" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
          <input type="number" placeholder="Đơn tối thiểu" value={form.minimum_order_value} onChange={(e) => setForm({ ...form, minimum_order_value: e.target.value })} />
          <input type="number" placeholder="Giảm tối đa" value={form.maximum_discount} onChange={(e) => setForm({ ...form, maximum_discount: e.target.value })} />
          <label>Ngày bắt đầu<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
          <label>Ngày kết thúc<input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
          <input type="number" placeholder="Giới hạn lượt dùng" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
        </div>
        <div><button className="btn sm" type="submit">＋ Thêm mã</button></div>
      </form>
      <div className="filters">
        <b>Bộ lọc khuyến mãi</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã / tên chương trình..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang áp dụng</option>
            <option value="INACTIVE">Ngừng áp dụng</option>
          </select>
          <select value="" onChange={() => {}} aria-label="Loại giảm">
            <option value="">Mọi loại giảm</option>
          </select>
          <button className="btn secondary sm" type="button" onClick={() => { setQ(''); setStatus(''); }}>Đặt lại</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã giảm giá</th><th>Tên chương trình</th><th>Loại giảm</th><th>Giá trị</th><th>Đã dùng</th><th>Trạng thái</th><th>Đổi trạng thái</th></tr></thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={7}><div className="tv-empty">Chưa có khuyến mãi nào.</div></td></tr>}
          {filtered.map((p) => (
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
