import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import {
  TourCard,
  handleImgError,
  fallbackDestImg,
  formatDateVi,
  formatVND,
} from '../components/ui.jsx';

const CAT_ICONS = ['🏖️', '⛰️', '🏛️', '🚢', '🍜', '🌿', '🏕️', '🛶'];
const CAT_THEMES = [
  { color: '#2563eb', shadow: 'rgba(37, 99, 235, 0.25)', bg: '#eff6ff', border: '#bfdbfe' },
  { color: '#059669', shadow: 'rgba(5, 150, 105, 0.25)', bg: '#ecfdf5', border: '#a7f3d0' },
  { color: '#d97706', shadow: 'rgba(217, 119, 6, 0.25)', bg: '#fffbeb', border: '#fde68a' },
  { color: '#db2777', shadow: 'rgba(219, 39, 119, 0.25)', bg: '#fdf2f8', border: '#f9a8d4' },
  { color: '#7c3aed', shadow: 'rgba(124, 58, 237, 0.25)', bg: '#f5f3ff', border: '#ddd6fe' },
  { color: '#0d9488', shadow: 'rgba(13, 148, 136, 0.25)', bg: '#f0fdfa', border: '#99f6e4' },
  { color: '#ea580c', shadow: 'rgba(234, 88, 12, 0.25)', bg: '#fff7ed', border: '#fed7aa' },
  { color: '#0284c7', shadow: 'rgba(2, 132, 199, 0.25)', bg: '#f0f9ff', border: '#bae6fd' },
];

const ABOUT_FEATURES = [
  { icon: '🎯', title: 'Kinh nghiệm', desc: '10+ năm tổ chức tour khắp Việt Nam' },
  { icon: '👥', title: 'Đội ngũ', desc: 'Hướng dẫn viên địa phương tận tâm' },
  { icon: '💰', title: 'Giá cả', desc: 'Minh bạch, ưu đãi mỗi ngày' },
  { icon: '🕑', title: 'Hỗ trợ 24/7', desc: 'Đồng hành trước, trong, sau tour' },
];

const WHY_US = [
  { icon: '🗺️', title: 'Lịch trình rõ ràng', desc: 'Từng ngày đi đâu, ăn gì, ở đâu đều ghi chi tiết. Không phát sinh mập mờ, không cắt xén điểm tham quan.' },
  { icon: '🛡️', title: 'Đặt tour an toàn', desc: 'Thanh toán VNPay, MoMo, chuyển khoản với xác nhận minh bạch. Giữ chỗ tức thì, hoàn tiền theo chính sách rõ ràng.' },
  { icon: '🎧', title: 'Hỗ trợ chuyên nghiệp', desc: 'Hotline 1900 6868 và đội ngũ tư vấn am hiểu từng tuyến. Đổi lịch, đổi thông tin linh hoạt khi cần.' },
  { icon: '⭐', title: 'Trải nghiệm tối ưu', desc: 'Khách sạn, bữa ăn, phương tiện đúng như mô tả. Hơn 120.000 lượt khách hài lòng mỗi năm.' },
];

const REVIEWS = [
  { name: 'Minh Anh', tour: 'Đà Nẵng – Hội An 4N3Đ', text: 'Đặt tour chỉ mất 5 phút, lịch trình rõ ràng từng ngày. Hướng dẫn viên nhiệt tình, khách sạn đúng như mô tả. Rất đáng tiền!', stars: 5 },
  { name: 'Quốc Bảo', tour: 'Phú Quốc 3N2Đ', text: 'Thanh toán VNPay mượt mà, nhận xác nhận giữ chỗ ngay. Bữa ăn ngon, xe đưa đón đúng giờ. Cả nhà đều hài lòng.', stars: 5 },
  { name: 'Thu Hằng', tour: 'Sa Pa – Fansipan 3N2Đ', text: 'Lần đầu đi tour mà không phải lo gì. Bên hỗ trợ đổi lịch rất nhanh qua hotline. Chắc chắn sẽ đặt tiếp!', stars: 4 },
];

