import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ErrorBox } from '../../components/ui.jsx';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const TYPES = ['', 'BOOKING', 'PAYMENT', 'TOUR_INFO', 'COMPLAINT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const REPLY_STATUSES = ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_VI = { OPEN: 'Mới', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã giải quyết', CLOSED: 'Đã đóng' };
const TYPE_VI = { BOOKING: 'Đặt tour', PAYMENT: 'Thanh toán', TOUR_INFO: 'Thông tin tour', COMPLAINT: 'Khiếu nại', OTHER: 'Khác' };
const PRIORITY_VI = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao' };

function priorityTone(p) {
  const v = String(p || '').toUpperCase();
  if (v === 'HIGH') return 'badge b-red';
  if (v === 'MEDIUM') return 'badge b-amber';
  return 'badge b-gray';
}

function supportTone(s) {
  const v = String(s || '').toUpperCase();
  if (v === 'OPEN') return 'badge b-amber';
  if (v === 'IN_PROGRESS') return 'badge b-blue';
  if (v === 'RESOLVED') return 'badge b-green';
  return 'badge b-gray';
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 16).replace('T', ' ');
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ADMIN: tiếp nhận, gán người xử lý và phản hồi yêu cầu hỗ trợ của khách hàng
export default function AdminSupport() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyStatus, setReplyStatus] = useState('IN_PROGRESS');
  const [replyContent, setReplyContent] = useState('');
  const [replyPriority, setReplyPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
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
    setSelected(t);
    setReplyStatus(t.status === 'OPEN' ? 'IN_PROGRESS' : t.status);
    setReplyContent('');
    setReplyPriority(t.priority || 'MEDIUM');
    setAssignee(t.assigned_to ? String(t.assigned_to) : '');
    setMsg('');
  }

  async function sendReply() {
    if (!selected) return;
    if (!replyContent.trim()) {
      setMsg('Vui lòng nhập nội dung phản hồi trước khi gửi.');
      return;
    }
    setSending(true);
    setMsg('');
    try {
      const body = { status: replyStatus, admin_reply: replyContent.trim(), priority: replyPriority };
      if (assignee !== '') {
        const n = Number(assignee);
        if (!Number.isInteger(n) || n <= 0) {
          setMsg('Người xử lý phải là ID nhân viên (số nguyên dương).');
          setSending(false);
          return;
        }
        body.assigned_to = n;
      }
      await api.patch(`/admin/support/${selected.id}`, body);
      setMsg(`Đã phản hồi yêu cầu ${selected.ticket_code} → “${STATUS_VI[replyStatus] || replyStatus}”.`);
      setReplyContent('');
      setSelected(null);
      load();
    } catch (e) { setMsg(e.response?.data?.message || e.message); }
    finally { setSending(false); }
  }

  const openCount = rows.filter((r) => ['OPEN', 'IN_PROGRESS'].includes(String(r.status || '').toUpperCase())).length;

  return (
    <div>
      <div className="tv-pagehead page-header">
        <div><h2>Hỗ trợ khách hàng</h2><p>{openCount} chờ xử lý / {rows.length} yêu cầu — tiếp nhận, gán người xử lý và phản hồi.</p></div>
        <div className="page-actions">
          <span className="badge b-blue">{rows.length} yêu cầu</span>
          <button className="btn secondary sm" onClick={load}>Tải lại</button>
        </div>
      </div>
      <ErrorBox error={error} />
      {msg && <div className="alert info">{msg}</div>}
      <div className="filters">
        <b>Bộ lọc yêu cầu hỗ trợ</b>
        <div className="form-row">
          <input placeholder="🔍 Tìm theo mã / tiêu đề / tên / email..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === '' ? 'Tất cả trạng thái' : STATUS_VI[s]}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t === '' ? 'Tất cả loại' : TYPE_VI[t]}</option>)}
          </select>
          <button className="btn sm" onClick={load}>Tìm kiếm</button>
        </div>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Mã</th><th>Khách hàng</th><th>Loại</th><th>Tiêu đề</th><th>Ưu tiên</th><th>Trạng thái</th><th>Người xử lý</th><th>Chi tiết</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={8}><div className="tv-empty">Chưa có yêu cầu hỗ trợ nào.</div></td></tr>}
          {rows.map((t) => (
            <tr key={t.id}>
              <td><b>{t.ticket_code}</b></td>
              <td><div>{t.contact_name || '—'}</div><div className="muted">{t.contact_email || t.contact_phone || ''}</div></td>
              <td>{TYPE_VI[t.type] || t.type || '—'}</td>
              <td><div>{t.title}</div><div className="muted">{t.booking_code ? `Đơn ${t.booking_code}` : fmtDate(t.created_at)}</div></td>
              <td><span className={priorityTone(t.priority)}>{PRIORITY_VI[t.priority] || t.priority || '—'}</span></td>
              <td><span className={supportTone(t.status)}>{STATUS_VI[t.status] || t.status || '—'}</span></td>
              <td>{t.assigned_to ? `#${t.assigned_to}` : '—'}</td>
              <td><button className="btn secondary sm" onClick={() => openDetail(t)}>Xem</button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Chi tiết yêu cầu {selected.ticket_code}</h3>
              <button className="btn ghost sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
            <div className="modal-body">
              <div className="details-card">
                <div className="details-grid">
                  <div><span>Mã yêu cầu</span><b>{selected.ticket_code}</b></div>
                  <div><span>Khách hàng</span><b>{selected.contact_name || '—'} ({selected.contact_phone || '—'})</b></div>
                  <div><span>Email</span><b>{selected.contact_email || '—'}</b></div>
                  <div><span>Loại</span><b>{TYPE_VI[selected.type] || selected.type || '—'}</b></div>
                  <div><span>Đơn liên quan</span><b>{selected.booking_code || (selected.booking_id ? `#${selected.booking_id}` : '—')}</b></div>
                  <div><span>Gửi lúc</span><b>{fmtDate(selected.created_at)}</b></div>
                </div>
              </div>
              <div className="details-card">
                <div className="details-grid">
                  <div><span>Tiêu đề</span><b>{selected.title}</b></div>
                  <div><span>Nội dung</span><b style={{ fontWeight: 400 }}>{selected.content}</b></div>
                  <div><span>Phản hồi trước đó</span><b style={{ fontWeight: 400 }}>{selected.admin_reply || 'Chưa có phản hồi'}</b></div>
                  <div><span>Người đang xử lý</span><b>{selected.assigned_to ? `#${selected.assigned_to}` : 'Chưa gán'}</b></div>
                </div>
              </div>
              <div className="form-grid-2">
                <label>Trạng thái xử lý
                  <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                    {REPLY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_VI[s]}</option>)}
                  </select>
                </label>
                <label>Mức ưu tiên
                  <select value={replyPriority} onChange={(e) => setReplyPriority(e.target.value)}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_VI[p]}</option>)}
                  </select>
                </label>
              </div>
              <label>Gán người xử lý (ID nhân viên)
                <input type="number" min="1" placeholder="Ví dụ: 2 (để trống là giữ nguyên)" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
              </label>
              <label>Nội dung phản hồi
                <textarea placeholder="Nhập nội dung phản hồi gửi khách hàng..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
              </label>
            </div>
            <div className="modal-foot">
              <button className="btn secondary sm" onClick={() => setSelected(null)}>Đóng</button>
              <button className="btn sm" onClick={sendReply} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi phản hồi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
