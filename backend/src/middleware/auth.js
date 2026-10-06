const jwt = require('jsonwebtoken');

function getSecret() {
  return process.env.JWT_SECRET || 'change_me';
}

// Verify Bearer JWT, gan req.user = { id, role, email }
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ message: 'Thieu token xac thuc' });
  }
  try {
    const payload = jwt.verify(parts[1], getSecret());
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token khong hop le hoac het han' });
  }
}

// Kiem tra role CUSTOMER/STAFF/ADMIN (BR43-BR45). Dung sau requireAuth.
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chua xac thuc' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Khong co quyen truy cap' });
    }
    return next();
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

module.exports = { requireAuth, requireRole, signToken };
