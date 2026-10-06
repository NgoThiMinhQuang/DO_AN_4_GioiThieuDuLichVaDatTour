const express = require('express');
const crypto = require('crypto');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/support — gui yeu cau ho tro (khach hang)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { booking_id, contact_name, contact_email, contact_phone, type = 'OTHER', title, content, priority = 'MEDIUM' } = req.body || {};
    if (!title || !content) return res.status(400).json({ message: 'Thieu tieu de / noi dung' });
    if (!['BOOKING', 'PAYMENT', 'TOUR_INFO', 'COMPLAINT', 'OTHER'].includes(type)) {
      return res.status(400).json({ message: 'Loai yeu cau khong hop le' });
    }
    const me = await query('SELECT full_name, email, phone FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    const code = 'HT' + Date.now().toString().slice(-8) + crypto.randomBytes(1).toString('hex').toUpperCase();
    const ins = await query(
      `INSERT INTO support_tickets (ticket_code, user_id, booking_id, contact_name, contact_email, contact_phone, type, title, content, priority)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [code, req.user.id, booking_id || null,
        contact_name || me[0]?.full_name, contact_email || me[0]?.email, contact_phone || me[0]?.phone,
        type, title, content, ['LOW', 'MEDIUM', 'HIGH'].includes(priority) ? priority : 'MEDIUM']
    );
    return res.status(201).json({ id: ins.insertId, ticket_code: code, message: 'Da gui yeu cau ho tro' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Trung ma yeu cau, vui long thu lai' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// GET /api/support/my — yeu cau cua toi
router.get('/my', requireAuth, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    return res.json({ data: rows });
  } catch (e) { return res.status(500).json({ message: 'Loi server', error: e.message }); }
});

module.exports = router;
