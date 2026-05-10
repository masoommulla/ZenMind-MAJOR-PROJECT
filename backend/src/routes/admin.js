import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Story from '../models/Story.js';
import SiteSettings from '../models/SiteSettings.js';
import SupportTicket from '../models/SupportTicket.js';
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

/* ── GET /admin/settings/site ── */
router.get('/settings/site', requireAdmin, async (req, res) => {
  const settings = await SiteSettings.findOne().lean();
  return res.json({ ok: true, settings: settings || {} });
});

/* ── PUT /admin/settings/site ── */
const siteSettingsSchema = z.object({
  activeUsers: z.string().optional(),
  satisfactionRate: z.string().optional(),
  therapistsCount: z.string().optional(),
  supportAvailable: z.string().optional(),
});

router.put('/settings/site', requireAdmin, async (req, res) => {
  const parsed = siteSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings(parsed.data);
  } else {
    if (parsed.data.activeUsers !== undefined) settings.activeUsers = parsed.data.activeUsers;
    if (parsed.data.satisfactionRate !== undefined) settings.satisfactionRate = parsed.data.satisfactionRate;
    if (parsed.data.therapistsCount !== undefined) settings.therapistsCount = parsed.data.therapistsCount;
    if (parsed.data.supportAvailable !== undefined) settings.supportAvailable = parsed.data.supportAvailable;
  }
  await settings.save();
  return res.json({ ok: true, settings });
});

/* ── GET /admin/stories  (all stories including pending) ── */
router.get('/stories', requireAdmin, async (req, res) => {
  const { status } = req.query; // 'pending' | 'approved' | 'all'
  const query = {};
  if (status === 'pending')  query.isApproved = false;
  if (status === 'approved') query.isApproved = true;

  const stories = await Story.find(query).sort({ createdAt: -1 }).lean();
  const pendingCount  = await Story.countDocuments({ isApproved: false });
  const approvedCount = await Story.countDocuments({ isApproved: true });

  return res.json({ ok: true, stories, pendingCount, approvedCount });
});

/* ── PATCH /admin/stories/:id/approve  (approve or reject) ── */
router.patch('/stories/:id/approve', requireAdmin, async (req, res) => {
  const { approved } = req.body; // true = approve, false = reject (delete)
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ error: 'approved (boolean) is required' });
  }

  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  if (approved) {
    story.isApproved = true;
    await story.save();
    return res.json({ ok: true, action: 'approved', story });
  } else {
    // Rejected = delete
    await Story.findByIdAndDelete(req.params.id);
    return res.json({ ok: true, action: 'rejected' });
  }
});

/* ── DELETE /admin/stories/:id ── */
router.delete('/stories/:id', requireAdmin, async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  return res.json({ ok: true });
});

/* ── POST /admin/stories/bulk-action ── */
router.post('/stories/bulk-action', requireAdmin, async (req, res) => {
  const { ids, action } = req.body; // action: 'approve' | 'delete'
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids required' });

  if (action === 'approve') {
    await Story.updateMany({ _id: { $in: ids } }, { $set: { isApproved: true } });
    return res.json({ ok: true, updated: ids.length });
  }
  if (action === 'delete') {
    await Story.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true, deleted: ids.length });
  }
  return res.status(400).json({ error: 'action must be approve or delete' });
});


/* ── THERAPIST MANAGEMENT ── */
import { Therapist } from '../models/Therapist.js';
import multer from 'multer';
import path from 'path';

// Multer storage config
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.get('/therapists', requireAdmin, async (req, res) => {
  try {
    const therapists = await Therapist.find({}, '-password').sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, therapists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /admin/therapists/:id  (full detail for admin verification) ── */
router.get('/therapists/:id', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id, '-password').lean();
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    return res.json({ ok: true, therapist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/therapists', requireAdmin,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'identityCardImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      const existing = await Therapist.findOne({ email: data.email });
      if (existing) return res.status(400).json({ error: 'Email already in use' });

      const therapist = new Therapist({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        specialization: data.specialization,
        experience: Number(data.experience) || 0,
        education: data.education,
        clinicAddress: data.clinicAddress,
        about: data.about || '',
        languages: data.languages ? data.languages.split(',').map((l) => l.trim()) : ['English', 'Hindi'],
        sessionTime: Number(data.sessionTime) || 30,
        sessionCost: Number(data.sessionCost) || 500,
        aadharNumber: data.aadharNumber || '',
        identityCardType: data.identityCardType || 'Aadhaar',
      });

      if (req.files?.['profilePicture']) {
        const file = req.files['profilePicture'][0];
        therapist.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['licenseImage']) {
        const file = req.files['licenseImage'][0];
        therapist.licenseImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['identityCardImage']) {
        const file = req.files['identityCardImage'][0];
        therapist.identityCardImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }

      await therapist.save();
      return res.json({ ok: true, therapist });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put('/therapists/:id', requireAdmin,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'identityCardImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      const therapist = await Therapist.findById(req.params.id);
      if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

      if (data.name) therapist.name = data.name;
      if (data.email && data.email !== therapist.email) {
        const existing = await Therapist.findOne({ email: data.email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });
        therapist.email = data.email;
      }
      if (data.password) therapist.password = data.password;
      if (data.phone) therapist.phone = data.phone;
      if (data.specialization) therapist.specialization = data.specialization;
      if (data.experience) therapist.experience = Number(data.experience);
      if (data.education) therapist.education = data.education;
      if (data.clinicAddress) therapist.clinicAddress = data.clinicAddress;
      if (data.about !== undefined) therapist.about = data.about;
      if (data.languages) therapist.languages = data.languages.split(',').map((l) => l.trim());
      if (data.aadharNumber !== undefined) therapist.aadharNumber = data.aadharNumber;
      if (data.identityCardType) therapist.identityCardType = data.identityCardType;

      if (req.files?.['profilePicture']) {
        const file = req.files['profilePicture'][0];
        therapist.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['licenseImage']) {
        const file = req.files['licenseImage'][0];
        therapist.licenseImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
      if (req.files?.['identityCardImage']) {
        const file = req.files['identityCardImage'][0];
        therapist.identityCardImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }

      await therapist.save();
      return res.json({ ok: true, therapist });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put('/therapists/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    therapist.isSuspended = !therapist.isSuspended;
    await therapist.save();
    return res.json({ ok: true, isSuspended: therapist.isSuspended });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/therapists/:id', requireAdmin, async (req, res) => {
  try {
    const therapist = await Therapist.findByIdAndDelete(req.params.id);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── SUPPORT MANAGEMENT ── */
router.get('/support', requireAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/support/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    ticket.status = ticket.status === 'pending' ? 'resolved' : 'pending';
    await ticket.save();
    return res.json({ ok: true, status: ticket.status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/support/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid ids array' });
    
    await SupportTicket.deleteMany({ _id: { $in: ids } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
