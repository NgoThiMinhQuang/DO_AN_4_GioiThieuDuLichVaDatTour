import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState, LoadError, formatDateVi, friendlyError } from '../components/ui.jsx';

const TYPE_OPTIONS = [
  { value: 'BOOKING', label: 'Đặt tour' },
  { value: 'PAYMENT', label: 'Thanh toán' },
  { value: 'TOUR_INFO', label: 'Thông tin tour' },
  { value: 'COMPLAINT', label: 'Khiếu nại' },
  { value: 'OTHER', label: 'Khác' },
];

const TYPE_ICONS = { BOOKING: '🧾', PAYMENT: '💳', TOUR_INFO: '🧭', COMPLAINT: '⚠️', OTHER: '💬' };

function typeVi(t) {
  const found = TYPE_OPTIONS.find((o) => o.value === String(t || '').toUpperCase());
  return found ? found.label : (t || '—');
}

function ticketStatusVi(s) {
  const v = String(s || '').toUpperCase();
  const map = {
    OPEN: 'Mới tiếp nhận',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CLOSED: 'Đã đóng',
  };
  return map[v] || s || '—';
}

function ticketStatusClass(s) {
  const v = String(s || '').toUpperCase();
  if (['RESOLVED', 'CLOSED'].includes(v)) return 'badge green';
  if (['IN_PROGRESS'].includes(v)) return 'badge amber';
  if (['OPEN'].includes(v)) return 'badge';
  return 'badge';
}

export default function LienHe() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'TOUR_INFO', title: '', content: '', bookingId: '' });
  const [bookings, setBookings] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  async function loadMine() {
    try {
      const res = await api.get('/support/my');
      setRows(res.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadMine();
    (async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data.data || []);
      } catch (_) { /* không có booking vẫn gửi được yêu cầu */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('Vui lòng nhập tiêu đề và nội dung yêu cầu.');
      return;
    }
    setSending(true);
    try {
      const payload = {
        contact_name: form.name.trim() || undefined,
        contact_email: form.email.trim() || undefined,
        contact_phone: form.phone.trim() || undefined,
        type: form.type,
        title: form.title.trim(),
        content: form.content.trim(),
        booking_id: form.bookingId || undefined,
      };
      const res = await api.post('/support', payload);
      setSuccess(`Đã gửi yêu cầu ${res.data.ticket_code || ''} — chúng tôi sẽ phản hồi sớm nhất.`);
      setForm((prev) => ({ ...prev, title: '', content: '', bookingId: '' }));
      loadMine();
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setSending(false);
    }
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-head">
          <span className="eyebrow">Hỗ trợ</span>
          <h2>Liên hệ với chúng tôi</h2>
          <p>Gửi yêu cầu hỗ trợ về đặt tour, thanh toán hoặc thông tin tour.</p>
        </div>
        <div className="tv-empty">
          <div className="tv-empty-icon">💬</div>
          <b>Đăng nhập để gửi yêu cầu hỗ trợ</b>
          <p>Đăng nhập để gửi yêu cầu và theo dõi phản hồi từ đội ngũ TravelViet.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn" to="/login">Đăng nhập</Link>
            <Link className="btn secondary" to="/register">Đăng ký</Link>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 16 }}>
          <b>Kênh hỗ trợ nhanh</b>
          <div className="muted" style={{ marginTop: 8 }}>
            📞 Hotline 24/7: <b>1900 6868</b> • ✉️ Email: <b>hotro@travelviet.vn</b> • 📍 12 Nguyễn Huệ, Q.1, TP.HCM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <div className="page-head">
        <span className="eyebrow">Hỗ trợ</span>
        <h2>Liên hệ với chúng tôi</h2>
        <p>Gửi yêu cầu hỗ trợ — đội ngũ TravelViet phản hồi trong giờ làm việc, hotline 1900 6868 (24/7).</p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Gửi yêu cầu mới</h3>
        {formError && <div className="alert error">{formError}</div>}
        {success && <div className="alert success">{success}</div>}
        <form className="form" onSubmit={submit}>
          <div className="form-row">
            <label>Họ tên
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
            </label>
            <label>Số điện thoại
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09xx xxx xxx" />
            </label>
          </div>
          <div className="form-row">
            <label>Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@email.com" />
            </label>
            <label>Loại yêu cầu
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          <label>Đơn đặt tour liên quan (nếu có)
            <select value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })}>
              <option value="">— Không liên quan đơn nào —</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_code} — {b.tour_name || ''}{b.departure_date ? ` (${formatDateVi(b.departure_date)})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>Tiêu đề
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Muốn đổi ngày khởi hành đơn TV-..." maxLength={255} />
          </label>
          <label>Nội dung
            <textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Mô tả chi tiết yêu cầu của bạn..." />
          </label>
          <div>
            <button className="btn" type="submit" disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
          </div>
        </form>
      </div>

      <div className="page-head" style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 20 }}>Yêu cầu đã gửi của tôi ({rows.length})</h2>
        <p>Theo dõi trạng thái xử lý và phản hồi từ quản trị viên.</p>
      </div>
      {error && <LoadError error={error} icon="💬" title="Không tải được yêu cầu đã gửi" onRetry={() => loadMine()} />}
      {rows.length === 0 && !error && (
        <EmptyState icon="💬" title="Bạn chưa gửi yêu cầu nào" hint="Gửi biểu mẫu phía trên nếu cần hỗ trợ về đặt tour hoặc thanh toán." />
      )}
      <div className="tv-booking-cards">
        {rows.map((t) => (
          <div className="tv-booking-card" key={t.id} style={{ alignItems: 'flex-start' }}>
            <div className="tv-notif-icon">{TYPE_ICONS[String(t.type || '').toUpperCase()] || '💬'}</div>
            <div className="tv-booking-card-main">
              <div><b>{t.ticket_code}</b> — {t.title}</div>
              <div className="muted">{typeVi(t.type)} • {t.created_at ? formatDateVi(t.created_at) : ''}</div>
              <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{t.content}</div>
              {t.admin_reply && (
                <div className="alert info" style={{ margin: '10px 0 0' }}>
                  <b>Phản hồi từ TravelViet:</b>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{t.admin_reply}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <span className={ticketStatusClass(t.status)}>{ticketStatusVi(t.status)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
