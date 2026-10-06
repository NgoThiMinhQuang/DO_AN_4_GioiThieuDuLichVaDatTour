const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// Destinations
router.get('/destinations', async (req, res) => {
  try {
    const rows = await query("SELECT * FROM destinations WHERE status = 'VISIBLE' ORDER BY name");
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// Chi tiet destination kem attractions + articles + tours lien quan (muc 6-7)
router.get('/destinations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await query('SELECT * FROM destinations WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay diem den' });
    const [attractions, articles, tours] = await Promise.all([
      query("SELECT * FROM attractions WHERE destination_id = ? AND status = 'VISIBLE'", [id]),
      query("SELECT * FROM articles WHERE destination_id = ? AND status = 'PUBLISHED' ORDER BY published_at DESC LIMIT 10", [id]),
      query(
        `SELECT t.* FROM tours t JOIN tour_destinations td ON td.tour_id = t.id
         WHERE td.destination_id = ? AND t.status = 'OPEN' LIMIT 10`,
        [id]
      ),
    ]);
    return res.json({ ...rows[0], attractions, articles, tours });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/attractions', async (req, res) => {
  try {
    const { destination } = req.query;
    const rows = destination
      ? await query("SELECT * FROM attractions WHERE destination_id = ? AND status = 'VISIBLE'", [destination])
      : await query("SELECT * FROM attractions WHERE status = 'VISIBLE' LIMIT 50");
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/articles', async (req, res) => {
  try {
    const { category, destination } = req.query;
    const conds = ["a.status = 'PUBLISHED'"];
    const params = [];
    if (category) { conds.push('a.category_id = ?'); params.push(category); }
    if (destination) { conds.push('a.destination_id = ?'); params.push(destination); }
    const rows = await query(
      `SELECT a.*, c.name AS category_name FROM articles a
       LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE ${conds.join(' AND ')} ORDER BY a.published_at DESC LIMIT 30`,
      params
    );
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/articles/:id', async (req, res) => {
  try {
    const key = req.params.id;
    const rows = await query(
      `SELECT a.*, c.name AS category_name FROM articles a
       LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE (a.id = ? OR a.slug = ?) AND a.status = 'PUBLISHED' LIMIT 1`,
      [key, key]
    );
    if (!rows.length) return res.status(404).json({ message: 'Khong tim thay bai viet' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

router.get('/tour-categories', async (req, res) => {
  try {
    const rows = await query("SELECT * FROM tour_categories WHERE status = 'VISIBLE'");
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
