const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
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
      // Log minimal d'audit pour les accès non authentifiés
      // eslint-disable-next-line no-console
      console.warn('JWT verification warning: token manquant', {
        path: req.path,
        ip: req.ip
      });
      return res.status(401).json({ message: 'Token manquant' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('JWT verification error:', {
      message: error.message,
      name: error.name,
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    // eslint-disable-next-line no-console
    console.warn('Access denied: SUPERADMIN required', {
      path: req.path,
      user: req.user ? { id_user: req.user.id_user, role: req.user.role } : null
    });
    return res.status(403).json({ message: 'Accès réservé au SUPERADMIN' });
  }
  return next();
};

module.exports = {
  verifyToken,
  isSuperAdmin
};

