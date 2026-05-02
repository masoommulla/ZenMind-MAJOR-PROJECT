import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { cookieOpts } from '../utils/cookieOptions.js';

const router = Router();

// Admin cookie uses a different name but same options
const adminCookieOpts = { ...cookieOpts };

/* ── Middleware: require admin ── */
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const admin = await Admin.findById(decoded.sub).lean();
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    req.admin = { id: String(admin._id) };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/* ── POST /admin/login ── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const admin = await Admin.findOne({ username }).lean();
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { sub: String(admin._id), role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('admin_token', token, adminCookieOpts);
  return res.json({ ok: true });
});

/* ── GET /admin/me ── */
router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).lean();
  return res.json({ ok: true, username: admin.username });
});

/* ── GET /admin/users ── */
router.get('/users', requireAdmin, async (req, res) => {
  const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();

  const totalUsers = users.length;
  const suspendedCount = users.filter(u => u.isSuspended).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysMembers = users.filter(u => new Date(u.createdAt) >= today).length;

  return res.json({
    ok: true,
    users,
    stats: {
      total: totalUsers,
      suspended: suspendedCount,
      today: todaysMembers,
      active: totalUsers - suspendedCount
    }
  });
});

/* ── PUT /admin/users/:id/suspend ── */
router.put('/users/:id/suspend', requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isSuspended = !user.isSuspended;
  await user.save();
  return res.json({ ok: true, isSuspended: user.isSuspended });
});

/* ── DELETE /admin/users/:id ── */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ ok: true });
});

/* ── POST /admin/logout ── */
router.post('/logout', (_req, res) => {
  res.clearCookie('admin_token', adminCookieOpts);
  return res.json({ ok: true });
});

/* ── PUT /admin/settings ── */
const settingsSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
});

router.put('/settings', requireAdmin, async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  if (parsed.data.username && parsed.data.username !== admin.username) {
    const existing = await Admin.findOne({ username: parsed.data.username });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    admin.username = parsed.data.username;
  }

  if (parsed.data.password) {
    admin.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await admin.save();
  return res.json({ ok: true });
});

export default router;
