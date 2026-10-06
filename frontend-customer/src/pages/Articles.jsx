import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError } from '../components/ui.jsx';

export default function Articles() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/meta/articles');
        setRows(res.data.data || []);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);
  return (
    <div className="container">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Cẩm nang du lịch</span>
        <h2>Bài viết &amp; kinh nghiệm</h2>
        <p>Gợi ý lịch trình, mẹo săn voucher và review điểm đến.</p>
      </div>
      <ErrorBox error={error} />
      <div className="grid cols-3">
        {rows.map((a, i) => (
          <div className="card" key={a.id}>
            <Link to={`/articles/${a.id}`}>
              <img
                src={a.thumbnail || `https://picsum.photos/seed/art-${a.id || i}/640/400`}
                alt={a.title} loading="lazy" data-seed={`art-${a.id || i}`} onError={handleImgError}
              />
            </Link>
            <div className="card-body">
              <span className="badge">{a.category_name || 'Du lịch'}</span>
              <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
