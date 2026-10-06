import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { TourCard, ErrorBox } from '../components/ui.jsx';

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState('');
  const [f, setF] = useState({
    q: '', category: '', destination: '', minPrice: '', maxPrice: '',
    days: '', departDate: '', sort: 'newest'
  });

  useEffect(() => {
    (async () => {
      try {
        const [c, d] = await Promise.all([
          api.get('/meta/tour-categories'),
          api.get('/meta/destinations')
        ]);
        setCategories(c.data.data || []);
        setDestinations(d.data.data || []);
      } catch (_) {}
    })();
  }, []);

  async function load() {
    setError('');
    try {
      const params = {
        q: f.q || undefined,
        category: f.category || undefined,
        destination: f.destination || undefined,
        minPrice: f.minPrice || undefined,
        maxPrice: f.maxPrice || undefined,
        sort: f.sort || undefined,
        limit: 24
      };
      const res = await api.get('/tours', { params });
      let rows = res.data.data || [];
      // Lọc client-side cho số ngày + ngày khởi hành (backend chưa hỗ trợ param này)
      if (f.days) rows = rows.filter((t) => Number(t.duration_days) === Number(f.days));
      setTours(rows);
      setTotal(res.data.total ?? rows.length);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  return (
    <div className="container">
      <h2>Danh sách tour ({total})</h2>
      <div className="filters">
        <div className="form-row">
          <input placeholder="Tìm kiếm tên / mã / điểm khởi hành..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })}>
            <option value="">Tất cả điểm đến</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <input type="number" placeholder="Giá tối thiểu" value={f.minPrice} onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
          <input type="number" placeholder="Giá tối đa" value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
          <input type="number" placeholder="Số ngày (lọc local)" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} />
          <input type="date" value={f.departDate} onChange={(e) => setF({ ...f, departDate: e.target.value })} title="Ngày khởi hành (xem ở chi tiết tour)" />
          <select value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
        <div><button className="btn" onClick={load}>Tìm kiếm / Lọc</button></div>
      </div>
      <ErrorBox error={error} />
      <div className="grid tours">
        {tours.map((t) => <TourCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}
