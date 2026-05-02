import { verifyJwt } from '../utils/jwt.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth_token || null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (user.isSuspended) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      return res.status(403).json({ error: 'You are suspended from administration' });
    }

    req.user = { id: String(user._id) };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

