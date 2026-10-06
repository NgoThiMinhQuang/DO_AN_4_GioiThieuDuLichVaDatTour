import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, TourCard, handleImgError, fallbackDestImg } from '../components/ui.jsx';

export default function DestinationDetail() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/meta/destinations/${id}`);
        setD(res.data);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, [id]);
  if (error) return <div className="container"><ErrorBox error={error} /></div>;
  if (!d) return <div className="container"><p>Đang tải...</p></div>;
  const fb = fallbackDestImg(d.id, 0);
  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">{d.region || 'Điểm đến'}</span>
        <h2>{d.name}</h2>
        <div className="muted">{d.province} • Khí hậu: {d.climate || '—'} • Thời điểm đẹp: {d.best_time_to_visit || '—'}</div>
      </div>
      <div className="detail-hero">
        <img
          src={d.thumbnail || fb}
          alt={d.name} data-fallback={fb} onError={handleImgError}
        />
      </div>
      <div className="panel" style={{ marginTop: 16 }}><p style={{ margin: 0, lineHeight: 1.7 }}>{d.description}</p></div>
      <div className="section">
        <div className="section-head left"><span className="eyebrow">Tham quan</span><h2 style={{ fontSize: 20 }}>Địa điểm nổi bật</h2></div>
        <div className="grid cols-3">
          {(d.attractions || []).map((a) => (
            <div className="card" key={a.id}><div className="card-body"><b>{a.name}</b><div className="muted">{a.address}</div><div className="muted">{a.description}</div></div></div>
          ))}
        </div>
        {!(d.attractions || []).length && <div className="muted">Chưa có địa điểm tham quan.</div>}
      </div>
      <div className="section">
        <div className="section-head left"><span className="eyebrow">Gợi ý thêm</span><h2 style={{ fontSize: 20 }}>Tour liên quan</h2></div>
        <div className="grid tours">
          {(d.tours || []).map((t) => <TourCard key={t.id} t={t} />)}
        </div>
      </div>
      <h3>Bài viết liên quan</h3>
      {(d.articles || []).map((a) => (
        <div key={a.id} style={{ marginBottom: 6 }}><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
      ))}
    </div>
  );
}
