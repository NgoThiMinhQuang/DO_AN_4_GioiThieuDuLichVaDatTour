import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { TourCard, ErrorBox, handleImgError, resolveArticleImg, fallbackDestImg } from '../components/ui.jsx';

const WHY_US = [
  { icon: '🛡️', title: 'Thanh toán an toàn', desc: 'Đa dạng VNPay, MoMo, chuyển khoản với xác nhận minh bạch.' },
  { icon: '🏷️', title: 'Giá tốt mỗi ngày', desc: 'Mã giảm giá, khuyến mãi theo tour giúp bạn tiết kiệm tối đa.' },
  { icon: '🗺️', title: 'Lịch trình chuẩn', desc: 'Tour thiết kế bởi chuyên gia địa phương, đánh giá thật.' },
  { icon: '🎧', title: 'Hỗ trợ 24/7', desc: 'Hotline 1900 6868 đồng hành trước, trong và sau chuyến đi.' },
];

const REVIEWS = [
  { name: 'Minh Anh', tour: 'Đà Nẵng – Hội An 4N3Đ', text: 'Đặt tour 5 phút là xong, lịch trình rõ ràng, hướng dẫn viên nhiệt tình. Rất đáng tiền!', stars: 5 },
  { name: 'Quốc Bảo', tour: 'Phú Quốc 3N2Đ', text: 'Thanh toán VNPay mượt, nhận vé ngay. Khách sạn và bữa ăn đúng như mô tả.', stars: 5 },
  { name: 'Thu Hằng', tour: 'Sa Pa – Fansipan 3N2Đ', text: 'Lần đầu đi tour mà không lo gì, bên hỗ trợ đổi lịch rất nhanh qua hotline.', stars: 4 },
];

export default function Home() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [fName, setFName] = useState('');
  const [fDest, setFDest] = useState('');
  const [fCat, setFCat] = useState('');
  const [fDate, setFDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [t, d, a, c] = await Promise.all([
          api.get('/tours', { params: { sort: 'newest', limit: 8 } }),
          api.get('/meta/destinations'),
          api.get('/meta/articles'),
          api.get('/meta/tour-categories').catch(() => ({ data: { data: [] } }))
        ]);
        setTours(t.data.data || []);
        setDestinations((d.data.data || []).slice(0, 6));
        setArticles((a.data.data || []).slice(0, 3));
        setCategories(c.data.data || []);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      }
    })();
  }, []);

  function search(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (fName.trim()) p.set('q', fName.trim());
    if (fDest) p.set('destination', fDest);
    if (fCat) p.set('category', fCat);
    if (fDate) p.set('departDate', fDate);
    const qs = p.toString();
    navigate(qs ? `/tours?${qs}` : '/tours');
  }

  return (
    <div className="container">
      <div className="hero hero-image">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">Khám phá Việt Nam</span>
          <h1>Khởi đầu hành trình đáng nhớ của bạn</h1>
          <p>Hàng trăm tour khởi hành mỗi tuần, giá minh bạch, áp mã giảm giá tự động và thanh toán an toàn.</p>
          <form className="hero-search-grid" onSubmit={search}>
            <label>Tên tour
              <input placeholder="Tên tour: Đà Nẵng, Phú Quốc..." value={fName} onChange={(e) => setFName(e.target.value)} />
            </label>
            <label>Điểm đến
              <select value={fDest} onChange={(e) => setFDest(e.target.value)}>
                <option value="">Tất cả điểm đến</option>
                {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label>Loại tour
              <select value={fCat} onChange={(e) => setFCat(e.target.value)}>
                <option value="">Tất cả loại tour</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Ngày khởi hành
              <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
            </label>
            <button className="btn" type="submit">Tìm kiếm</button>
          </form>
          <div className="tv-hero-strip">
            <span className="tv-hero-chip">✓ Giữ chỗ tức thì</span>
            <span className="tv-hero-chip">✓ Mã giảm giá mỗi ngày</span>
            <span className="tv-hero-chip">✓ Hỗ trợ 24/7</span>
          </div>
          <div className="hero-stats">
            <div><b>500+</b><span>Tour đang mở bán</span></div>
            <div><b>120K+</b><span>Lượt khách mỗi năm</span></div>
            <div><b>4.8/5</b><span>Đánh giá trung bình</span></div>
          </div>
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
          {tours.map((t, i) => <TourCard key={t.id} t={t} hot={i < 2} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <Link className="btn secondary" to="/tours">Xem tất cả tour</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Đi đâu tiếp theo?</span>
          <h2>Điểm đến được yêu thích</h2>
          <p>Từ biển đảo đến núi rừng — chọn điểm đến cho chuyến đi của bạn</p>
        </div>
        <div className="bento-grid">
          {destinations.map((d, i) => (
            <div className="card bento-item" key={d.id}>
              <Link to={`/destinations/${d.id}`} className="bento-link">
                <img
                  src={d.thumbnail || fallbackDestImg(d.id, i)}
                  alt={d.name} loading="lazy" data-fallback={fallbackDestImg(d.id, i)} onError={handleImgError}
                />
                <div className="dest-overlay">
                  <b>{d.name}</b><br />
                  <span>{d.province || d.region || 'Việt Nam'}</span>
                </div>
              </Link>
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
          <span className="eyebrow">Đánh giá thật</span>
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
            <p>Kinh nghiệm, gợi ý lịch trình và mẹo săn mã giảm giá</p>
          </div>
          <div className="grid cols-3">
            {articles.map((a) => (
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
    </div>
  );
}
