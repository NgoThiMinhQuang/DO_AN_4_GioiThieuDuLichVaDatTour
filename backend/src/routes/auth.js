const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { signToken } = require('../middleware/auth');

const router = express.Router();

function roleName(rows, roleId) {
  const r = rows.find((x) => x.id === roleId);
  return r ? r.name : 'CUSTOMER';
}

// POST /api/auth/register { full_name, email, phone, password }
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body || {};
    if (!full_name || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Thieu ho ten / email-so dien thoai / mat khau' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Mat khau toi thieu 6 ky tu' });
    }
    const dup = await query('SELECT id FROM users WHERE email = ? OR phone = ?', [email || null, phone || null]);
    if (dup.length) return res.status(409).json({ message: 'Email hoac so dien thoai da ton tai' });
    const roles = await query('SELECT id, name FROM roles');
    const roleId = (roles.find((r) => r.name === 'CUSTOMER') || {}).id || 1;
    const hash = await bcrypt.hash(password, 10);
    const r = await query(
      'INSERT INTO users (full_name, email, phone, password_hash, role_id, status) VALUES (?,?,?,?,?,?)',
      [full_name, email || null, phone || null, hash, roleId, 'ACTIVE']
    );
    return res.status(201).json({ id: r.insertId, message: 'Dang ky thanh cong' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// POST /api/auth/login { identifier (email hoac phone), password }
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body || {};
    const login = identifier || email || phone;
    if (!login || !password) return res.status(400).json({ message: 'Thieu thong tin dang nhap' });
    const rows = await query(
      `SELECT u.*, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = ? OR u.phone = ? LIMIT 1`,
      [login, login]
    );
    if (!rows.length) return res.status(401).json({ message: 'Sai thong tin dang nhap' });
    const user = rows[0];
    if (user.status === 'LOCKED') return res.status(403).json({ message: 'Tai khoan da bi khoa' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Sai thong tin dang nhap' });
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    return res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// POST /api/auth/forgot { email } — ban demo: tra token (thuc te gui email)
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Thieu email' });
    const rows = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    const token = crypto.randomBytes(24).toString('hex');
    if (!rows.length) return res.json({ message: 'Neu email ton tai, huong dan da duoc gui', reset_token: token });
    return res.json({ message: 'Da tao token dat lai mat khau (demo)', reset_token: token });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.date_of_birth, u.gender, u.address, u.avatar, u.status, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay user' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// PUT /api/auth/me — khong cho doi role/status (muc 46)
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { full_name, date_of_birth, gender, phone, address, avatar } = req.body || {};
    await query(
      'UPDATE users SET full_name = COALESCE(?, full_name), date_of_birth = ?, gender = ?, phone = COALESCE(?, phone), address = ?, avatar = ? WHERE id = ?',
      [full_name || null, date_of_birth || null, gender || null, phone || null, address || null, avatar || null, req.user.id]
    );
    return res.json({ message: 'Cap nhat ho so thanh cong' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'So dien thoai da ton tai' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { old_password, new_password } = req.body || {};
    if (!old_password || !new_password) return res.status(400).json({ message: 'Thieu mat khau' });
    if (String(new_password).length < 6) return res.status(400).json({ message: 'Mat khau moi toi thieu 6 ky tu' });
    const rows = await query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay user' });
    const ok = await bcrypt.compare(old_password, rows[0].password_hash);
    if (!ok) return res.status(400).json({ message: 'Mat khau hien tai khong dung' });
    const hash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    return res.json({ message: 'Doi mat khau thanh cong' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