const MAP_PINS = [
  { label: 'Sa Pa', top: '18%', left: '62%' },
  { label: 'Đà Nẵng', top: '52%', left: '72%' },
  { label: 'Phú Quốc', top: '78%', left: '38%' },
];

export default function Home() {
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [destTourCounts, setDestTourCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [fName, setFName] = useState('');
  const [fDest, setFDest] = useState('');
  const [fCat, setFCat] = useState('');
  const [fDate, setFDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [t, d, c] = await Promise.all([
          api.get('/tours', { params: { sort: 'popular', limit: 4 } }).catch(() => ({ data: { data: [] } })),
          api.get('/meta/destinations').catch(() => ({ data: { data: [] } })),
          api.get('/meta/tour-categories').catch(() => ({ data: { data: [] } })),
        ]);
        if (!alive) return;
        const tourRows = t.data.data || [];
        const destRows = (d.data.data || []).slice(0, 6);
        const catRows = c.data.data || [];
        setTours(tourRows);
        setDestinations(destRows);
        setCategories(catRows);

        // Đếm số tour theo từng điểm đến (lặng lẽ, không hiện lỗi)
        if (destRows.length > 0) {
          try {
            const counts = await Promise.all(
              destRows.map((dest) =>
                api
                  .get('/tours', { params: { destination: dest.id, limit: 1 } })
                  .then((r) => ({ id: dest.id, total: r.data.total ?? (r.data.data || []).length }))
                  .catch(() => ({ id: dest.id, total: null }))
              )
            );
            if (!alive) return;
            const map = {};
            counts.forEach((x) => { map[x.id] = x.total; });
            setDestTourCounts(map);
          } catch (_) { /* bỏ qua */ }
        }

        // Gom lịch khởi hành OPEN sắp tới từ chi tiết các tour (tối đa 6)
        try {
          const details = await Promise.all(
            tourRows.slice(0, 8).map((tour) =>
              api.get(`/tours/${tour.id}`).then((r) => r.data).catch(() => null)
            )
          );
          if (!alive) return;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const all = [];
          details.forEach((detail) => {
            if (!detail) return;
            (detail.departures || []).forEach((dep) => {
              const st = String(dep.status || '').toUpperCase();
              if (!['OPEN', 'ALMOST_FULL'].includes(st)) return;
              const dd = new Date(dep.departure_date);
              if (Number.isNaN(dd.getTime()) || dd < today) return;
              const remaining = dep.remaining ?? (dep.capacity - (dep.confirmed_seats || 0) - (dep.held_seats || 0));
              all.push({
                id: dep.id,
                tourId: detail.id,
                tourName: detail.name,
                date: dep.departure_date,
                remaining: Number.isFinite(Number(remaining)) ? Number(remaining) : null,
                price: dep.adult_price ?? detail.adult_price,
              });
            });
          });
          all.sort((a, b) => new Date(a.date) - new Date(b.date));
          setDepartures(all.slice(0, 6));
        } catch (_) { /* bỏ qua, hiển thị empty-state */ }
      } catch (_) { /* bỏ qua, hiển thị empty-state đẹp */ }
    })();
    return () => { alive = false; };
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
    <div className="home-tv">
      {/* 1. HERO + THANH TÌM KIẾM */}
      <section className="home-banner-wrapper">
        <div className="home-hero-container">
          <div className="home-hero-overlay" />
          <div className="home-hero-content-wrapper">
            <div className="home-hero-intro">
              <span className="home-hero-badge">
                <span className="home-hero-badge-dot" />
                Khám phá Việt Nam
              </span>
              <div className="home-hero-text-group">
                <h1 className="home-hero-title">
                  Khởi đầu hành trình{' '}
                  <span className="home-hero-title-highlight">đáng nhớ của bạn</span>
                </h1>
                <p className="home-hero-description">
                  Hàng trăm tour khởi hành mỗi tuần với lịch trình rõ ràng, giá minh bạch
                  và đội ngũ đồng hành 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm 4 ô đè dưới hero */}
        <div className="home-hero-search-wrapper">
          <form className="home-search-bar" onSubmit={search}>
            <div className="home-search-item">
              <span className="home-search-item-icon">⌕</span>
              <div className="home-search-item-content">
                <label htmlFor="home-search-name">Tên tour</label>
                <input
                  id="home-search-name"
                  className="home-search-native-input"
                  placeholder="Đà Nẵng, Phú Quốc..."
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>
            </div>
            <div className="home-search-divider" />
            <div className="home-search-item">
              <span className="home-search-item-icon">📍</span>
              <div className="home-search-item-content">
                <label htmlFor="home-search-dest">Điểm đến</label>
                <select
                  id="home-search-dest"
                  className="home-search-native-input"
                  value={fDest}
                  onChange={(e) => setFDest(e.target.value)}
                >
                  <option value="">Tất cả điểm đến</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="home-search-divider" />
            <div className="home-search-item">
              <span className="home-search-item-icon">🧭</span>
              <div className="home-search-item-content">
                <label htmlFor="home-search-cat">Loại tour</label>
                <select
                  id="home-search-cat"
                  className="home-search-native-input"
                  value={fCat}
                  onChange={(e) => setFCat(e.target.value)}
                >
                  <option value="">Tất cả loại tour</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="home-search-divider" />
            <div className="home-search-item">
              <span className="home-search-item-icon">📅</span>
              <div className="home-search-item-content">
                <label htmlFor="home-search-date">Ngày khởi hành</label>
                <input
                  id="home-search-date"
                  type="date"
                  className="home-search-native-input"
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                />
              </div>
            </div>
            <div className="home-search-action">
              <button className="home-search-btn" type="submit">
                <span className="home-search-btn-icon">⌕</span> Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container">
        {/* 2. VỀ CHÚNG TÔI */}
        <section className="section tv-about">
          <div className="tv-about-text">
            <span className="eyebrow">Về chúng tôi</span>
            <h2>Khám Phá Thế Giới Cùng Travel Viet</h2>
            <p>
              Travel Viet là nền tảng giới thiệu du lịch và đặt tour trực tuyến,
              kết nối bạn với những hành trình khắp Việt Nam — từ biển đảo
              trong xanh đến núi rừng hùng vĩ.
            </p>
            <p>
              Mỗi tour đều được thiết kế bởi chuyên gia địa phương với lịch trình
              chi tiết từng ngày, giá trọn gói minh bạch và chính sách đổi lịch
              linh hoạt, để bạn yên tâm tận hưởng từng khoảnh khắc.
            </p>
            <div className="tv-about-stats">
              <div><b>10+</b><span>Năm kinh nghiệm</span></div>
              <div><b>500+</b><span>Tour đang mở bán</span></div>
              <div><b>120K+</b><span>Lượt khách mỗi năm</span></div>
            </div>
            <div className="tv-about-features">
              {ABOUT_FEATURES.map((f) => (
                <div className="tv-about-feature" key={f.title}>
                  <span className="tv-about-feature-icon">{f.icon}</span>
                  <div><b>{f.title}</b><span>{f.desc}</span></div>
                </div>
              ))}
            </div>
            <Link className="btn secondary" to="/tours">Khám phá thêm</Link>
          </div>
          <div className="tv-about-media">
            <img src="/images/tours/bien.jpg" alt="Biển Việt Nam" loading="lazy" data-fallback="/images/banner.jpg" onError={handleImgError} />
            <div className="tv-about-badge tv-about-badge-1">
              <b>10+</b><span>Năm kinh nghiệm</span>
            </div>
            <div className="tv-about-badge tv-about-badge-2">
              <b>🏆</b><span>Giải Thưởng<br />Du lịch 2025</span>
            </div>
          </div>
        </section>

        {/* 3. TOUR NỔI BẬT */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Gợi ý hôm nay</span>
            <h2>Tour nổi bật</h2>
            <p>Những hành trình được yêu thích nhất tuần này</p>
          </div>
          {tours.length > 0 ? (
            <>
              <div className="grid tours">
                {tours.slice(0, 4).map((t) => <TourCard key={t.id} t={t} hot={!!t.is_featured} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 22 }}>
                <Link className="btn secondary" to="/tours">Xem tất cả tour</Link>
              </div>
            </>
          ) : (
            <div className="tv-empty">
              <div className="tv-empty-icon">🧳</div>
              <b>Chưa có tour nào đang mở bán</b>
              <p>Hiện tại chưa có tour phù hợp. Vui lòng quay lại sau hoặc khám phá các điểm đến hấp dẫn.</p>
              <Link className="btn secondary" to="/destinations">Khám phá điểm đến</Link>
            </div>
          )}
        </section>

        {/* 4. PHONG CÁCH DU LỊCH */}
        {categories.length > 0 && (
          <section className="section category-section">
            <div className="section-head">
              <span className="eyebrow">Đa dạng lựa chọn</span>
              <h2>Khám phá theo phong cách du lịch bạn yêu thích</h2>
              <p>Chọn loại tour phù hợp với sở thích của bạn</p>
            </div>
            <div className="category-grid">
              {categories.map((c, i) => {
                const theme = CAT_THEMES[i % CAT_THEMES.length];
                const icon = CAT_ICONS[i % CAT_ICONS.length];
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="category-modern-card"
                    style={{
                      '--theme-color': theme.color,
                      '--theme-shadow': theme.shadow,
                      background: theme.bg,
                      borderColor: theme.border,
                    }}
                    onClick={() => navigate(`/tours?category=${c.id}`)}
                  >
                    <span className="category-bg-icon" aria-hidden="true">{icon}</span>
                    <span className="category-card-header">
                      <span className="category-status-tag active">Đang mở</span>
                      <span className="category-card-icon">{icon}</span>
                    </span>
                    <span className="category-card-body">
                      <span className="category-modern-title">{c.name}</span>
                      {c.description && <span className="category-modern-description">{c.description}</span>}
                    </span>
                    <span className="category-card-footer">
                      <span className="category-action-text">Khám phá ngay</span>
                      <span className="category-action-icon-wrapper">
                        <span className="category-action-icon">→</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. ĐIỂM ĐẾN PHỔ BIẾN */}
        {destinations.length > 0 && (
          <section className="section popular-destinations-section">
            <div className="section-head">
              <span className="eyebrow">Đi đâu tiếp theo?</span>
              <h2>Điểm đến phổ biến</h2>
              <p>Từ biển đảo đến núi rừng — chọn điểm đến cho chuyến đi của bạn</p>
            </div>
            <div className="popular-destinations-bento">
              {destinations.map((d, i) => {
                const sizeClass = i % 5 === 0 ? 'large-wide' : i % 5 === 3 ? 'large-tall' : 'small';
                const imgSrc = d.thumbnail || fallbackDestImg(d.id, i);
                return (
                  <Link key={d.id} to={`/destinations/${d.id}`} className={`destination-card ${sizeClass}`}>
                    <span className="destination-image-wrapper">
                      <img
                        className="destination-image"
                        src={imgSrc}
                        alt={d.name}
                        loading="lazy"
                        data-fallback={fallbackDestImg(d.id, i)}
                        onError={handleImgError}
                      />
                      <span className="destination-overlay" />
                    </span>
                    <span className="destination-info">
                      <span className="destination-badge">{d.province || d.region || 'Việt Nam'}</span>
                      <span className="destination-details">
                        <span className="destination-name">{d.name}</span>
                        <span className="destination-action">
                          Khám phá <span className="destination-icon">→</span>
                        </span>
                      </span>
                    </span>
                    {destTourCounts[d.id] != null && (
                      <span className="destination-count">{destTourCounts[d.id]} tour</span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <Link className="btn secondary" to="/destinations">Khám phá điểm đến</Link>
            </div>
          </section>
        )}

        {/* 6. BẢN ĐỒ DU LỊCH */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Bản đồ tương tác</span>
            <h2>Khám Phá Bản Đồ Du Lịch Việt Nam</h2>
            <p>Chạm vào từng điểm ghim để xem tour nổi bật theo vùng miền</p>
          </div>
          <div className="tv-map">
            <div className="tv-map-art" aria-hidden="true">
              <span className="tv-map-shape" />
              {MAP_PINS.map((p) => (
                <span key={p.label} className="tv-map-pin" style={{ top: p.top, left: p.left }}>
                  <span className="tv-map-pin-dot">📍</span>
                  <span className="tv-map-pin-label">{p.label}</span>
                </span>
              ))}
            </div>
            <div className="tv-map-info">
              <h3>Ba miền — một hành trình</h3>
              <p>
                Từ Sa Pa mờ sương, Đà Nẵng rực rỡ đến Phú Quốc trong xanh —
                mỗi điểm ghim là một vùng đất với những tour được yêu thích nhất.
              </p>
              <ul className="tv-map-list">
                <li><b>Miền Bắc</b> — núi rừng, di sản và văn hóa ngàn năm</li>
                <li><b>Miền Trung</b> — biển xanh, phố cổ và lễ hội rực rỡ</li>
                <li><b>Miền Nam</b> — sông nước, đảo ngọc và ẩm thực đậm đà</li>
              </ul>
              <Link className="btn tv-map-btn" to="/destinations">Xem Bản Đồ Đầy Đủ</Link>
            </div>
          </div>
        </section>

        {/* 7. LỊCH KHỞI HÀNH SẮP TỚI */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Giữ chỗ sớm</span>
            <h2>Lịch khởi hành sắp tới</h2>
            <p>Những chuyến đi gần nhất còn giữ chỗ — đặt sớm để có giá tốt</p>
          </div>
          {departures.length > 0 ? (
            <>
            <div className="tv-dep-grid">
              {departures.map((dep) => (
                <div className="tv-dep-card" key={dep.id}>
                  <div className="tv-dep-date">
                    <b>{formatDateVi(dep.date)}</b>
                    {dep.remaining != null && <span>Còn {dep.remaining} chỗ</span>}
                  </div>
                  <div className="tv-dep-body">
                    <Link className="tv-dep-name" to={`/tours/${dep.tourId}`}>{dep.tourName}</Link>
                    <div className="tv-dep-meta">
                      {dep.price != null && <span className="price">{formatVND(dep.price)}</span>}
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={() => navigate(`/booking/${dep.id}?tourId=${dep.tourId}`)}>
                    Đặt ngay
                  </button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <Link className="btn secondary" to="/lich-khoi-hanh">Xem tất cả lịch khởi hành</Link>
            </div>
            </>
          ) : (
            <div className="tv-empty">
              <div className="tv-empty-icon">📅</div>
              <b>Chưa có lịch khởi hành nào sắp tới</b>
              <p>Các tour mới đang được cập nhật lịch. Hãy xem chi tiết từng tour để nhận thông báo mở bán sớm nhất.</p>
              <Link className="btn secondary" to="/tours">Xem tất cả tour</Link>
            </div>
          )}
        </section>

        {/* 8. VÌ SAO TIN TƯỞNG */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Cam kết của chúng tôi</span>
            <h2>Vì sao hàng ngàn khách hàng tin tưởng chúng tôi</h2>
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

        {/* 9. REVIEW */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Đánh giá thật</span>
            <h2>Khách hàng nói gì về chúng tôi</h2>
            <p>Hơn 120.000 lượt khách đã đồng hành cùng Travel Viet</p>
          </div>
          <div className="grid cols-3">
            {REVIEWS.map((r) => (
              <div className="review-card tv-review" key={r.name}>
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

        {/* 10. CTA BAND */}
        <div className="cta-band tv-cta">
          <div>
            <h3>Bạn cần tư vấn để chọn tour, lịch khởi hành hoặc ngân sách phù hợp?</h3>
            <p>Đội ngũ Travel Viet luôn sẵn sàng hỗ trợ — hotline 1900 6868 (24/7).</p>
          </div>
          <div className="tv-cta-actions">
            <Link className="btn btn-lg tv-cta-primary" to="/tours">Tìm tour ngay →</Link>
            <a className="btn btn-lg secondary" href="tel:19006868">Gọi 1900 6868</a>
          </div>
        </div>
      </div>
    </div>
  );
}
