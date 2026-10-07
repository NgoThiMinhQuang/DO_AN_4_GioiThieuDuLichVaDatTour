import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { LoadError, handleImgError, resolveArticleImg, formatDateVi } from '../components/ui.jsx';

export default function ArticleDetail() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/meta/articles/${id}`);
        setA(res.data);
        try {
          const r = await api.get('/meta/articles');
          const rows = (r.data.data || []).filter((x) => String(x.id) !== String(id)).slice(0, 3);
          setRelated(rows);
        } catch (_) {}
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, [id]);
  if (error) {
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <LoadError error={error} icon="📰" title="Không tải được bài viết" onRetry={() => window.location.reload()}>
          <Link className="btn secondary" to="/articles">Về danh sách bài viết</Link>
        </LoadError>
      </div>
    );
  }
  if (!a) return <div className="container"><p>Đang tải...</p></div>;
  return (
    <div className="container tv-article-body">
      <div className="page-head" style={{ textAlign: 'center' }}>
        <span className="eyebrow">{a.category_name || 'Bài viết'}</span>
        <h2>{a.title}</h2>
        <div className="tv-article-meta" style={{ justifyContent: 'center' }}>
          {a.published_at && <span className="muted">Đăng ngày: {formatDateVi(a.published_at)}</span>}
          {a.author_name && <span className="muted">• Tác giả: {a.author_name}</span>}
        </div>
        <p className="muted" style={{ marginTop: 8 }}><Link to="/articles">← Về danh sách bài viết</Link></p>
      </div>
      <div className="detail-hero">
        <img
          src={resolveArticleImg(a)}
          alt={a.title} data-fallback="/images/banner.jpg" onError={handleImgError}
        />
      </div>
      <div className="tv-article-content" style={{ marginTop: 16 }}>{a.content}</div>
      {related.length > 0 && (
        <div className="section">
          <div className="section-head left"><span className="eyebrow">Đọc thêm</span><h2 style={{ fontSize: 20 }}>Bài viết liên quan</h2></div>
          <div className="grid cols-3">
            {related.map((r) => (
              <div className="card" key={r.id}>
                <Link to={`/articles/${r.id}`}>
                  <img src={resolveArticleImg(r)} alt={r.title} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError} />
                </Link>
                <div className="card-body">
                  <span className="badge">{r.category_name || 'Du lịch'}</span>
                  <div className="card-title"><Link to={`/articles/${r.id}`}>{r.title}</Link></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
