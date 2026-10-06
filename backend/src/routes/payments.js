const express = require('express');
const crypto = require('crypto');
const { query, getConnection } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments { bookingId, amount, method, content? }
router.post('/', requireAuth, async (req, res) => {
  const conn = await getConnection();
  try {
    const { bookingId, amount, method = 'BANK_TRANSFER', content } = req.body || {};
    const payAmount = Number(amount) || 0;
    if (!bookingId || payAmount <= 0) return res.status(400).json({ message: 'Thieu bookingId/amount hop le' });

    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM bookings WHERE id = ? FOR UPDATE', [bookingId]);
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ message: 'Khong tim thay booking' }); }
    const b = rows[0];
    if (b.user_id !== req.user.id && !['STAFF', 'ADMIN'].includes(req.user.role)) {
      await conn.rollback(); return res.status(403).json({ message: 'Khong phai booking cua ban' });
    }
    // BR21-BR22: chan booking da huy / hoan thanh tu huy
    if (['CANCELLED', 'EXPIRED'].includes(b.booking_status)) { await conn.rollback(); return res.status(400).json({ message: 'Booking da huy/het han, khong duoc thanh toan (BR21)' }); }
    if (b.booking_status === 'COMPLETED') { await conn.rollback(); return res.status(400).json({ message: 'Booking da hoan thanh (BR22)' }); }
    if (Number(b.remaining_amount) <= 0) { await conn.rollback(); return res.status(400).json({ message: 'Booking da thanh toan du' }); }
    if (payAmount > Number(b.remaining_amount)) { await conn.rollback(); return res.status(400).json({ message: 'So tien vuot qua con lai' }); }

    // BR39: transaction_code unique, retry neu trung
    let txn = 'TXN' + Date.now().toString().slice(-8) + crypto.randomBytes(2).toString('hex').toUpperCase();
    const [ins] = await conn.query(
      "INSERT INTO payments (booking_id, transaction_code, amount, payment_method, status, paid_at, content) VALUES (?,?,?,?,'SUCCESS',NOW(),?)",
      [bookingId, txn, payAmount, method, content || null]
    );

    const paid = Number(b.paid_amount) + payAmount;
    const remaining = Number(b.total_amount) - paid;
    let paymentStatus = 'PARTIAL';
    if (remaining <= 0) paymentStatus = 'PAID';
    else if (paid >= Number(b.total_amount) * 0.3) paymentStatus = 'DEPOSITED';
    // BR48-BR49: chi SUCCESS moi cong don; o day insert SUCCESS nen cong truc tiep

    // Neu tra du (hoac dat coc >=30%): booking -> CONFIRMED, held -> confirmed
    let bookingStatus = b.booking_status;
    if (remaining <= 0 || paid >= Number(b.total_amount) * 0.3) {
      if (['PENDING', 'DEPOSIT_PENDING'].includes(b.booking_status)) bookingStatus = 'CONFIRMED';
    }
    await conn.query(
      'UPDATE bookings SET paid_amount = ?, remaining_amount = ?, payment_status = ?, booking_status = ? WHERE id = ?',
      [paid, Math.max(0, remaining), paymentStatus, bookingStatus, bookingId]
    );
    if (bookingStatus === 'CONFIRMED' && b.booking_status !== 'CONFIRMED') {
      const guests = b.adult_count + b.child_count + b.infant_count;
      await conn.query(
        'UPDATE departures SET held_seats = GREATEST(0, held_seats - ?), confirmed_seats = confirmed_seats + ? WHERE id = ?',
        [guests, guests, b.departure_id]
      );
    }
    await conn.query('INSERT INTO notifications (user_id, title, content, type) VALUES (?,?,?,?)',
      [b.user_id, 'Thanh toan thanh cong', `Booking ${b.booking_code} da nhan ${payAmount.toLocaleString('vi-VN')}d (${txn}).`, 'PAYMENT']);
    await conn.commit();
    return res.status(201).json({ id: ins.insertId, transaction_code: txn, paid_amount: paid, remaining_amount: Math.max(0, remaining), payment_status: paymentStatus, booking_status: bookingStatus });
  } catch (e) {
    try { await conn.rollback(); } catch (_) {}
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Giao dich trung, khong xu ly 2 lan (BR39)' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  } finally {
    conn.release();
  }
});

router.get('/booking/:bookingId', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at', [req.params.bookingId]);
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
