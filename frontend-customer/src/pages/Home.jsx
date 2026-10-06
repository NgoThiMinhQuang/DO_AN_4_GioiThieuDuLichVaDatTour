import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { TourCard, ErrorBox, handleImgError, tourImg } from '../components/ui.jsx';

const WHY_US = [
  { icon: '🛡️', title: 'Thanh toán an toàn', desc: 'Đa dạng VNPay, MoMo, chuyển khoản với xác nhận minh bạch.' },
  { icon: '🏷️', title: 'Giá tốt mỗi ngày', desc: 'Voucher, khuyến mãi theo tour giúp bạn tiết kiệm tối đa.' },
  { icon: '🗺️', title: 'Lịch trình chuẩn', desc: 'Tour thiết kế bởi chuyên gia địa phương, review thật.' },
  { icon: '🎧', title: 'Hỗ trợ 24/7', desc: 'Hotline 1900 6868 đồng hành trước, trong và sau chuyến đi.' },
];

const REVIEWS = [
  { name: 'Minh Anh', tour: 'Đà Nẵng – Hội An 4N3Đ', text: 'Đặt tour 5 phút là xong, lịch trình rõ ràng, hướng dẫn viên nhiệt tình. Rất đáng tiền!', stars: 5 },
  { name: 'Quốc Bảo', tour: 'Phú Quốc 3N2Đ', text: 'Thanh toán VNPay mượt, nhận vé ngay. Khách sạn và bữa ăn đúng như mô tả.', stars: 5 },
  { name: 'Thu Hằng', tour: 'Sapa – Fansipan 3N2Đ', text: 'Lần đầu đi tour mà không lo gì, bên hỗ trợ đổi lịch rất nhanh qua hotline.', stars: 4 },
];

export default function Home() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const navigate = useNavigate();

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
        setArticles((a.data.data || []).slice(0, 3));
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      }
    })();
  }, []);

  function search(e) {
    e.preventDefault();
    navigate(q ? `/tours?q=${encodeURIComponent(q)}` : '/tours');
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>Khám phá Việt Nam — Đặt tour dễ dàng</h1>
        <p>Hàng trăm tour khởi hành mỗi tuần, giá minh bạch, áp voucher tự động và thanh toán an toàn.</p>
        <form className="hero-search" onSubmit={search}>
          <input placeholder="Tìm tour: Đà Nẵng, Phú Quốc, Sapa..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn" type="submit">Tìm kiếm</button>
        </form>
        <div className="tv-hero-strip">
          <span className="tv-hero-chip">✓ Giữ chỗ tức thì</span>
          <span className="tv-hero-chip">✓ Voucher mỗi ngày</span>
          <span className="tv-hero-chip">✓ Hỗ trợ 24/7</span>
        </div>
        <div className="hero-stats">
          <div><b>500+</b><span>Tour đang mở bán</span></div>
          <div><b>120K+</b><span>Lượt khách mỗi năm</span></div>
          <div><b>4.8/5</b><span>Đánh giá trung bình</span></div>
        </div>
      </div>

      <ErrorBox error={error} />

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Gợi ý hôm nay</span>
          <h2>Tour nổi bật</h2>
          <p>Những hành trình được yêu thích nhất tuần này</p>
        </div>
        <div className="grid tours">
          {tours.map((t) => <TourCard key={t.id} t={t} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <Link className="btn secondary" to="/tours">Xem tất cả tours</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Đi đâu tiếp theo?</span>
          <h2>Điểm đến được yêu thích</h2>
          <p>Từ biển đảo đến núi rừng — chọn điểm đến cho chuyến đi của bạn</p>
        </div>
        <div className="grid cols-3">
          {destinations.map((d, i) => (
            <div className="card" key={d.id}>
              <div className="dest-media">
                <Link to={`/destinations/${d.id}`}>
                  <img
                    src={d.thumbnail || `https://picsum.photos/seed/dest-${d.id || i}/640/400`}
                    alt={d.name} loading="lazy" data-seed={`dest-${d.id || i}`} onError={handleImgError}
                  />
                </Link>
                <div className="dest-overlay">
                  <b>{d.name}</b><br />
                  <span>{d.province || d.region || 'Việt Nam'}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="card-title"><Link to={`/destinations/${d.id}`}>{d.name}</Link></div>
                <div className="muted">{(d.description || '').slice(0, 90)}{(d.description || '').length > 90 ? '...' : ''}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <Link className="btn secondary" to="/destinations">Khám phá điểm đến</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Cam kết của chúng tôi</span>
          <h2>Vì sao chọn TravelViet?</h2>
          <p>Đặt tour trực tuyến nhanh chóng, minh bạch và an tâm</p>
        </div>
        <div className="feature-grid">
          {WHY_US.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <b>{f.title}</b>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Review thật</span>
          <h2>Khách hàng nói gì?</h2>
          <p>Hơn 120.000 lượt khách đã đồng hành cùng TravelViet</p>
        </div>
        <div className="grid cols-3">
          {REVIEWS.map((r) => (
            <div className="review-card" key={r.name}>
              <div className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
              <p>“{r.text}”</p>
              <div className="review-who">
                <span className="user-avatar">{r.name.charAt(0)}</span>
                <div><b>{r.name}</b><span>{r.tour}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Cẩm nang du lịch</span>
            <h2>Bài viết mới</h2>
            <p>Kinh nghiệm, gợi ý lịch trình và mẹo săn voucher</p>
          </div>
          <div className="grid cols-3">
            {articles.map((a, i) => (
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
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link className="btn secondary" to="/articles">Xem tất cả bài viết</Link>
          </div>
        </section>
      )}

      <div className="cta-band">
        <div>
          <h3>Sẵn sàng cho chuyến đi tiếp theo?</h3>
          <p>Đặt tour hôm nay — giữ chỗ tức thì, hỗ trợ đổi lịch linh hoạt.</p>
        </div>
        <Link className="btn btn-lg" to="/tours">Tìm tour ngay →</Link>
      </div>
      <div style={{ display: 'none' }}>{tourImg({})}</div>
    </div>
  );
}
