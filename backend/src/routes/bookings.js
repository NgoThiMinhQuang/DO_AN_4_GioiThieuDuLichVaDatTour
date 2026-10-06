const express = require('express');
const { query, getConnection } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { calcBookingPrice, calcPromotionDiscount } = require('../utils/price');

const router = express.Router();
router.use(requireAuth, requireRole('CUSTOMER', 'STAFF', 'ADMIN'));

const HOLD_MINUTES = () => Number(process.env.HOLD_MINUTES || 15);

// Tao booking_code BKyyyymmddxxxx unique (BR17)
async function genBookingCode(conn) {
  const d = new Date();
  const p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  for (let i = 0; i < 5; i++) {
    const code = `BK${p}${String(Math.floor(1000 + Math.random() * 9000))}`;
    const [rows] = await conn.query('SELECT id FROM bookings WHERE booking_code = ? LIMIT 1', [code]);
    if (!rows.length) return code;
  }
  return `BK${p}${Date.now().toString().slice(-6)}`;
}

// Kiem tra promotion theo muc 29 (BR27-BR30)
async function validatePromotion(conn, code, userId, tourId, subtotal) {
  if (!code) return { promo: null, discount: 0 };
  const [rows] = await conn.query('SELECT * FROM promotions WHERE code = ? LIMIT 1', [code]);
  if (!rows.length) throw { status: 400, message: 'Ma giam gia khong ton tai' };
  const promo = rows[0];
  const now = new Date();
  if (promo.status !== 'ACTIVE') throw { status: 400, message: 'Ma giam gia khong hoat dong' };
  if (new Date(promo.start_date) > now) throw { status: 400, message: 'Ma giam gia chua den ngay bat dau' };
  if (new Date(promo.end_date) < now) throw { status: 400, message: 'Ma giam gia da het han' };
  if (promo.usage_limit != null && promo.used_count >= promo.usage_limit) {
    throw { status: 400, message: 'Ma giam gia da het luot su dung' };
  }
  if (Number(subtotal) < Number(promo.minimum_order_value || 0)) {
    throw { status: 400, message: `Don chua dat gia tri toi thieu ${promo.minimum_order_value}` };
  }
  if (promo.applicable_tour_ids) {
    try {
      const ids = JSON.parse(promo.applicable_tour_ids);
      if (Array.isArray(ids) && ids.length && !ids.map(Number).includes(Number(tourId))) {
        throw { status: 400, message: 'Ma giam gia khong ap dung cho tour nay' };
      }
    } catch (e) {
      if (e.status) throw e;
    }
  }
  const [used] = await conn.query(
    'SELECT COUNT(*) AS c FROM promotion_usages WHERE promotion_id = ? AND user_id = ?',
    [promo.id, userId]
  );
  if (used[0].c >= Number(promo.limit_per_user || 1)) {
    throw { status: 400, message: 'Ban da dung het luot cho ma nay' };
  }
  return { promo, discount: calcPromotionDiscount(promo, subtotal) };
}

