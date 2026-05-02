import { Router } from 'express';
import { z } from 'zod';

import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { cookieOpts } from '../utils/cookieOptions.js';

const router = Router();

/* ── GET /me ── */
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({
    id:     String(user._id),
    name:   user.name,
    email:  user.email,
    phone:  user.phone,
    age:    user.age,
    gender: user.gender,
    avatar: user.avatar?.data ? { mime: user.avatar.mime, data: user.avatar.data } : null
  });
});

/* ── PUT /me ── */
const updateSchema = z.object({
  name:   z.string().min(2).optional(),
  phone:  z.string().min(8).optional(),
  age:    z.coerce.number().int().min(1).max(120).optional(),
  email:  z.string().email().optional(),
  gender: z.enum(['male', 'female', 'other']).optional()
});

router.put('/', requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Uniqueness check for phone
  if (parsed.data.phone && parsed.data.phone !== user.phone) {
    const phoneExists = await User.findOne({
      phone: parsed.data.phone,
      _id: { $ne: user._id }
    }).lean();
    if (phoneExists) return res.status(409).json({ error: 'This mobile number is already in use.' });
    user.phone = parsed.data.phone;
  }

  // Uniqueness check for email
  if (parsed.data.email && parsed.data.email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      _id: { $ne: user._id }
    }).lean();
    if (emailExists) return res.status(409).json({ error: 'User with this email exists, you cannot use this email.' });
    user.email = parsed.data.email.toLowerCase();
  }

  if (parsed.data.name)              user.name = parsed.data.name;
  if (parsed.data.age !== undefined) user.age  = parsed.data.age;
  if (parsed.data.gender)            user.gender = parsed.data.gender;

  await user.save();

  // Return the full updated user object (fixes frontend setMe(updated))
  return res.json({
    id:     String(user._id),
    name:   user.name,
    email:  user.email,
    phone:  user.phone,
    age:    user.age,
    gender: user.gender,
    avatar: user.avatar?.data ? { mime: user.avatar.mime, data: user.avatar.data } : null
  });
});

/* ── PUT /me/avatar ── */
const avatarSchema = z.object({
  mime: z.string().min(3),
  data: z.string().min(10)
});

router.put('/avatar', requireAuth, async (req, res) => {
  const parsed = avatarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  user.avatar = { mime: parsed.data.mime, data: parsed.data.data };
  await user.save();
  return res.json({ ok: true });
});

/* ── DELETE /me ── */
router.delete('/', requireAuth, async (req, res) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Clear auth cookie upon account deletion
  res.clearCookie('auth_token', cookieOpts);
  return res.json({ ok: true });
});

export default router;
