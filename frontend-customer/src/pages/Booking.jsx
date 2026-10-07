import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { formatVND, formatDateVi, friendlyError, handleImgError } from '../components/ui.jsx';

function emptyPassenger(type) {
  return { full_name: '', date_of_birth: '', gender: '', passenger_type: type, identity_number: '', nationality: '', note: '' };
}

const STEP_LABELS = ['Chọn lịch', 'Thông tin', 'Xác nhận'];
const STEP_ICONS = ['📅', '👥', '✓'];

function CountRow({ title, note, price, value, min, onChange }) {
  return (
    <div className="booking-count-list-item">
      <div className="booking-count-info">
        <p className="booking-count-title">{title}</p>
        <p className="booking-count-note">{note}</p>
      </div>
      <div className="booking-count-price-col">
        <span className="booking-count-price">{price != null ? `${formatVND(price)}/khách` : '—'}</span>
      </div>
      <div className="booking-stepper-wrap">
        <button type="button" className="booking-stepper-btn" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Giảm">−</button>
        <span className="booking-stepper-val">{value}</span>
        <button type="button" className="booking-stepper-btn" onClick={() => onChange(value + 1)} aria-label="Tăng">+</button>
      </div>
    </div>
  );
}

export default function Booking() {
  const { departureId } = useParams();
  const [search] = useSearchParams();
  const tourIdFromQuery = search.get('tourId') || '';
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [tours, setTours] = useState([]);
  const [tourId, setTourId] = useState(tourIdFromQuery);
  const [tour, setTour] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [selDep, setSelDep] = useState(departureId || '');
  const [counts, setCounts] = useState({ adultCount: 2, childCount: 0, infantCount: 0 });
  const [contact, setContact] = useState({ name: '', email: '', phone: '', address: '' });
  const [passengers, setPassengers] = useState([emptyPassenger('ADULT'), emptyPassenger('ADULT')]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/tours', { params: { limit: 50 } });
        setTours(res.data.data || []);
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (!tourId) return;
    (async () => {
      try {
        const res = await api.get(`/tours/${tourId}`);
        setTour(res.data);
        setDepartures(res.data.departures || []);
        if (!selDep && res.data.departures?.[0]) setSelDep(String(res.data.departures[0].id));
      } catch (e) {
        setError(friendlyError(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  // Sync passengers length with counts
  useEffect(() => {
    const total = Number(counts.adultCount) + Number(counts.childCount) + Number(counts.infantCount);
    setPassengers((prev) => {
      const next = [...prev];
      while (next.length < total) {
        const idx = next.length;
        const type = idx < counts.adultCount ? 'ADULT' : idx < counts.adultCount + counts.childCount ? 'CHILD' : 'INFANT';
        next.push(emptyPassenger(type));
      }
      return next.slice(0, Math.max(total, 0));
    });
  }, [counts]);

  const dep = departures.find((d) => String(d.id) === String(selDep));
  const subtotal = dep
    ? Number(counts.adultCount) * Number(dep.adult_price) + Number(counts.childCount) * Number(dep.child_price) + Number(counts.infantCount) * Number(dep.infant_price)
    : 0;
  const total = Math.max(0, subtotal - discount);

  async function validatePromo() {
    setPromoMsg('');
    if (!promoCode) { setDiscount(0); return; }
    try {
      const res = await api.post('/promotions/validate', { code: promoCode, tourId: tour?.id, subtotal });
      setDiscount(res.data.discount || 0);
      setPromoMsg(`Áp mã thành công, giảm ${formatVND(res.data.discount || 0)}`);
    } catch (e) {
      setDiscount(0);
      setPromoMsg(friendlyError(e));
    }
  }

  async function submitBooking() {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        departureId: Number(selDep),
        adultCount: Number(counts.adultCount),
        childCount: Number(counts.childCount),
        infantCount: Number(counts.infantCount),
        contact,
        passengers: passengers.map((p) => ({ ...p, name: p.full_name })),
        promotionCode: promoCode || undefined,
        note: ''
      });
      navigate(`/my-bookings/${res.data.id}`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-page">
      <div className="booking-page-container">
        <div className="booking-page-header">
          <span className="eyebrow">Đặt tour</span>
          <h2 className="booking-page-main-title">Hoàn tất đặt tour trong 3 bước</h2>
          <p className="booking-page-subtitle">Giá do hệ thống tự tính lại và kiểm tra số chỗ còn trống.</p>
        </div>

        <div className="booking-steps-wrapper">
          <div className="booking-steps-container">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`booking-step-item${step === s ? ' is-current' : ''}${step > s ? ' is-done' : ''}`}>
                {s > 1 && <span className="booking-step-connector" />}
                <span className="booking-step-icon-wrapper">
                  <span className="booking-step-icon">{step > s ? '✓' : STEP_ICONS[s - 1]}</span>
                </span>
                <span className="booking-step-label">{STEP_LABELS[s - 1]}</span>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="alert error booking-alert">{error}</div>}

        <div className="booking-content-grid">
          <div>
            {step === 1 && (
              <div className="booking-card">
                <div className="booking-card-inner">
                  <div className="booking-section-header">
                    <span className="booking-section-icon">📅</span>
                    <div>
                      <h3 className="booking-section-title">1. Chọn lịch & số khách</h3>
                      <p className="booking-section-subtitle">Chọn tour và lịch khởi hành còn chỗ.</p>
                    </div>
                  </div>
                  <div className="form">
                    <label className="booking-field-label">Tour
                      <select className="booking-select" value={tourId} onChange={(e) => setTourId(e.target.value)}>
                        <option value="">-- Chọn tour --</option>
                        {tours.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </label>
                    <label className="booking-field-label">Lịch khởi hành
                      <select className="booking-select" value={selDep} onChange={(e) => setSelDep(e.target.value)}>
                        <option value="">-- Chọn lịch khởi hành --</option>
                        {departures.map((d) => (
                          <option key={d.id} value={d.id}>
                            {formatDateVi(d.departure_date)} — còn {d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)} chỗ — {formatVND(d.adult_price)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="booking-count-list">
                      <CountRow
                        title="Người lớn"
                        note="Từ 12 tuổi trở lên"
                        price={dep?.adult_price}
                        value={Number(counts.adultCount) || 0}
                        min={1}
                        onChange={(v) => setCounts({ ...counts, adultCount: v })}
                      />
                      <CountRow
                        title="Trẻ em"
                        note="Từ 5 đến dưới 12 tuổi"
                        price={dep?.child_price}
                        value={Number(counts.childCount) || 0}
                        min={0}
                        onChange={(v) => setCounts({ ...counts, childCount: v })}
                      />
                      <CountRow
                        title="Em bé"
                        note="Dưới 5 tuổi"
                        price={dep?.infant_price}
                        value={Number(counts.infantCount) || 0}
                        min={0}
                        onChange={(v) => setCounts({ ...counts, infantCount: v })}
                      />
                    </div>
                    <div className="booking-actions-row booking-actions-row-end">
                      <button className="btn booking-primary-button" disabled={!selDep} onClick={() => setStep(2)}>Tiếp tục →</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="booking-card">
                <div className="booking-card-inner">
                  <div className="booking-section-header">
                    <span className="booking-section-icon">👥</span>
                    <div>
                      <h3 className="booking-section-title">2. Thông tin liên hệ & hành khách</h3>
                      <p className="booking-section-subtitle">Thông tin dùng để giữ chỗ và gửi xác nhận.</p>
                    </div>
                  </div>
                  <div className="form">
                    <div className="booking-passenger-form-grid" style={{ padding: 0 }}>
                      <label className="booking-field-group booking-field-span-2">Họ tên liên hệ*
                        <input className="booking-input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Nguyễn Văn A" />
                      </label>
                      <label className="booking-field-group">SĐT*
                        <input className="booking-input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="09xx xxx xxx" />
                      </label>
                      <label className="booking-field-group">Email
                        <input className="booking-input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="ban@email.com" />
                      </label>
                      <label className="booking-field-group booking-field-span-2">Địa chỉ
                        <input className="booking-input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                      </label>
                    </div>
                    <h3 className="booking-confirm-title" style={{ marginTop: 8 }}>Danh sách hành khách ({passengers.length})</h3>
                    <div className="booking-passenger-list">
                      {passengers.map((p, i) => (
                        <div className="booking-passenger-card" key={i}>
                          <div className="booking-passenger-header">
                            <p className="booking-passenger-title">Hành khách {i + 1}</p>
                          </div>
                          <div className="booking-passenger-form-grid">
                            <label className="booking-field-group booking-field-span-2">Họ tên
                              <input className="booking-input" value={p.full_name} onChange={(e) => { const n = [...passengers]; n[i].full_name = e.target.value; setPassengers(n); }} placeholder={`Khách ${i + 1}`} />
                            </label>
                            <label className="booking-field-group">Ngày sinh
                              <input className="booking-input" type="date" value={p.date_of_birth || ''} onChange={(e) => { const n = [...passengers]; n[i].date_of_birth = e.target.value; setPassengers(n); }} />
                            </label>
                            <label className="booking-field-group">Loại
                              <select className="booking-select" value={p.passenger_type} onChange={(e) => { const n = [...passengers]; n[i].passenger_type = e.target.value; setPassengers(n); }}>
                                <option value="ADULT">Người lớn</option>
                                <option value="CHILD">Trẻ em</option>
                                <option value="INFANT">Em bé</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="booking-voucher-row">
                      <label className="booking-voucher-input-wrap">Mã giảm giá (nếu có)
                        <input className="booking-input" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="VD: SALE10" />
                      </label>
                      <button type="button" className="btn booking-voucher-button" onClick={validatePromo}>Áp mã</button>
                    </div>
                    {promoMsg && <div className="alert info" style={{ marginTop: 0 }}>{promoMsg}</div>}
                    <div className="booking-actions-row">
                      <button className="btn booking-secondary-button" onClick={() => setStep(1)}>← Quay lại</button>
                      <button className="btn booking-primary-button" disabled={!contact.name || !contact.phone} onClick={() => setStep(3)}>Tiếp tục →</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="booking-card">
                <div className="booking-card-inner">
                  <div className="booking-section-header">
                    <span className="booking-section-icon">✓</span>
                    <div>
                      <h3 className="booking-section-title">3. Xác nhận đặt tour</h3>
                      <p className="booking-section-subtitle">Kiểm tra lại thông tin trước khi xác nhận.</p>
                    </div>
                  </div>
                  <div className="booking-confirm-box">
                    <h4 className="booking-confirm-title">Thông tin đặt tour</h4>
                    <div className="booking-confirm-grid">
                      <span>Tour</span><strong>{tour?.name}</strong>
                      <span>Khởi hành</span><strong>{dep ? formatDateVi(dep.departure_date) : '—'}</strong>
                      <span>Số khách</span><strong>{counts.adultCount} NL + {counts.childCount} TE + {counts.infantCount} EB</strong>
                      <span>Liên hệ</span><strong>{contact.name} — {contact.phone}</strong>
                      {promoCode && <><span>Mã giảm giá</span><strong>{promoCode} (−{formatVND(discount)})</strong></>}
                      <span>Tổng dự kiến</span><strong>{formatVND(total)}</strong>
                    </div>
                  </div>
                  <div className="booking-actions-row">
                    <button className="btn booking-secondary-button" onClick={() => setStep(2)}>← Quay lại</button>
                    <button className="btn booking-primary-button booking-primary-button-lg" disabled={submitting} onClick={submitBooking}>{submitting ? 'Đang xử lý đặt tour...' : 'Xác nhận đặt tour'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="booking-summary-card">
            <div className="booking-summary-header">
              <h3 className="booking-summary-title">Tóm tắt đặt tour</h3>
            </div>
            <div className="booking-summary-body">
              <div className="booking-summary-image-wrap">
                <img
                  className="booking-summary-image"
                  src={tour?.thumbnail || '/images/banner.jpg'}
                  alt={tour?.name || 'Tour'}
                  data-fallback="/images/banner.jpg"
                  onError={handleImgError}
                />
              </div>
              <div>
                <p className="booking-summary-tour-name">{tour?.name || 'Chưa chọn tour'}</p>
                {tour?.code && <span className="booking-summary-tour-code">{tour.code}</span>}
              </div>
              <div className="booking-summary-meta">
                <div className="summary-meta-item">
                  <span className="summary-meta-icon">📅</span>
                  <span className="summary-meta-content">
                    <span className="summary-meta-label">Ngày khởi hành</span>
                    <span className="summary-meta-value">{dep ? formatDateVi(dep.departure_date) : '—'}</span>
                  </span>
                </div>
                <div className="summary-meta-item">
                  <span className="summary-meta-icon">👥</span>
                  <span className="summary-meta-content">
                    <span className="summary-meta-label">Số khách</span>
                    <span className="summary-meta-value">{Number(counts.adultCount) + Number(counts.childCount) + Number(counts.infantCount)} khách</span>
                  </span>
                </div>
              </div>
              <div className="booking-summary-pricing-section">
                <div className="pricing-row"><span>Tạm tính</span><b>{formatVND(subtotal)}</b></div>
                <div className="pricing-row"><span>Giảm giá {promoCode ? `(${promoCode})` : ''}</span><b>−{formatVND(discount)}</b></div>
                <div className="pricing-total-box">
                  <div className="total-pricing-final">
                    <p className="total-final-label">Tổng dự kiến</p>
                    <p className="total-amount">{formatVND(total)}</p>
                  </div>
                  <span className="total-note">Giá hiển thị chỉ để tham khảo — hệ thống sẽ tính lại giá và kiểm tra số chỗ còn trống.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
