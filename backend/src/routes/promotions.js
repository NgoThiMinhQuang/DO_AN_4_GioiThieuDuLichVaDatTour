const express = require('express');
const { query } = require('../config/db');
const { calcPromotionDiscount } = require('../utils/price');

const router = express.Router();

// POST /api/promotions/validate { code, tourId, subtotal } — public
router.post('/validate', async (req, res) => {
  try {
    const { code, tourId, subtotal } = req.body || {};
    if (!code) return res.status(400).json({ message: 'Thieu code' });
    const rows = await query('SELECT * FROM promotions WHERE code = ? LIMIT 1', [code]);
    if (!rows.length) return res.status(400).json({ valid: false, message: 'Ma khong ton tai' });
    const p = rows[0];
    const now = new Date();
    if (p.status !== 'ACTIVE') return res.status(400).json({ valid: false, message: 'Ma khong hoat dong' });
    if (new Date(p.start_date) > now) return res.status(400).json({ valid: false, message: 'Ma chua den ngay bat dau' });
    if (new Date(p.end_date) < now) return res.status(400).json({ valid: false, message: 'Ma da het han' });
    if (p.usage_limit != null && p.used_count >= p.usage_limit) {
      return res.status(400).json({ valid: false, message: 'Ma da het luot su dung' });
    }
    if (Number(subtotal || 0) < Number(p.minimum_order_value || 0)) {
      return res.status(400).json({ valid: false, message: `Chua dat gia tri toi thieu ${p.minimum_order_value}` });
    }
    const discount = calcPromotionDiscount(p, Number(subtotal) || 0);
    return res.json({ valid: true, discount, promotion: { code: p.code, name: p.name, discount_type: p.discount_type, discount_value: p.discount_value } });
  } catch (e) {
    return res.status(500).json({ message: 'Loi server', error: e.message });
  }
});

module.exports = router;
