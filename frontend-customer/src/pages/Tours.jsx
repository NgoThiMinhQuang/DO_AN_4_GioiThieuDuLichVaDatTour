import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { TourCard, ErrorBox, formatDateVi } from '../components/ui.jsx';

export default function Tours() {
  const [params] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState('');
  const [f, setF] = useState({
    q: params.get('q') || '',
    category: params.get('category') || '',
    destination: params.get('destination') || '',
    minPrice: '', maxPrice: '',
    days: '', departDate: params.get('departDate') || '', sort: 'newest'
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

  async function fetchTours(over = {}) {
    setError('');
    try {
      const cur = { ...f, ...over };
      const p = {
        q: cur.q || undefined,
        category: cur.category || undefined,
        destination: cur.destination || undefined,
        minPrice: cur.minPrice || undefined,
        maxPrice: cur.maxPrice || undefined,
        sort: cur.sort || undefined,
        limit: 24
      };
      const res = await api.get('/tours', { params: p });
      let rows = res.data.data || [];
      if (cur.days) rows = rows.filter((t) => Number(t.duration_days) === Number(cur.days));
      setTours(rows);
      setTotal(res.data.total ?? rows.length);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  // Đồng bộ bộ lọc với params từ thanh tìm kiếm trang chủ (?q=&destination=&category=&departDate=)
  useEffect(() => {
    const next = {
      q: params.get('q') || '',
      category: params.get('category') || '',
      destination: params.get('destination') || '',
      departDate: params.get('departDate') || ''
    };
    setF((prev) => ({ ...prev, ...next }));
    fetchTours(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function clearFilter() {
    const cleared = { q: '', category: '', destination: '', minPrice: '', maxPrice: '', days: '', departDate: '', sort: 'newest' };
    setF(cleared);
    fetchTours(cleared);
  }

  return (
    <div className="container">
      <div className="tv-tours-hero">
        <div className="tv-tours-hero-inner">
          <span className="eyebrow" style={{ color: '#bfdbfe' }}>Danh sách tour</span>
          <h2>Tìm tour phù hợp ({total})</h2>
          <p>Lọc theo điểm đến, ngân sách và thời gian khởi hành mong muốn.</p>
        </div>
      </div>
      <div className="page-head tv-page-hero">
        <span className="eyebrow">Danh sách tour</span>
        <h2 style={{ display: 'none' }}>Tìm tour phù hợp</h2>
      </div>
      <div className="tour-filter-card">
        <div className="tour-filter-header">
          <h3 className="tour-filter-title">Bộ lọc tour</h3>
          <button className="tour-filter-reset" onClick={clearFilter} type="button">Đặt lại</button>
        </div>
        <div className="tour-filter-sections">
          <div className="tour-filter-row">
            <div className="tour-filter-group" style={{ flex: 2 }}>
              <span className="tour-filter-label">Tìm kiếm</span>
              <input className="tour-filter-input" placeholder="Tìm kiếm tên / mã / điểm khởi hành..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} aria-label="Tìm kiếm tour" />
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Loại tour</span>
              <select className="tour-filter-select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} aria-label="Loại tour">
                <option value="">Tất cả loại tour</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Điểm đến</span>
              <select className="tour-filter-select" value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} aria-label="Điểm đến">
                <option value="">Tất cả điểm đến</option>
                {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="tour-filter-row">
            <div className="tour-filter-group">
              <span className="tour-filter-label">Giá tối thiểu</span>
              <input className="tour-filter-input" type="number" placeholder="Giá tối thiểu" value={f.minPrice} onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Giá tối đa</span>
              <input className="tour-filter-input" type="number" placeholder="Giá tối đa" value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Số ngày đi tour</span>
              <input className="tour-filter-input" type="number" placeholder="Số ngày đi tour" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} />
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Ngày khởi hành</span>
              <input className="tour-filter-input" type="date" value={f.departDate} onChange={(e) => setF({ ...f, departDate: e.target.value })} title="Ngày khởi hành (xem ngày cụ thể ở trang chi tiết tour)" />
            </div>
            <div className="tour-filter-group">
              <span className="tour-filter-label">Sắp xếp</span>
              <select className="tour-filter-select" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })}>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
          {f.departDate && (
            <div className="alert info" style={{ margin: 0 }}>
              Bạn đang ưu tiên lịch khởi hành gần ngày {formatDateVi(f.departDate)} — ngày cụ thể của từng tour xem ở trang chi tiết.
            </div>
          )}
          <div className="tour-filter-foot">
            <button className="btn tour-filter-apply-button" onClick={() => fetchTours()}>Tìm kiếm / Lọc</button>
            <button className="btn ghost" onClick={clearFilter} type="button">Xóa lọc</button>
            <span className="tour-filter-count">Tìm thấy {total} tour phù hợp</span>
          </div>
        </div>
      </div>
      <ErrorBox error={error} />
      {tours.length === 0 && !error && <div className="empty-box">Không tìm thấy tour phù hợp. Thử nới lỏng điều kiện lọc.</div>}
      <div className="grid tours">
        {tours.map((t) => <TourCard key={t.id} t={t} />)}
      </div>
    </div>
  );
}
