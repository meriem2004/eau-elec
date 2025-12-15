const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

const verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ message: 'Accès réservé au SUPERADMIN' });
  }
  return next();
};

module.exports = {
  verifyToken,
  isSuperAdmin
};


