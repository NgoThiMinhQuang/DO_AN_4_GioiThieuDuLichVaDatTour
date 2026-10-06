const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ message: 'Da danh dau da doc' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
