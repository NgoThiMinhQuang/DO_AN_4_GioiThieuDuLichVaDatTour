import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox } from '../components/ui.jsx';

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
      <h2>Điểm đến</h2>
      <ErrorBox error={error} />
      <div className="grid cols-3">
        {rows.map((d) => (
          <div className="card" key={d.id}>
            {d.thumbnail && <img src={d.thumbnail} alt={d.name} />}
            <div className="card-body">
              <div className="card-title"><Link to={`/destinations/${d.id}`}>{d.name}</Link></div>
              <div className="muted">{d.province} • {d.region}</div>
              <div className="muted">{(d.description || '').slice(0, 120)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
