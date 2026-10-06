// Tinh gia booking theo README muc 21 (BR35-BR36: backend tu tinh, khong tin frontend).
// subtotal = adult*price + child*price + infant*price + surcharge
// total = subtotal - discount
function calcBookingPrice({
  adultCount = 0,
  childCount = 0,
  infantCount = 0,
  adultPrice = 0,
  childPrice = 0,
  infantPrice = 0,
  surcharge = 0,
  discount = 0,
} = {}) {
  const a = Math.max(0, Number(adultCount) || 0);
  const c = Math.max(0, Number(childCount) || 0);
  const i = Math.max(0, Number(infantCount) || 0);
  const ap = Math.max(0, Number(adultPrice) || 0);
  const cp = Math.max(0, Number(childPrice) || 0);
  const ip = Math.max(0, Number(infantPrice) || 0);
  const s = Math.max(0, Number(surcharge) || 0);
  let d = Math.max(0, Number(discount) || 0);

  const subtotal = Math.round(a * ap + c * cp + i * ip + s);
  if (d > subtotal) d = subtotal;
  const total = Math.max(0, subtotal - Math.round(d));
  return { subtotal, discount: Math.round(d), total };
}

// Tinh tien giam tu promotion: PERCENT (co tran maximum_discount) hoac FIXED.
function calcPromotionDiscount(promo, subtotal) {
  if (!promo) return 0;
  const sub = Number(subtotal) || 0;
  if (promo.discount_type === 'PERCENT') {
    let d = Math.round((sub * Number(promo.discount_value)) / 100);
    if (promo.maximum_discount != null) d = Math.min(d, Number(promo.maximum_discount));
    return Math.max(0, d);
  }
  return Math.max(0, Math.min(Math.round(Number(promo.discount_value) || 0), sub));
}

module.exports = { calcBookingPrice, calcPromotionDiscount };
