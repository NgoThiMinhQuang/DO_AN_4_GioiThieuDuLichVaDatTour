import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError, resolveArticleImg, formatDateVi } from '../components/ui.jsx';

export default function Articles() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/meta/articles');
        setRows(res.data.data || []);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((a) => [a.title, a.category_name, a.summary, a.excerpt].filter(Boolean).join(' ').toLowerCase().includes(needle));
  }, [rows, q]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="container">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Cẩm nang du lịch</span>
        <h2>Bài viết &amp; kinh nghiệm</h2>
        <p>Gợi ý lịch trình, mẹo săn mã giảm giá và đánh giá điểm đến.</p>
      </div>
      <div className="tv-dest-filter" style={{ maxWidth: 640, margin: '0 auto 20px' }}>
        <input placeholder="Tìm bài viết..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm bài viết" />
        <span className="tv-filter-count">{filtered.length}/{rows.length} bài viết</span>
      </div>
      <ErrorBox error={error} />
      {filtered.length === 0 && !error && <div className="empty-box">Chưa có bài viết nào.</div>}
      {featured && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="grid cols-2" style={{ gap: 0 }}>
            <Link to={`/articles/${featured.id}`} style={{ display: 'block', minHeight: 240 }}>
              <img
                src={resolveArticleImg(featured)}
                alt={featured.title} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError}
                style={{ width: '100%', height: '100%', minHeight: 240, objectFit: 'cover', aspectRatio: 'auto' }}
              />
            </Link>
            <div className="card-body" style={{ justifyContent: 'center', padding: 28 }}>
              <span className="badge">{featured.category_name || 'Du lịch'}</span>
              <div className="card-title" style={{ fontSize: 20 }}><Link to={`/articles/${featured.id}`}>{featured.title}</Link></div>
              {(featured.summary || featured.excerpt) && <div className="muted">{(featured.summary || featured.excerpt).slice(0, 160)}...</div>}
              {featured.published_at && <div className="muted">Đăng ngày: {formatDateVi(featured.published_at)}</div>}
              <div><Link className="btn btn-sm" to={`/articles/${featured.id}`}>Đọc bài viết →</Link></div>
            </div>
          </div>
        </div>
      )}
      <div className="grid cols-3">
        {(rest.length > 0 ? rest : featured ? [] : filtered).map((a) => (
          <div className="card tv-article-card" key={a.id}>
            <div className="dest-media">
              <Link to={`/articles/${a.id}`}>
                <img
                  src={resolveArticleImg(a)}
                  alt={a.title} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError}
                />
              </Link>
            </div>
            <div className="card-body">
              <div className="tv-article-meta">
                <span className="badge">{a.category_name || 'Du lịch'}</span>
                {a.published_at && <span className="muted">{formatDateVi(a.published_at)}</span>}
              </div>
              <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
              {(a.summary || a.excerpt) && <div className="muted">{(a.summary || a.excerpt).slice(0, 110)}...</div>}
            </div>
          </div>
        ))}
      </div>
      {featured && rest.length === 0 && filtered.length === 1 && null}
    </div>
  );
}
