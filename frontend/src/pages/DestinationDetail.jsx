import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND } from '../components/ui.jsx';

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
  return (
    <div className="container">
      <h2>{d.name}</h2>
      <div className="muted">{d.province} • {d.region} • Khí hậu: {d.climate || '—'} • Thời điểm đẹp: {d.best_time_to_visit || '—'}</div>
      {d.thumbnail && <img className="detail-img" src={d.thumbnail} alt={d.name} style={{ marginTop: 12 }} />}
      <p>{d.description}</p>
      <h3>Địa điểm tham quan</h3>
      <div className="grid cols-3">
        {(d.attractions || []).map((a) => (
          <div className="card" key={a.id}><div className="card-body"><b>{a.name}</b><div className="muted">{a.address}</div><div className="muted">{a.description}</div></div></div>
        ))}
      </div>
      <h3>Tour liên quan</h3>
      <div className="grid cols-3">
        {(d.tours || []).map((t) => (
          <div className="card" key={t.id}><div className="card-body"><Link to={`/tours/${t.id}`}>{t.name}</Link><div className="price">{formatVND(t.adult_price)}</div></div></div>
        ))}
      </div>
      <h3>Bài viết liên quan</h3>
      {(d.articles || []).map((a) => (
        <div key={a.id}><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
      ))}
    </div>
  );
}
