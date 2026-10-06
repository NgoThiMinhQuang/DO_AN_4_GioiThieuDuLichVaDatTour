import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError } from '../components/ui.jsx';

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
      <div className="grid cols-3">
        {rows.map((d, i) => (
          <div className="card" key={d.id}>
            <div className="dest-media">
              <Link to={`/destinations/${d.id}`}>
                <img
                  src={d.thumbnail || `https://picsum.photos/seed/dest-${d.id || i}/640/400`}
                  alt={d.name} loading="lazy" data-seed={`dest-${d.id || i}`} onError={handleImgError}
                />
              </Link>
              <div className="dest-overlay"><b>{d.name}</b><br /><span>{d.province} • {d.region}</span></div>
            </div>
            <div className="card-body">
              <div className="card-title"><Link to={`/destinations/${d.id}`}>{d.name}</Link></div>
              <div className="muted">{(d.description || '').slice(0, 120)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
