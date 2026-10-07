import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { LoadError, TourCard, handleImgError, fallbackDestImg, resolveArticleImg, formatDateVi } from '../components/ui.jsx';

const TABS = [
  { id: 'intro', label: 'Giới thiệu' },
  { id: 'places', label: 'Địa điểm' },
  { id: 'tours', label: 'Tour liên quan' },
  { id: 'articles', label: 'Bài viết' },
];

export default function DestinationDetail() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('intro');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/meta/destinations/${id}`);
        setD(res.data);
      } catch (e) { setError(e.response?.data?.message || e.message); }
    })();
  }, [id]);
  if (error) {
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <LoadError error={error} icon="📍" title="Không tải được điểm đến" onRetry={() => window.location.reload()}>
          <Link className="btn secondary" to="/destinations">Về danh sách điểm đến</Link>
        </LoadError>
      </div>
    );
  }
  if (!d) return <div className="container"><p>Đang tải...</p></div>;
  const fb = fallbackDestImg(d.id, 0);
  const tours = d.tours || [];
  const attractions = d.attractions || [];
  const articles = d.articles || [];
  return (
    <div className="container">
      <div className="tv-dest-hero">
        <img
          src={d.thumbnail || fb}
          alt={d.name} data-fallback={fb} onError={handleImgError}
        />
        <div className="tv-dest-hero-overlay" />
        <div className="tv-dest-hero-text">
          <span className="eyebrow" style={{ color: '#bfdbfe' }}>{d.region || 'Điểm đến'}</span>
          <h2>{d.name}</h2>
          <p>{d.province} • Khí hậu: {d.climate || '—'} • Thời điểm đẹp: {d.best_time_to_visit || '—'}</p>
        </div>
      </div>
      <div className="page-head" style={{ marginBottom: 0 }}>
        <span className="eyebrow">{d.region || 'Điểm đến'}</span>
        <h2 style={{ display: 'none' }}>{d.name}</h2>
      </div>
      <div className="tv-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tv-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'places' && attractions.length > 0 && ` (${attractions.length})`}
            {t.id === 'tours' && tours.length > 0 && ` (${tours.length})`}
            {t.id === 'articles' && articles.length > 0 && ` (${articles.length})`}
          </button>
        ))}
      </div>

      {tab === 'intro' && (
        <div className="panel"><p style={{ margin: 0, lineHeight: 1.75 }}>{d.description || 'Chưa có mô tả chi tiết.'}</p></div>
      )}

      {tab === 'places' && (
        <div>
          <div className="section-head left"><span className="eyebrow">Tham quan</span><h2 style={{ fontSize: 20 }}>Địa điểm nổi bật</h2></div>
          {attractions.length === 0 && <div className="muted">Chưa có địa điểm tham quan.</div>}
          <div className="grid cols-3">
            {attractions.map((a) => (
              <div className="card" key={a.id}>
                {a.thumbnail && <img src={a.thumbnail} alt={a.name} loading="lazy" data-fallback={fb} onError={handleImgError} />}
                <div className="card-body"><b>{a.name}</b><div className="muted">{a.address}</div><div className="muted">{a.description}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tours' && (
        <div>
          <div className="section-head left"><span className="eyebrow">Gợi ý thêm</span><h2 style={{ fontSize: 20 }}>Tour liên quan</h2></div>
          {tours.length === 0 && <div className="muted">Chưa có tour nào cho điểm đến này.</div>}
          <div className="grid tours">
            {tours.map((t) => <TourCard key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {tab === 'articles' && (
        <div>
          <div className="section-head left"><span className="eyebrow">Cẩm nang</span><h2 style={{ fontSize: 20 }}>Bài viết liên quan</h2></div>
          {articles.length === 0 && <div className="muted">Chưa có bài viết liên quan.</div>}
          <div className="tv-related-list">
            {articles.map((a) => (
              <Link key={a.id} to={`/articles/${a.id}`}>
                <b style={{ color: '#0f172a' }}>{a.title}</b>
                {a.published_at && <div className="muted">{formatDateVi(a.published_at)}</div>}
              </Link>
            ))}
          </div>
          {articles.length > 0 && (
            <div className="grid cols-3" style={{ marginTop: 16 }}>
              {articles.slice(0, 3).map((a) => (
                <div className="card" key={`card-${a.id}`}>
                  <Link to={`/articles/${a.id}`}>
                    <img src={resolveArticleImg(a)} alt={a.title} loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError} />
                  </Link>
                  <div className="card-body">
                    <div className="card-title"><Link to={`/articles/${a.id}`}>{a.title}</Link></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
