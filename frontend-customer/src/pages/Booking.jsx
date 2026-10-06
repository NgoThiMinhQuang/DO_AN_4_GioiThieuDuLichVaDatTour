import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND, formatDateVi } from '../components/ui.jsx';

function emptyPassenger(type) {
  return { full_name: '', date_of_birth: '', gender: '', passenger_type: type, identity_number: '', nationality: '', note: '' };
}

const STEP_LABELS = ['Chọn lịch', 'Thông tin', 'Xác nhận'];

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
        setError(e.response?.data?.message || e.message);
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
      setPromoMsg(e.response?.data?.message || e.message);
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
      setError(e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 1020 }}>
      <div className="page-head">
        <span className="eyebrow">Đặt tour</span>
        <h2>Hoàn tất đặt tour trong 3 bước</h2>
        <p>Giá do hệ thống tự tính lại và kiểm tra số chỗ còn trống.</p>
      </div>
      <div className="steps booking-steps">
        {[1, 2, 3].map((s) => (
          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className={`step${step === s ? ' active' : ''}${step > s ? ' done' : ''}`}>
              <span className="step-num">{step > s ? '✓' : s}</span> {STEP_LABELS[s - 1]}
            </span>
            {s < 3 && <span className="step-sep">→</span>}
          </span>
        ))}
      </div>
      <ErrorBox error={error} />

      <div className="grid cols-2 booking-layout tv-booking-grid" style={{ alignItems: 'start' }}>
        <div className="panel">
          {step === 1 && (
            <div className="form">
              <h3 style={{ margin: '0 0 4px' }}>1. Chọn lịch & số khách</h3>
              <p className="muted" style={{ margin: 0 }}>Chọn tour và lịch khởi hành còn chỗ.</p>
              <label>Tour
                <select value={tourId} onChange={(e) => setTourId(e.target.value)}>
                  <option value="">-- Chọn tour --</option>
                  {tours.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>Lịch khởi hành
                <select value={selDep} onChange={(e) => setSelDep(e.target.value)}>
                  <option value="">-- Chọn lịch khởi hành --</option>
                  {departures.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDateVi(d.departure_date)} — còn {d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)} chỗ — {formatVND(d.adult_price)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-row">
                <label>Người lớn<input type="number" min="1" value={counts.adultCount} onChange={(e) => setCounts({ ...counts, adultCount: Number(e.target.value) })} /></label>
                <label>Trẻ em<input type="number" min="0" value={counts.childCount} onChange={(e) => setCounts({ ...counts, childCount: Number(e.target.value) })} /></label>
                <label>Em bé<input type="number" min="0" value={counts.infantCount} onChange={(e) => setCounts({ ...counts, infantCount: Number(e.target.value) })} /></label>
              </div>
              <div><button className="btn" disabled={!selDep} onClick={() => setStep(2)}>Tiếp tục →</button></div>
            </div>
          )}

          {step === 2 && (
            <div className="form">
              <h3 style={{ margin: '0 0 4px' }}>2. Thông tin liên hệ & hành khách</h3>
              <p className="muted" style={{ margin: 0 }}>Thông tin dùng để giữ chỗ và gửi xác nhận.</p>
              <div className="form-row">
                <label>Họ tên liên hệ*<input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Nguyễn Văn A" /></label>
                <label>SĐT*<input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="09xx xxx xxx" /></label>
              </div>
              <div className="form-row">
                <label>Email<input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="ban@email.com" /></label>
                <label>Địa chỉ<input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></label>
              </div>
              <h3>Danh sách hành khách ({passengers.length})</h3>
              {passengers.map((p, i) => (
                <div className="tv-pax-card form-row" key={i}>
                  <label>Họ tên<input value={p.full_name} onChange={(e) => { const n = [...passengers]; n[i].full_name = e.target.value; setPassengers(n); }} placeholder={`Khách ${i + 1}`} /></label>
                  <label>Ngày sinh<input type="date" value={p.date_of_birth || ''} onChange={(e) => { const n = [...passengers]; n[i].date_of_birth = e.target.value; setPassengers(n); }} /></label>
                  <label>Loại
                    <select value={p.passenger_type} onChange={(e) => { const n = [...passengers]; n[i].passenger_type = e.target.value; setPassengers(n); }}>
                      <option value="ADULT">Người lớn</option>
                      <option value="CHILD">Trẻ em</option>
                      <option value="INFANT">Em bé</option>
                    </select>
                  </label>
                </div>
              ))}
              <label>Mã giảm giá (nếu có)
                <div className="tv-promo-row">
                  <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="VD: SALE10" />
                  <button type="button" className="btn secondary" onClick={validatePromo} style={{ flex: '0 0 auto' }}>Áp mã</button>
                </div>
              </label>
              {promoMsg && <div className="alert info" style={{ margin: 0 }}>{promoMsg}</div>}
              <div className="form-row">
                <button className="btn secondary" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn" disabled={!contact.name || !contact.phone} onClick={() => setStep(3)}>Tiếp tục →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form">
              <h3 style={{ margin: '0 0 4px' }}>3. Xác nhận đặt tour</h3>
              <p className="muted" style={{ margin: 0 }}>Kiểm tra lại thông tin trước khi xác nhận.</p>
              <div className="card"><div className="card-body">
                <div><b>Tour:</b> {tour?.name}</div>
                <div><b>Khởi hành:</b> {dep ? formatDateVi(dep.departure_date) : '—'}</div>
                <div><b>Khách:</b> {counts.adultCount} NL + {counts.childCount} TE + {counts.infantCount} EB</div>
                <div><b>Liên hệ:</b> {contact.name} — {contact.phone}</div>
                {promoCode && <div><b>Mã giảm giá:</b> {promoCode} (−{formatVND(discount)})</div>}
                <div><b>Tổng dự kiến:</b> <span className="price">{formatVND(total)}</span></div>
              </div></div>
              <div className="form-row">
                <button className="btn secondary" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn" disabled={submitting} onClick={submitBooking}>{submitting ? 'Đang xử lý đặt tour...' : 'Xác nhận đặt tour'}</button>
              </div>
            </div>
          )}
        </div>

        <div className="panel tv-summary" style={{ position: 'sticky', top: 84 }}>
          <h3 style={{ marginTop: 0 }}>Tóm tắt đặt tour</h3>
          <div className="muted">{tour?.name || 'Chưa chọn tour'}</div>
          {dep && <div className="muted">Khởi hành: {formatDateVi(dep.departure_date)} • {counts.adultCount + counts.childCount + counts.infantCount} khách</div>}
          <div style={{ margin: '10px 0', borderTop: '1px dashed #e2e8f0', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="tv-summary-row"><span>Tạm tính</span><b>{formatVND(subtotal)}</b></div>
            <div className="tv-summary-row"><span>Giảm giá {promoCode ? `(${promoCode})` : ''}</span><b>−{formatVND(discount)}</b></div>
            <div className="tv-summary-row total"><span>Tổng dự kiến</span><span className="price">{formatVND(total)}</span></div>
          </div>
          <div className="tv-promo-row" style={{ marginBottom: 10 }}>
            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Nhập mã giảm giá" aria-label="Mã giảm giá" />
            <button type="button" className="btn secondary btn-sm" onClick={validatePromo} style={{ flex: '0 0 auto' }}>Áp mã</button>
          </div>
          <div className="alert info" style={{ marginBottom: 0 }}>Giá hiển thị chỉ để tham khảo — hệ thống sẽ tính lại giá và kiểm tra số chỗ còn trống.</div>
        </div>
      </div>
    </div>
  );
}
