const express = require('express');
const crypto = require('crypto');
const { query } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// STAFF duoc doc booking; moi thu khac can ADMIN
router.use(requireAuth);
router.use((req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/bookings')) {
    if (!['STAFF', 'ADMIN'].includes(req.user.role)) return res.status(403).json({ message: 'Khong co quyen' });
    return next();
  }
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Can quyen ADMIN' });
  return next();
});

async function audit(userId, action, entityType, entityId, oldV, newV) {
  try {
    await query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value) VALUES (?,?,?,?,?,?)',
      [userId, action, entityType, entityId, oldV ? JSON.stringify(oldV).slice(0, 4000) : null, newV ? JSON.stringify(newV).slice(0, 4000) : null]);
  } catch (_) {}
}

// ---- Generic CRUD helper cho destinations / attractions / articles / tour-categories ----
function crud(table, fields) {
  const r = express.Router();
  r.get('/', async (req, res) => {
    try {
      const rows = await query(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 100`);
      return res.json({ data: rows });
    } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
  });
  r.post('/', async (req, res) => {
    try {
      const vals = fields.map((f) => req.body[f] ?? null);
      const ins = await query(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, vals);
      await audit(req.user.id, 'CREATE', table, ins.insertId, null, req.body);
      return res.status(201).json({ id: ins.insertId });
    } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
  });
  r.put('/:id', async (req, res) => {
    try {
      const old = await query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [req.params.id]);
      const set = fields.filter((f) => req.body[f] !== undefined);
      if (!set.length) return res.status(400).json({ message: 'Khong co gi de cap nhat' });
      await query(`UPDATE ${table} SET ${set.map((f) => `${f} = ?`).join(',')} WHERE id = ?`,
        [...set.map((f) => req.body[f]), req.params.id]);
      await audit(req.user.id, 'UPDATE', table, req.params.id, old[0], req.body);
      return res.json({ message: 'Cap nhat thanh cong' });
    } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
  });
  r.delete('/:id', async (req, res) => {
    try {
      await query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      await audit(req.user.id, 'DELETE', table, req.params.id, null, null);
      return res.json({ message: 'Da xoa' });
    } catch (e) {
      if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ message: 'Du lieu da duoc su dung, nen an thay vi xoa (BR31-BR33)' });
      return res.status(500).json({ message: 'Loi server', error: e.message });
    }
  });
  return r;
}

router.use('/destinations', crud('destinations', ['name', 'province', 'region', 'description', 'highlights', 'climate', 'best_time_to_visit', 'thumbnail', 'status']));
router.use('/attractions', crud('attractions', ['destination_id', 'name', 'address', 'description', 'opening_hours', 'ticket_price', 'thumbnail', 'status']));
router.use('/articles', crud('articles', ['category_id', 'destination_id', 'author_id', 'title', 'slug', 'thumbnail', 'content', 'status', 'published_at']));
router.use('/tour-categories', crud('tour_categories', ['name', 'description', 'status']));

// ---- Tours (+images, itinerary, departures) ----
router.get('/tours', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM tours ORDER BY id DESC LIMIT 100');
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/tours', async (req, res) => {
  try {
    const f = ['category_id', 'code', 'name', 'departure_location', 'duration_days', 'duration_nights', 'transport', 'description', 'adult_price', 'child_price', 'infant_price', 'included_services', 'excluded_services', 'policy', 'cancellation_policy', 'minimum_guests', 'thumbnail', 'status'];
    const ins = await query(`INSERT INTO tours (${f.join(',')}) VALUES (${f.map(() => '?').join(',')})`, f.map((k) => req.body[k] ?? null));
    const tourId = ins.insertId;
    if (Array.isArray(req.body.destination_ids)) {
      for (let i = 0; i < req.body.destination_ids.length; i++) {
        await query('INSERT IGNORE INTO tour_destinations (tour_id, destination_id, sort_order) VALUES (?,?,?)', [tourId, req.body.destination_ids[i], i]);
      }
    }
    await audit(req.user.id, 'CREATE', 'tours', tourId, null, req.body);
    return res.status(201).json({ id: tourId });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.put('/tours/:id', async (req, res) => {
  try {
    const old = await query('SELECT * FROM tours WHERE id = ? LIMIT 1', [req.params.id]);
    if (!old.length) return res.status(404).json({ message: 'Khong tim thay tour' });
    const f = ['category_id', 'code', 'name', 'departure_location', 'duration_days', 'duration_nights', 'transport', 'description', 'adult_price', 'child_price', 'infant_price', 'included_services', 'excluded_services', 'policy', 'cancellation_policy', 'minimum_guests', 'thumbnail', 'status'];
    const set = f.filter((k) => req.body[k] !== undefined);
    if (set.length) await query(`UPDATE tours SET ${set.map((k) => `${k} = ?`).join(',')} WHERE id = ?`, [...set.map((k) => req.body[k]), req.params.id]);
    await audit(req.user.id, 'UPDATE', 'tours', req.params.id, old[0], req.body);
    return res.json({ message: 'Cap nhat tour thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/tours/:id/images', async (req, res) => {
  try {
    const { image_url, sort_order = 0, is_thumbnail = 0 } = req.body || {};
    if (!image_url) return res.status(400).json({ message: 'Thieu image_url' });
    const ins = await query('INSERT INTO tour_images (tour_id, image_url, sort_order, is_thumbnail) VALUES (?,?,?,?)', [req.params.id, image_url, sort_order, is_thumbnail]);
    return res.status(201).json({ id: ins.insertId });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.delete('/tours/:tourId/images/:imgId', async (req, res) => {
  try {
    await query('DELETE FROM tour_images WHERE id = ? AND tour_id = ?', [req.params.imgId, req.params.tourId]);
    return res.json({ message: 'Da xoa anh' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/tours/:id/itinerary', async (req, res) => {
  try {
    const { day_number, title, description, meals, accommodation, note } = req.body || {};
    if (!day_number || !title) return res.status(400).json({ message: 'Thieu day_number/title' });
    const ins = await query('INSERT INTO tour_itineraries (tour_id, day_number, title, description, meals, accommodation, note, sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [req.params.id, day_number, title, description || null, meals || null, accommodation || null, note || null, day_number]);
    return res.status(201).json({ id: ins.insertId });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.put('/tours/:tourId/itinerary/:itId', async (req, res) => {
  try {
    const f = ['day_number', 'title', 'description', 'meals', 'accommodation', 'note'];
    const set = f.filter((k) => req.body[k] !== undefined);
    if (!set.length) return res.status(400).json({ message: 'Khong co gi de cap nhat' });
    await query(`UPDATE tour_itineraries SET ${set.map((k) => `${k} = ?`).join(',')} WHERE id = ? AND tour_id = ?`,
      [...set.map((k) => req.body[k]), req.params.itId, req.params.tourId]);
    return res.json({ message: 'Cap nhat lich trinh thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/tours/:id/departures', async (req, res) => {
  try {
    const { departure_date, return_date, capacity = 30, adult_price, child_price, infant_price, minimum_guests = 1, status = 'OPEN' } = req.body || {};
    if (!departure_date) return res.status(400).json({ message: 'Thieu departure_date' });
    const t = await query('SELECT adult_price, child_price, infant_price FROM tours WHERE id = ? LIMIT 1', [req.params.id]);
    if (!t.length) return res.status(404).json({ message: 'Khong tim thay tour' });
    const ins = await query(
      'INSERT INTO departures (tour_id, departure_date, return_date, capacity, adult_price, child_price, infant_price, minimum_guests, status) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.params.id, departure_date, return_date || null, capacity,
        adult_price ?? t[0].adult_price, child_price ?? t[0].child_price, infant_price ?? t[0].infant_price, minimum_guests, status]
    );
    return res.status(201).json({ id: ins.insertId });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.put('/departures/:id', async (req, res) => {
  try {
    const f = ['departure_date', 'return_date', 'capacity', 'adult_price', 'child_price', 'infant_price', 'minimum_guests', 'status'];
    const set = f.filter((k) => req.body[k] !== undefined);
    if (!set.length) return res.status(400).json({ message: 'Khong co gi de cap nhat' });
    await query(`UPDATE departures SET ${set.map((k) => `${k} = ?`).join(',')} WHERE id = ?`, [...set.map((k) => req.body[k]), req.params.id]);
    return res.json({ message: 'Cap nhat lich khoi hanh thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.get('/departures', async (req, res) => {
  try {
    const { tour_id, status, upcoming, page = 1, limit = 50 } = req.query;
    const conds = ['1=1'];
    const params = [];
    if (tour_id) { conds.push('d.tour_id = ?'); params.push(tour_id); }
    if (status) { conds.push('d.status = ?'); params.push(status); }
    if (String(upcoming) === '1') { conds.push('d.departure_date >= CURDATE()'); }
    const lim = Math.min(Number(limit) || 50, 200);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const rows = await query(
      `SELECT d.*, t.name AS tour_name, (d.capacity - d.confirmed_seats - d.held_seats) AS remaining
       FROM departures d JOIN tours t ON t.id = d.tour_id
       WHERE ${conds.join(' AND ')} ORDER BY d.departure_date LIMIT ? OFFSET ?`,
      [...params, lim, off]
    );
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Promotions ----
router.get('/promotions', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM promotions ORDER BY id DESC LIMIT 100');
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/promotions', async (req, res) => {
  try {
    const f = ['code', 'name', 'description', 'discount_type', 'discount_value', 'minimum_order_value', 'maximum_discount', 'start_date', 'end_date', 'usage_limit', 'limit_per_user', 'applicable_tour_ids', 'status'];
    const ins = await query(`INSERT INTO promotions (${f.join(',')}) VALUES (${f.map(() => '?').join(',')})`, f.map((k) => req.body[k] ?? null));
    return res.status(201).json({ id: ins.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ma giam gia da ton tai' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});
router.put('/promotions/:id', async (req, res) => {
  try {
    const f = ['name', 'description', 'discount_type', 'discount_value', 'minimum_order_value', 'maximum_discount', 'start_date', 'end_date', 'usage_limit', 'limit_per_user', 'applicable_tour_ids', 'status'];
    const set = f.filter((k) => req.body[k] !== undefined);
    if (!set.length) return res.status(400).json({ message: 'Khong co gi de cap nhat' });
    await query(`UPDATE promotions SET ${set.map((k) => `${k} = ?`).join(',')} WHERE id = ?`, [...set.map((k) => req.body[k]), req.params.id]);
    return res.json({ message: 'Cap nhat khuyen mai thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Bookings: list/search (muc 49), detail (muc 50), PATCH status + audit (muc 51) ----
router.get('/bookings', async (req, res) => {
  try {
    const { q, booking_status, payment_status, tour, departure, from, to, page = 1, limit = 20 } = req.query;
    const conds = ['1=1'];
    const params = [];
    if (q) { conds.push('(b.booking_code LIKE ? OR b.contact_name LIKE ? OR b.contact_email LIKE ? OR b.contact_phone LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    if (booking_status) { conds.push('b.booking_status = ?'); params.push(booking_status); }
    if (payment_status) { conds.push('b.payment_status = ?'); params.push(payment_status); }
    if (tour) { conds.push('d.tour_id = ?'); params.push(tour); }
    if (departure) { conds.push('b.departure_id = ?'); params.push(departure); }
    if (from) { conds.push('DATE(b.created_at) >= ?'); params.push(from); }
    if (to) { conds.push('DATE(b.created_at) <= ?'); params.push(to); }
    const lim = Math.min(Number(limit) || 20, 100);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const total = await query(`SELECT COUNT(*) AS c FROM bookings b JOIN departures d ON d.id = b.departure_id WHERE ${conds.join(' AND ')}`, params);
    const rows = await query(
      `SELECT b.*, t.name AS tour_name, d.departure_date FROM bookings b
       JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
       WHERE ${conds.join(' AND ')} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...params, lim, off]
    );
    return res.json({ data: rows, total: total[0].c });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.get('/bookings/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT b.*, t.name AS tour_name, d.departure_date, u.full_name AS customer_name, u.email AS customer_email
       FROM bookings b JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id JOIN users u ON u.id = b.user_id
       WHERE b.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    const [passengers, payments, refunds] = await Promise.all([
      query('SELECT * FROM booking_passengers WHERE booking_id = ?', [req.params.id]),
      query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at', [req.params.id]),
      query('SELECT * FROM refunds WHERE booking_id = ? ORDER BY created_at', [req.params.id]),
    ]);
    return res.json({ ...rows[0], passengers, payments, refunds });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { booking_status, note } = req.body || {};
    const old = await query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [req.params.id]);
    if (!old.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    if (booking_status) await query('UPDATE bookings SET booking_status = ? WHERE id = ?', [booking_status, req.params.id]);
    if (note !== undefined) await query('UPDATE bookings SET note = ? WHERE id = ?', [note, req.params.id]);
    await audit(req.user.id, 'UPDATE_STATUS', 'bookings', req.params.id, { booking_status: old[0].booking_status }, { booking_status });
    await query('INSERT INTO notifications (user_id, title, content, type) VALUES (?,?,?,?)',
      [old[0].user_id, 'Cap nhat booking', `Booking ${old[0].booking_code} chuyen sang ${booking_status || old[0].booking_status}.`, 'BOOKING']);
    return res.json({ message: 'Cap nhat trang thai booking thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Payments: PATCH verify ----
router.get('/payments', async (req, res) => {
  try {
    const rows = await query('SELECT p.*, b.booking_code FROM payments p JOIN bookings b ON b.id = p.booking_id ORDER BY p.created_at DESC LIMIT 100');
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.patch('/payments/:id/verify', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['SUCCESS', 'FAILED'].includes(status)) return res.status(400).json({ message: 'status phai la SUCCESS/FAILED' });
    await query('UPDATE payments SET status = ? WHERE id = ?', [status, req.params.id]);
    await audit(req.user.id, 'VERIFY_PAYMENT', 'payments', req.params.id, null, { status });
    return res.json({ message: 'Xac minh thanh toan thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Refunds: tao/duyet, amount <= da tra (BR23) ----
router.get('/refunds', async (req, res) => {
  try {
    const rows = await query('SELECT r.*, b.booking_code FROM refunds r JOIN bookings b ON b.id = r.booking_id ORDER BY r.created_at DESC LIMIT 100');
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.post('/refunds', async (req, res) => {
  try {
    const { booking_id, payment_id, amount, reason } = req.body || {};
    const b = await query('SELECT * FROM bookings WHERE id = ? LIMIT 1', [booking_id]);
    if (!b.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    if (Number(amount) <= 0 || Number(amount) > Number(b[0].paid_amount)) {
      return res.status(400).json({ message: 'So tien hoan phai <= so da thanh toan (BR23)' });
    }
    const code = 'RF' + Date.now().toString().slice(-8) + crypto.randomBytes(2).toString('hex').toUpperCase();
    const ins = await query("INSERT INTO refunds (booking_id, payment_id, refund_code, amount, reason, status) VALUES (?,?,?, ?,?,'PENDING')",
      [booking_id, payment_id || null, code, amount, reason || null]);
    return res.status(201).json({ id: ins.insertId, refund_code: code });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Hoan tien trung (BR40)' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});
router.patch('/refunds/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['PROCESSING', 'SUCCESS', 'FAILED'].includes(status)) return res.status(400).json({ message: 'status khong hop le' });
    const rows = await query('SELECT * FROM refunds WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay refund' });
    await query('UPDATE refunds SET status = ?, processed_by = ?, processed_at = NOW() WHERE id = ?', [status, req.user.id, req.params.id]);
    if (status === 'SUCCESS') {
      await query("UPDATE bookings SET payment_status = CASE WHEN paid_amount - ? <= 0 THEN 'REFUNDED_FULL' ELSE 'REFUNDED_PARTIAL' END WHERE id = ?",
        [rows[0].amount, rows[0].booking_id]);
    }
    await audit(req.user.id, 'PROCESS_REFUND', 'refunds', req.params.id, { status: rows[0].status }, { status });
    return res.json({ message: 'Xu ly hoan tien thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Reviews: PATCH an ----
router.get('/reviews', async (req, res) => {
  try {
    const rows = await query('SELECT r.*, u.full_name, t.name AS tour_name FROM reviews r JOIN users u ON u.id = r.user_id JOIN tours t ON t.id = r.tour_id ORDER BY r.created_at DESC LIMIT 100');
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.patch('/reviews/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['VISIBLE', 'HIDDEN'].includes(status)) return res.status(400).json({ message: 'status phai la VISIBLE/HIDDEN' });
    await query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ message: 'Cap nhat danh gia thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Users: PATCH lock ----
router.get('/users', async (req, res) => {
  try {
    const rows = await query(`SELECT u.id, u.full_name, u.email, u.phone, u.status, r.name AS role, u.created_at FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.id DESC LIMIT 100`);
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});
router.patch('/users/:id/lock', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['ACTIVE', 'LOCKED'].includes(status)) return res.status(400).json({ message: 'status phai la ACTIVE/LOCKED' });
    await query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    await audit(req.user.id, 'LOCK_USER', 'users', req.params.id, null, { status });
    return res.json({ message: 'Cap nhat trang thai user thanh cong' });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Notifications: POST gui ----
router.post('/notifications', async (req, res) => {
  try {
    const { user_id, title, content, type = 'GENERAL' } = req.body || {};
    if (!user_id || !title) return res.status(400).json({ message: 'Thieu user_id/title' });
    const ins = await query('INSERT INTO notifications (user_id, title, content, type) VALUES (?,?,?,?)', [user_id, title, content || null, type]);
    return res.status(201).json({ id: ins.insertId });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// ---- Reports (muc 53-55) ----
router.get('/reports/dashboard', async (req, res) => {
  try {
    const [[tours], [deps], [users], [bookings], [revenue], [refunds], [upcoming]] = await Promise.all([
      query('SELECT COUNT(*) AS c FROM tours'),
      query('SELECT COUNT(*) AS c FROM departures'),
      query("SELECT COUNT(*) AS c FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'CUSTOMER'"),
      query(`SELECT COUNT(*) AS total,
        SUM(booking_status = 'PENDING') AS pending,
        SUM(booking_status = 'CONFIRMED') AS confirmed,
        SUM(booking_status = 'CANCELLED') AS cancelled,
        SUM(booking_status = 'COMPLETED') AS completed FROM bookings`),
      query("SELECT COALESCE(SUM(amount),0) AS c FROM payments WHERE status = 'SUCCESS'"),
      query("SELECT COALESCE(SUM(amount),0) AS c FROM refunds WHERE status = 'SUCCESS'"),
      query(`SELECT d.*, t.name AS tour_name FROM departures d JOIN tours t ON t.id = d.tour_id
             WHERE d.departure_date >= CURDATE() AND d.status IN ('OPEN','ALMOST_FULL') ORDER BY d.departure_date LIMIT 10`),
    ]);
    return res.json({
      total_tours: tours.c, total_departures: deps.c, total_customers: users.c,
      bookings, total_revenue: revenue.c, total_refunded: refunds.c, upcoming_departures: upcoming,
    });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// Doanh thu theo ngay/tuan/thang (muc 54) — ghi nhan tai thoi diem thanh toan
router.get('/reports/revenue', async (req, res) => {
  try {
    const { by = 'day', from, to } = req.query;
    let fmt = '%Y-%m-%d';
    if (by === 'month') fmt = '%Y-%m';
    else if (by === 'week') fmt = '%x-W%v';
    const conds = ["status = 'SUCCESS'"];
    const params = [];
    if (from) { conds.push('DATE(paid_at) >= ?'); params.push(from); }
    if (to) { conds.push('DATE(paid_at) <= ?'); params.push(to); }
    const rows = await query(
      `SELECT DATE_FORMAT(paid_at, '${fmt}') AS period, SUM(amount) AS revenue, COUNT(*) AS transactions
       FROM payments WHERE ${conds.join(' AND ')} GROUP BY period ORDER BY period`,
      params
    );
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

// Top tour + fill-rate (muc 55)
router.get('/reports/tours', async (req, res) => {
  try {
    const rows = await query(
      `SELECT t.id, t.code, t.name,
        COUNT(DISTINCT b.id) AS bookings,
        COALESCE(SUM(b.adult_count + b.child_count + b.infant_count),0) AS guests,
        COALESCE(SUM(CASE WHEN p.status='SUCCESS' THEN p.amount ELSE 0 END),0) AS revenue,
        COALESCE(SUM(d.capacity),0) AS capacity,
        CASE WHEN COALESCE(SUM(d.capacity),0) > 0
          THEN ROUND(100 * COALESCE(SUM(d.confirmed_seats),0) / SUM(d.capacity), 2) ELSE 0 END AS fill_rate
       FROM tours t
       LEFT JOIN departures d ON d.tour_id = t.id
       LEFT JOIN bookings b ON b.departure_id = d.id AND b.booking_status NOT IN ('CANCELLED','EXPIRED')
       LEFT JOIN payments p ON p.booking_id = b.id
       GROUP BY t.id ORDER BY revenue DESC LIMIT 20`
    );
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

module.exports = router;
