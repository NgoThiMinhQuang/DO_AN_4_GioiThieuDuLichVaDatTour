import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import { ErrorBox, formatVND } from '../components/ui.jsx';

function emptyPassenger(type) {
  return { full_name: '', date_of_birth: '', gender: '', passenger_type: type, identity_number: '', nationality: '', note: '' };
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
    <div className="container" style={{ maxWidth: 860 }}>
      <h2>Đặt tour</h2>
      <div className="steps">
        {[1, 2, 3, 4].map((s) => (
          <span key={s} className={`step${step === s ? ' active' : ''}`}>
            {s === 1 ? '1. Chọn lịch & số khách' : s === 2 ? '2. Liên hệ & hành khách' : s === 3 ? '3. Voucher' : '4. Xác nhận'}
          </span>
        ))}
      </div>
      <ErrorBox error={error} />
      <div className="alert info">Giá hiển thị chỉ tham khảo — server tự tính lại giá và kiểm tra số chỗ (BR35-BR37).</div>

      {step === 1 && (
        <div className="form">
          <label>Tour
            <select value={tourId} onChange={(e) => setTourId(e.target.value)}>
              <option value="">-- Chọn tour --</option>
              {tours.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label>Lịch khởi hành
            <select value={selDep} onChange={(e) => setSelDep(e.target.value)}>
              <option value="">-- Chọn departure --</option>
              {departures.map((d) => (
                <option key={d.id} value={d.id}>
                  {new Date(d.departure_date).toLocaleDateString('vi-VN')} — còn {d.remaining ?? (d.capacity - d.confirmed_seats - d.held_seats)} chỗ — {formatVND(d.adult_price)}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>Người lớn<input type="number" min="1" value={counts.adultCount} onChange={(e) => setCounts({ ...counts, adultCount: Number(e.target.value) })} /></label>
            <label>Trẻ em<input type="number" min="0" value={counts.childCount} onChange={(e) => setCounts({ ...counts, childCount: Number(e.target.value) })} /></label>
            <label>Em bé<input type="number" min="0" value={counts.infantCount} onChange={(e) => setCounts({ ...counts, infantCount: Number(e.target.value) })} /></label>
          </div>
          <div><button className="btn" disabled={!selDep} onClick={() => setStep(2)}>Tiếp tục</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="form">
          <div className="form-row">
            <label>Họ tên liên hệ*<input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label>
            <label>SĐT*<input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label>
          </div>
          <div className="form-row">
            <label>Email<input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
            <label>Địa chỉ<input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></label>
          </div>
          <h3>Danh sách hành khách ({passengers.length})</h3>
          {passengers.map((p, i) => (
            <div className="form-row" key={i}>
              <label>Họ tên<input value={p.full_name} onChange={(e) => { const n = [...passengers]; n[i].full_name = e.target.value; setPassengers(n); }} /></label>
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
          <div className="form-row">
            <button className="btn secondary" onClick={() => setStep(1)}>Quay lại</button>
            <button className="btn" disabled={!contact.name || !contact.phone} onClick={() => setStep(3)}>Tiếp tục</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form">
          <label>Mã voucher (POST /api/promotions/validate)
            <div className="form-row">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="VD: SALE10" />
              <button type="button" className="btn secondary" onClick={validatePromo}>Áp mã</button>
            </div>
          </label>
          {promoMsg && <div className="alert info">{promoMsg}</div>}
          <div className="card"><div className="card-body">
            <div>Tạm tính: <b>{formatVND(subtotal)}</b></div>
            <div>Giảm giá: <b>{formatVND(discount)}</b></div>
            <div>Tổng dự kiến: <b className="price">{formatVND(total)}</b></div>
          </div></div>
          <div className="form-row">
            <button className="btn secondary" onClick={() => setStep(2)}>Quay lại</button>
            <button className="btn" onClick={() => setStep(4)}>Tiếp tục</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="form">
          <div className="card"><div className="card-body">
            <div><b>Tour:</b> {tour?.name}</div>
            <div><b>Khởi hành:</b> {dep ? new Date(dep.departure_date).toLocaleDateString('vi-VN') : '—'}</div>
            <div><b>Khách:</b> {counts.adultCount} NL + {counts.childCount} TE + {counts.infantCount} EB</div>
            <div><b>Liên hệ:</b> {contact.name} — {contact.phone}</div>
            <div><b>Tổng dự kiến:</b> <span className="price">{formatVND(total)}</span></div>
          </div></div>
          <div className="form-row">
            <button className="btn secondary" onClick={() => setStep(3)}>Quay lại</button>
            <button className="btn" disabled={submitting} onClick={submitBooking}>{submitting ? 'Đang tạo booking...' : 'Xác nhận đặt tour (POST /bookings)'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
