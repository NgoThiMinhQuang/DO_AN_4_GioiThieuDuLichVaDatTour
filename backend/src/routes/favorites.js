const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT t.* FROM favorites f JOIN tours t ON t.id = f.tour_id WHERE f.user_id = ? ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.post('/:tourId', async (req, res) => {
  try {
    const t = await query('SELECT id FROM tours WHERE id = ? LIMIT 1', [req.params.tourId]);
    if (!t.length) return res.status(404).json({ message: 'Khong tim thay tour' });
    await query('INSERT INTO favorites (user_id, tour_id) VALUES (?,?)', [req.user.id, req.params.tourId]);
    return res.status(201).json({ message: 'Da them yeu thich' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Tour da co trong yeu thich (BR46)' });
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.delete('/:tourId', async (req, res) => {
  try {
    await query('DELETE FROM favorites WHERE user_id = ? AND tour_id = ?', [req.user.id, req.params.tourId]);
    return res.json({ message: 'Da xoa khoi yeu thich' });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
