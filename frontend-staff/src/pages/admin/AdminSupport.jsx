import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox } from '../../components/ui.jsx';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const TYPES = ['', 'BOOKING', 'PAYMENT', 'TOUR_INFO', 'COMPLAINT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const REPLY_STATUSES = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_VI = {
  OPEN: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
};

const TYPE_VI = {
  BOOKING: 'Đặt tour',
  PAYMENT: 'Thanh toán',
  TOUR_INFO: 'Thông tin tour',
  COMPLAINT: 'Khiếu nại',
  OTHER: 'Khác',
};

const PRIORITY_VI = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
};

function statusBadge(s) {
  const v = String(s || '').toUpperCase();
  if (v === 'OPEN') return 'badge b-pending';
  if (v === 'IN_PROGRESS') return 'badge b-info';
  if (v === 'RESOLVED') return 'badge b-success';
  return 'badge b-neutral';
}

function priorityBadge(p) {
  const v = String(p || '').toUpperCase();
  if (v === 'HIGH') return 'badge b-danger';
  if (v === 'MEDIUM') return 'badge b-pending';
  return 'badge b-neutral';
}

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 16).replace('T', ' ');
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// STAFF: tiep nhan va phan hoi yeu cau ho tro cua khach hang
export default function AdminSupport() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyStatus, setReplyStatus] = useState('IN_PROGRESS');
  const [replyContent, setReplyContent] = useState('');
  const [replyPriority, setReplyPriority] = useState('MEDIUM');
  const [sending, setSending] = useState(false);

  async function load() {
    setError('');
    try {
      const res = await api.get('/admin/support', {
        params: { q: q || undefined, status: status || undefined, type: type || undefined },
      });
      setRows(res.data.data || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
  }
  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  function openDetail(t) {
    setSelectedId(t.id);
    setDetail(t);
    setReplyStatus(t.status === 'OPEN' ? 'IN_PROGRESS' : t.status);
    setReplyContent('');
    setReplyPriority(t.priority || 'MEDIUM');
    setMsg('');
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
  }

  async function sendReply() {
    if (!detail) return;
    if (!replyContent.trim()) {
      setMsg('Vui lòng nhập nội dung phản hồi trước khi gửi.');
      return;
    }
    setSending(true);
    setMsg('');
    try {
      await api.patch(`/admin/support/${detail.id}`, {
        status: replyStatus,
        admin_reply: replyContent.trim(),
        priority: replyPriority,
      });
      setMsg(`Đã phản hồi yêu cầu ${detail.ticket_code} → ${STATUS_VI[replyStatus] || replyStatus}`);
      setReplyContent('');
      closeDetail();
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
    finally { setSending(false); }
  }

  const openCount = rows.filter((r) => ['OPEN', 'IN_PROGRESS'].includes(String(r.status || '').toUpperCase())).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>💬 Hỗ trợ khách hàng</h2>
          <p>Tiếp nhận yêu cầu hỗ trợ, xem chi tiết và phản hồi khách hàng.</p>
        </div>
        <div className="admin-page-header-actions">
          <span className="page-head-count">💬 {openCount} chờ xử lý / {rows.length} yêu cầu</span>
          <button className="admin-filter-button" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="admin-filter-toolbar is-compact">
        <div className="admin-filter-field">
          <input placeholder="🔍 Tìm mã / tiêu đề / tên / email..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-filter-field">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : STATUS_VI[s]}</option>)}
          </select>
        </div>
        <div className="admin-filter-field">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t === '' ? 'Tất cả loại' : TYPE_VI[t]}</option>)}
          </select>
        </div>
        <button className="admin-primary-button" onClick={load}>Tìm kiếm</button>
      </div>
      <div className="admin-page-card"><table className="admin-table">
        <thead><tr><th>Mã</th><th>Khách hàng</th><th>Loại</th><th>Tiêu đề</th><th>Ưu tiên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={7}>
              <div className="admin-empty-block">
                <div className="admin-empty-icon">💬</div>
                <b>Chưa có yêu cầu hỗ trợ nào</b>
                <p>Thử đổi từ khóa hoặc bộ lọc rồi bấm “Tìm kiếm”.</p>
              </div>
            </td></tr>
          )}
          {rows.map((t) => (
            <tr key={t.id}>
              <td><span className="table-code">{t.ticket_code}</span></td>
              <td>
                <div className="admin-table-stack">
                  <span>{t.contact_name || '—'}</span>
                  <span className="admin-muted">{t.contact_email || t.contact_phone || ''}</span>
                </div>
              </td>
              <td>{TYPE_VI[t.type] || t.type || '—'}</td>
              <td>
                <div className="admin-table-stack">
                  <span>{t.title}</span>
                  <span className="admin-muted">{t.booking_code ? `Đơn ${t.booking_code}` : fmtDate(t.created_at)}</span>
                </div>
              </td>
              <td><span className={priorityBadge(t.priority)}>{PRIORITY_VI[t.priority] || t.priority || '—'}</span></td>
              <td><span className={statusBadge(t.status)}>{STATUS_VI[t.status] || t.status || '—'}</span></td>
              <td>
                <div className="admin-inline-actions">
                  <button className="admin-filter-button" onClick={() => openDetail(t)}>Xem</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {selectedId && detail && (
        <div className="admin-details-card">
          <h4>📄 Chi tiết yêu cầu {detail.ticket_code}</h4>
          <div className="admin-inline-actions" style={{ marginBottom: 10 }}>
            <button className="admin-filter-button" onClick={closeDetail}>Đóng chi tiết</button>
          </div>
          <div className="admin-details-grid">
            <div className="admin-details-item"><small>Mã yêu cầu</small><span>{detail.ticket_code}</span></div>
            <div className="admin-details-item"><small>Khách hàng</small><span>{detail.contact_name || '—'} ({detail.contact_phone || '—'})</span></div>
            <div className="admin-details-item"><small>Email</small><span>{detail.contact_email || '—'}</span></div>
            <div className="admin-details-item"><small>Loại</small><span>{TYPE_VI[detail.type] || detail.type || '—'}</span></div>
            <div className="admin-details-item"><small>Đơn liên quan</small><span>{detail.booking_code || (detail.booking_id ? `#${detail.booking_id}` : '—')}</span></div>
            <div className="admin-details-item"><small>Gửi lúc</small><span>{fmtDate(detail.created_at)}</span></div>
          </div>
          <div className="admin-details-grid" style={{ marginTop: 10 }}>
            <div className="admin-details-item"><small>Tiêu đề</small><span>{detail.title}</span></div>
            <div className="admin-details-item"><small>Nội dung</small><span>{detail.content}</span></div>
            <div className="admin-details-item"><small>Phản hồi trước đó</small><span>{detail.admin_reply || 'Chưa có phản hồi'}</span></div>
          </div>
          <div className="sub-head"><h3>Phản hồi khách hàng</h3></div>
          <div className="admin-filter-toolbar">
            <div className="admin-filter-field">
              <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                {REPLY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_VI[s]}</option>)}
              </select>
            </div>
            <div className="admin-filter-field">
              <select value={replyPriority} onChange={(e) => setReplyPriority(e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>Ưu tiên: {PRIORITY_VI[p]}</option>)}
              </select>
            </div>
            <div className="admin-filter-field full-width">
              <input placeholder="Nhập nội dung phản hồi gửi khách hàng..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
            </div>
            <button className="admin-primary-button" onClick={sendReply} disabled={sending}>
              {sending ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </div>
      )}
      <div className="admin-details-card">
        <h4>📌 Lưu ý nghiệp vụ hỗ trợ</h4>
        <div className="admin-details-grid">
          <div className="admin-details-item"><small>Quy trình</small><span>Mới → Đang xử lý → Đã giải quyết / Đã đóng</span></div>
          <div className="admin-details-item"><small>Thông báo</small><span>Khách hàng nhận thông báo khi yêu cầu được cập nhật</span></div>
        </div>
      </div>
    </div>
  );
}
