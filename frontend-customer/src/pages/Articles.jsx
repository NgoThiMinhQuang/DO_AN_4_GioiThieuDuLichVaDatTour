import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError, resolveArticleImg, formatDateVi } from '../components/ui.jsx';

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
        <p>Gợi ý lịch trình, mẹo săn mã giảm giá và đánh giá điểm đến.</p>
      </div>
      <ErrorBox error={error} />
      {rows.length === 0 && !error && <div className="empty-box">Chưa có bài viết nào.</div>}
      <div className="grid cols-3">
        {rows.map((a) => (
          <div className="card" key={a.id}>
            <Link to={`/articles/${a.id}`}>
              <img
                src={resolveArticleImg(a)}
                alt={a.title} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError}
              />
            </Link>
            <div className="card-body">
              <span className="badge">{a.category_name || 'Du lịch'}</span>
              <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
              {a.published_at && <div className="muted">Đăng ngày: {formatDateVi(a.published_at)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
