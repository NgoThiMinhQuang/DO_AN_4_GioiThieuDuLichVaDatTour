import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, handleImgError, resolveArticleImg, formatDateVi } from '../components/ui.jsx';

export default function ArticleDetail() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/meta/articles/${id}`);
        setA(res.data);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, [id]);
  if (error) return <div className="container"><ErrorBox error={error} /></div>;
  if (!a) return <div className="container"><p>Đang tải...</p></div>;
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <span className="eyebrow">{a.category_name || 'Bài viết'}</span>
        <h2>{a.title}</h2>
        <div className="muted">{a.published_at ? `Đăng ngày: ${formatDateVi(a.published_at)}` : ''}</div>
      </div>
      <div className="detail-hero">
        <img
          src={resolveArticleImg(a)}
          alt={a.title} data-fallback="/images/banner.jpg" onError={handleImgError}
        />
      </div>
      <div className="panel" style={{ marginTop: 16, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{a.content}</div>
    </div>
  );
}
