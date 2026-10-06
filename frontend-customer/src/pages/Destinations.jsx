import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError, fallbackDestImg } from '../components/ui.jsx';

export default function Destinations() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/meta/destinations');
        setRows(res.data.data || []);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);
  return (
    <div className="container">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Đi đâu tiếp theo?</span>
        <h2>Điểm đến nổi bật</h2>
        <p>Từ biển đảo đến núi rừng — chọn điểm đến cho chuyến đi của bạn.</p>
      </div>
      <ErrorBox error={error} />
      {rows.length === 0 && !error && <div className="empty-box">Chưa có điểm đến nào.</div>}
      <div className="bento-grid">
        {rows.map((d, i) => {
          const fb = fallbackDestImg(d.id, i);
          return (
            <div className="card bento-item" key={d.id}>
              <Link to={`/destinations/${d.id}`} className="bento-link">
                <img
                  src={d.thumbnail || fb}
                  alt={d.name} loading="lazy" data-fallback={fb} onError={handleImgError}
                />
                <div className="dest-overlay"><b>{d.name}</b><br /><span>{[d.province, d.region].filter(Boolean).join(' • ') || 'Việt Nam'}</span></div>
              </Link>
              <div className="card-body">
                <div className="card-title"><Link to={`/destinations/${d.id}`}>{d.name}</Link></div>
                <div className="muted">{(d.description || '').slice(0, 120)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
