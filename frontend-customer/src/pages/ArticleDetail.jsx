import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox } from '../components/ui.jsx';

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
    <div className="container">
      <h2>{a.title}</h2>
      <div className="muted">{a.category_name || ''} • {a.published_at ? new Date(a.published_at).toLocaleDateString('vi-VN') : ''}</div>
      {a.thumbnail && <img className="detail-img" src={a.thumbnail} alt={a.title} style={{ marginTop: 12 }} />}
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{a.content}</div>
    </div>
  );
}
