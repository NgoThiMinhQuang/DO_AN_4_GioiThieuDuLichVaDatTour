import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox } from '../../components/ui.jsx';

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/reviews');
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/reviews/${id}`, { status });
      setMsg(`Review #${id} → ${status}`);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
  }

  return (
    <div>
      <h2>Quản lý Reviews</h2>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="table-wrap"><table>
        <thead><tr><th>ID</th><th>Tour</th><th>Khách</th><th>Sao</th><th>Nội dung</th><th>TT</th><th>Ẩn/Hiện</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.tour_name}</td><td>{r.full_name}</td><td>{r.rating}★</td>
              <td>{(r.content || '').slice(0, 80)}</td>
              <td><span className="badge">{r.status}</span></td>
              <td>
                <button className="btn secondary" onClick={() => setStatus(r.id, r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}>
                  {r.status === 'VISIBLE' ? 'Ẩn' : 'Hiện'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
