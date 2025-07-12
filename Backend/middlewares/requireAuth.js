import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
  let token = null;

  // First try Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallbacks: check body or query params (less common but optional)
  if (!token && req.body?.token) {
    token = req.body.token;
  }

  if (!token && req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default requireAuth;