// POST /api/bookings — tao booking + giu cho (muc 26, BR13-BR17, BR35-BR37, BR41)
router.post('/', async (req, res) => {
  const conn = await getConnection();
  try {
    const {
      departureId, adultCount = 1, childCount = 0, infantCount = 0,
      contact, passengers = [], promotionCode, surcharge = 0, note,
    } = req.body || {};
    const a = Number(adultCount) || 0, c = Number(childCount) || 0, inf = Number(infantCount) || 0;
    const totalGuests = a + c + inf;
    if (!departureId) return res.status(400).json({ message: 'Thieu departureId' });
    if (a < 1) return res.status(400).json({ message: 'Phai co it nhat 1 nguoi lon' });
    if (!contact || !contact.name || !contact.phone) {
      return res.status(400).json({ message: 'Thieu thong tin lien he (ten, sdt)' });
    }

    await conn.beginTransaction();
    // Khoa departure chong ban vuot cho (BR41-BR42)
    const [deps] = await conn.query('SELECT d.*, t.status AS tour_status FROM departures d JOIN tours t ON t.id = d.tour_id WHERE d.id = ? FOR UPDATE', [departureId]);
    if (!deps.length) { await conn.rollback(); return res.status(404).json({ message: 'Lich khoi hanh khong ton tai' }); }
    const dep = deps[0];
    if (!['OPEN', 'ALMOST_FULL'].includes(dep.status)) { await conn.rollback(); return res.status(400).json({ message: 'Lich khoi hanh khong con nhan khach (BR13-BR14)' }); }
    if (dep.tour_status !== 'OPEN') { await conn.rollback(); return res.status(400).json({ message: 'Tour hien khong mo ban' }); }
    if (new Date(dep.departure_date) <= new Date(new Date().toDateString())) { await conn.rollback(); return res.status(400).json({ message: 'Lich khoi hanh da qua ngay (BR15)' }); }

    const remaining = dep.capacity - dep.confirmed_seats - dep.held_seats;
    if (totalGuests > remaining) { await conn.rollback(); return res.status(400).json({ message: `Chi con ${remaining} cho trong (BR16)` }); }

    // Gia server-side tu departure (BR35-BR36, BR19)
    const base = calcBookingPrice({
      adultCount: a, childCount: c, infantCount: inf,
      adultPrice: dep.adult_price, childPrice: dep.child_price, infantPrice: dep.infant_price,
      surcharge,
    });
    let promo = null, discount = 0;
    try {
      const v = await validatePromotion(conn, promotionCode, req.user.id, dep.tour_id, base.subtotal);
      promo = v.promo; discount = v.discount;
    } catch (e) {
      await conn.rollback();
      return res.status(e.status || 400).json({ message: e.message });
    }
    const priced = calcBookingPrice({
      adultCount: a, childCount: c, infantCount: inf,
      adultPrice: dep.adult_price, childPrice: dep.child_price, infantPrice: dep.infant_price,
      surcharge, discount,
    });

    const code = await genBookingCode(conn);
    const holdExpires = new Date(Date.now() + HOLD_MINUTES() * 60000);
    const [ins] = await conn.query(
      `INSERT INTO bookings (booking_code, user_id, departure_id, contact_name, contact_email, contact_phone,
        contact_address, adult_count, child_count, infant_count, adult_price, child_price, infant_price,
        subtotal, surcharge, discount_amount, total_amount, paid_amount, remaining_amount,
        booking_status, payment_status, promotion_id, note, hold_expires_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [code, req.user.id, departureId, contact.name, contact.email || null, contact.phone,
        contact.address || null, a, c, inf, dep.adult_price, dep.child_price, dep.infant_price,
        priced.subtotal, Number(surcharge) || 0, priced.discount, priced.total, 0, priced.total,
        'PENDING', 'UNPAID', promo ? promo.id : null, note || null, holdExpires]
    );
    const bookingId = ins.insertId;

    if (Array.isArray(passengers) && passengers.length) {
      for (const p of passengers.slice(0, totalGuests)) {
        await conn.query(
          'INSERT INTO booking_passengers (booking_id, full_name, date_of_birth, gender, passenger_type, identity_number, passport_number, nationality, note) VALUES (?,?,?,?,?,?,?,?,?)',
          [bookingId, p.full_name || p.name, p.date_of_birth || null, p.gender || null,
            p.passenger_type || 'ADULT', p.identity_number || null, p.passport_number || null, p.nationality || null, p.note || null]
        );
      }
    }
    // Giu cho atomic
    await conn.query('UPDATE departures SET held_seats = held_seats + ? WHERE id = ?', [totalGuests, departureId]);
    if (promo) {
      await conn.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
      await conn.query('INSERT INTO promotion_usages (promotion_id, user_id, booking_id) VALUES (?,?,?)', [promo.id, req.user.id, bookingId]);
    }
    await conn.query('INSERT INTO notifications (user_id, title, content, type) VALUES (?,?,?,?)',
      [req.user.id, 'Dat tour thanh cong', `Booking ${code} da duoc tao, vui long thanh toan truoc ${holdExpires.toLocaleString('vi-VN')}.`, 'BOOKING']);
    await conn.commit();
    return res.status(201).json({ id: bookingId, booking_code: code, total_amount: priced.total, hold_expires_at: holdExpires });
  } catch (e) {
    try { await conn.rollback(); } catch (_) {}
    return res.status(500).json({ message: 'Loi server', error: e.message });
  } finally {
    conn.release();
  }
});

router.get('/my', async (req, res) => {
  try {
    const rows = await query(
      `SELECT b.*, t.name AS tour_name, t.thumbnail, d.departure_date
       FROM bookings b JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
       WHERE b.user_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT b.*, t.name AS tour_name, d.departure_date, d.return_date
       FROM bookings b JOIN departures d ON d.id = b.departure_id JOIN tours t ON t.id = d.tour_id
       WHERE b.id = ? AND b.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    const [passengers, payments] = await Promise.all([
      query('SELECT * FROM booking_passengers WHERE booking_id = ?', [req.params.id]),
      query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at', [req.params.id]),
    ]);
    return res.json({ ...rows[0], passengers, payments });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// POST /api/bookings/:id/cancel — khach gui yeu cau huy (muc 34)
router.post('/:id/cancel', async (req, res) => {
  try {
    const rows = await query(
      `SELECT b.*, d.departure_date FROM bookings b JOIN departures d ON d.id = b.departure_id
       WHERE b.id = ? AND b.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    const b = rows[0];
    if (b.booking_status === 'COMPLETED') return res.status(400).json({ message: 'Booking hoan thanh khong duoc huy (BR22)' });
    if (['CANCELLED', 'EXPIRED'].includes(b.booking_status)) return res.status(400).json({ message: 'Booking da ket thuc' });
    if (new Date(b.departure_date) <= new Date()) return res.status(400).json({ message: 'Tour da khoi hanh, khong the huy' });
    await query("UPDATE bookings SET booking_status = 'CANCELLED', note = CONCAT(COALESCE(note,''), ' [Khach yeu cau huy]') WHERE id = ?", [b.id]);
    const guests = b.adult_count + b.child_count + b.infant_count;
    // Tra cho: tru held truoc, thieu thi tru confirmed
    await query(
      `UPDATE departures SET held_seats = GREATEST(0, held_seats - ?),
        confirmed_seats = GREATEST(0, confirmed_seats - GREATEST(0, ? - held_seats)) WHERE id = ?`,
      [guests, guests, b.departure_id]
    );
    await query('INSERT INTO notifications (user_id, title, content, type) VALUES (?,?,?,?)',
      [req.user.id, 'Yeu cau huy booking', `Booking ${b.booking_code} da chuyen sang huy, nhan vien se xu ly hoan tien.`, 'BOOKING']);
    return res.json({ message: 'Da gui yeu cau huy, booking chuyen sang DA_HUY cho xu ly hoan tien' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// POST /api/bookings/:id/reviews — chi booking hoan thanh, chua review, 1-5 sao (BR24-BR26)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, content } = req.body || {};
    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Diem danh gia 1-5 (BR25)' });
    }
    const rows = await query(
      `SELECT b.*, d.tour_id FROM bookings b JOIN departures d ON d.id = b.departure_id
       WHERE b.id = ? AND b.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay booking' });
    const b = rows[0];
    if (b.booking_status !== 'COMPLETED') return res.status(400).json({ message: 'Chi duoc danh gia booking da hoan thanh (BR24)' });
    const dup = await query('SELECT id FROM reviews WHERE booking_id = ? LIMIT 1', [b.id]);
    if (dup.length) return res.status(409).json({ message: 'Moi booking chi danh gia 1 lan (BR26)' });
    const r = await query('INSERT INTO reviews (user_id, tour_id, booking_id, rating, content) VALUES (?,?,?,?,?)',
      [req.user.id, b.tour_id, b.id, rating, content || null]);
    return res.status(201).json({ id: r.insertId, message: 'Danh gia thanh cong' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
