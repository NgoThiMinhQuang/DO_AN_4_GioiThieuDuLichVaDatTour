import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { EmptyState, LoadError, handleImgError, fallbackDestImg } from '../components/ui.jsx';

export default function Destinations() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/meta/destinations');
        setRows(res.data.data || []);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);

  const regions = useMemo(() => {
    const s = new Set();
    rows.forEach((d) => { if (d.region) s.add(d.region); });
    return [...s];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((d) => {
      if (region && d.region !== region) return false;
      if (!needle) return true;
      return [d.name, d.province, d.region, d.description].filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [rows, q, region]);

  return (
    <div className="container">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Đi đâu tiếp theo?</span>
        <h2>Điểm đến nổi bật</h2>
        <p>Từ biển đảo đến núi rừng — chọn điểm đến cho chuyến đi của bạn.</p>
      </div>
      <div className="tv-dest-filter">
        <input placeholder="Tìm điểm đến, tỉnh thành..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm điểm đến" />
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Lọc theo miền">
          <option value="">Tất cả miền</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {(q || region) && <button className="btn ghost btn-sm" type="button" onClick={() => { setQ(''); setRegion(''); }}>Xóa lọc</button>}
        <span className="tv-filter-count">{filtered.length}/{rows.length} điểm đến</span>
      </div>
      {error && <LoadError error={error} icon="📍" title="Không tải được danh sách điểm đến" onRetry={() => window.location.reload()} />}
      {filtered.length === 0 && !error && (
        <EmptyState icon="📍" title="Không tìm thấy điểm đến phù hợp" hint="Thử tìm kiếm với tên khác hoặc xóa bộ lọc hiện tại." />
      )}
      <div className="bento-grid tv-bento">
        {filtered.map((d, i) => {
          const fb = fallbackDestImg(d.id, i);
          return (
            <div className="card bento-item" key={d.id}>
              <Link to={`/destinations/${d.id}`} className="bento-link">
                <img
                  src={d.thumbnail || fb}
                  alt={d.name} loading="lazy" data-fallback={fb} onError={handleImgError}
                />
                <div className="dest-overlay"><b>{d.name}</b><br /><span>{[d.province, d.region].filter(Boolean).join(' • ') || 'Việt Nam'}</span></div>
                {d.tour_count != null && <span className="tv-dest-count">{d.tour_count} tour</span>}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
