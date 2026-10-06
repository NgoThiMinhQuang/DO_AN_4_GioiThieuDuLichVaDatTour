const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// GET /api/tours?q=&category=&destination=&minPrice=&maxPrice=&sort=(price_asc|price_desc|newest)&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { q, category, destination, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const conds = ["t.status = 'OPEN'"];
    const params = [];
    if (q) {
      conds.push('(t.name LIKE ? OR t.code LIKE ? OR t.departure_location LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) { conds.push('t.category_id = ?'); params.push(category); }
    if (destination) {
      conds.push('EXISTS (SELECT 1 FROM tour_destinations td WHERE td.tour_id = t.id AND td.destination_id = ?)');
      params.push(destination);
    }
    if (minPrice) { conds.push('t.adult_price >= ?'); params.push(Number(minPrice)); }
    if (maxPrice) { conds.push('t.adult_price <= ?'); params.push(Number(maxPrice)); }
    let order = 't.created_at DESC';
    if (sort === 'price_asc') order = 't.adult_price ASC';
    else if (sort === 'price_desc') order = 't.adult_price DESC';
    else if (sort === 'newest') order = 't.created_at DESC';
    const lim = Math.min(Number(limit) || 12, 50);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const where = 'WHERE ' + conds.join(' AND ');
    const total = await query(`SELECT COUNT(*) AS c FROM tours t ${where}`, params);
    const rows = await query(
      `SELECT t.*, c.name AS category_name,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.tour_id = t.id AND r.status='VISIBLE') AS avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.tour_id = t.id AND r.status='VISIBLE') AS review_count
       FROM tours t LEFT JOIN tour_categories c ON c.id = t.category_id
       ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, lim, off]
    );
    return res.json({ data: rows, total: total[0].c, page: Number(page) || 1, limit: lim });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// GET /api/tours/:id — full: images, itinerary, destinations, departures con cho, reviews
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const tours = await query(
      `SELECT t.*, c.name AS category_name,
        (SELECT AVG(r.rating) FROM reviews r WHERE r.tour_id = t.id AND r.status='VISIBLE') AS avg_rating
       FROM tours t LEFT JOIN tour_categories c ON c.id = t.category_id WHERE t.id = ? LIMIT 1`,
      [id]
    );
    if (!tours.length) return res.status(404).json({ message: 'Khong tim thay tour' });
    const [images, itinerary, destinations, departures, reviews] = await Promise.all([
      query('SELECT * FROM tour_images WHERE tour_id = ? ORDER BY sort_order', [id]),
      query('SELECT * FROM tour_itineraries WHERE tour_id = ? ORDER BY day_number', [id]),
      query(`SELECT d.* FROM destinations d JOIN tour_destinations td ON td.destination_id = d.id WHERE td.tour_id = ? ORDER BY td.sort_order`, [id]),
      query(
        `SELECT *, (capacity - confirmed_seats - held_seats) AS remaining
         FROM departures WHERE tour_id = ? AND departure_date >= CURDATE() AND status IN ('OPEN','ALMOST_FULL')
         ORDER BY departure_date`,
        [id]
      ),
      query(
        `SELECT r.*, u.full_name FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.tour_id = ? AND r.status = 'VISIBLE' ORDER BY r.created_at DESC LIMIT 20`,
        [id]
      ),
    ]);
    return res.json({ ...tours[0], images, itinerary, destinations, departures, reviews });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

// GET /api/tours/:id/related — cung category hoac cung destination
router.get('/:id/related', async (req, res) => {
  try {
    const id = req.params.id;
    const base = await query('SELECT category_id FROM tours WHERE id = ? LIMIT 1', [id]);
    if (!base.length) return res.status(404).json({ message: 'Khong tim thay tour' });
    const rows = await query(
      `SELECT DISTINCT t.* FROM tours t
       LEFT JOIN tour_destinations td ON td.tour_id = t.id
       WHERE t.id != ? AND t.status = 'OPEN'
         AND (t.category_id = ? OR td.destination_id IN (SELECT destination_id FROM tour_destinations WHERE tour_id = ?))
       LIMIT 8`,
      [id, base[0].category_id, id]
    );
    return res.json({ data: rows });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
