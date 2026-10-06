import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox } from '../components/ui.jsx';

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
      <h2>Bài viết du lịch</h2>
      <ErrorBox error={error} />
      <div className="grid cols-3">
        {rows.map((a) => (
          <div className="card" key={a.id}>
            {a.thumbnail && <img src={a.thumbnail} alt={a.title} />}
            <div className="card-body">
              <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
              <div className="muted">{a.category_name || ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
