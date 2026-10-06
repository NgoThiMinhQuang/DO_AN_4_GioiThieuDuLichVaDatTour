import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { TourCard, ErrorBox } from '../components/ui.jsx';

export default function Home() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [t, d, a] = await Promise.all([
          api.get('/tours', { params: { sort: 'newest', limit: 8 } }),
          api.get('/meta/destinations'),
          api.get('/meta/articles')
        ]);
        setTours(t.data.data || []);
        setDestinations((d.data.data || []).slice(0, 6));
        setArticles((a.data.data || []).slice(0, 6));
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>Khám phá Việt Nam — Đặt tour dễ dàng</h1>
        <p>Tour → Departure → Booking → Payment. Tìm kiếm, lọc tour, chọn lịch khởi hành còn chỗ, áp voucher và thanh toán.</p>
        <Link className="btn" to="/tours">Tìm tour ngay</Link>
      </div>
      <ErrorBox error={error} />
      <section className="section">
        <h2>Tour nổi bật</h2>
        <div className="grid tours">
          {tours.map((t) => <TourCard key={t.id} t={t} />)}
        </div>
      </section>
      <section className="section">
        <h2>Điểm đến</h2>
        <div className="grid cols-3">
          {destinations.map((d) => (
            <div className="card" key={d.id}>
              {d.thumbnail && <img src={d.thumbnail} alt={d.name} />}
              <div className="card-body">
                <div className="card-title"><Link to={`/destinations/${d.id}`}>{d.name}</Link></div>
                <div className="muted">{d.province || d.region || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Bài viết mới</h2>
        <div className="grid cols-3">
          {articles.map((a) => (
            <div className="card" key={a.id}>
              {a.thumbnail && <img src={a.thumbnail} alt={a.title} />}
              <div className="card-body">
                <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
                <div className="muted">{a.category_name || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
