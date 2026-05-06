import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { Therapist } from '../models/Therapist.js';
import { cookieOpts } from '../utils/cookieOptions.js';

const router = Router();
const therapistCookieOpts = { ...cookieOpts };

// Multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'therapist-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage });

/* ── Auth Middleware ── */
export const requireTherapist = async (req, res, next) => {
  try {
    const token = req.cookies.therapist_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'therapist') return res.status(403).json({ error: 'Forbidden' });

    const therapist = await Therapist.findById(decoded.sub)
      .select('-password -aadharNumber -identityCardType -identityCardImage')
      .lean();
    if (!therapist) return res.status(401).json({ error: 'Unauthorized' });
    if (therapist.isSuspended) return res.status(403).json({ error: 'Account suspended' });

    req.therapist = therapist;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/* ── POST /therapist/login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  const therapist = await Therapist.findOne({ email }).lean();
  if (!therapist) return res.status(401).json({ error: 'Invalid credentials' });
  if (therapist.isSuspended) return res.status(403).json({ error: 'Account suspended by Admin' });

  const valid = await bcrypt.compare(password, therapist.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: String(therapist._id), role: 'therapist' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('therapist_token', token, therapistCookieOpts);
  return res.json({ ok: true });
});

/* ── POST /therapist/logout ── */
router.post('/logout', (_req, res) => {
  res.clearCookie('therapist_token', therapistCookieOpts);
  return res.json({ ok: true });
});

/* ── GET /therapist/me ── */
router.get('/me', requireTherapist, (req, res) => {
  return res.json({ ok: true, therapist: req.therapist });
});

/* ── PUT /therapist/profile  (phone + residentialAddress + clinicAddress + sessionType + profilePicture + clinicImages) ── */
router.put('/profile', requireTherapist, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'clinicImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    const { phone, residentialAddress, clinicAddress, sessionType, password, deleteClinicImages } = req.body;
    if (phone) therapist.phone = phone;
    if (residentialAddress !== undefined) therapist.residentialAddress = residentialAddress;
    if (clinicAddress !== undefined) therapist.clinicAddress = clinicAddress;
    if (sessionType !== undefined) therapist.sessionType = sessionType;
    if (password) therapist.password = password; // pre-save hook hashes it

    if (deleteClinicImages) {
      let toDelete = [];
      try {
        toDelete = JSON.parse(deleteClinicImages);
      } catch (e) {
        toDelete = [deleteClinicImages];
      }
      therapist.clinicImages = therapist.clinicImages.filter(img => !toDelete.includes(img));
    }

    if (req.files) {
      if (req.files['profilePicture'] && req.files['profilePicture'][0]) {
        therapist.profilePicture = `/uploads/${req.files['profilePicture'][0].filename}`;
      }
      if (req.files['clinicImages'] && req.files['clinicImages'].length > 0) {
        const newImages = req.files['clinicImages'].map(f => `/uploads/${f.filename}`);
        therapist.clinicImages = [...therapist.clinicImages, ...newImages];
      }
    }

    await therapist.save();
    const updated = therapist.toObject();
    delete updated.password;
    delete updated.aadharNumber;
    delete updated.identityCardType;
    delete updated.identityCardImage;
    return res.json({ ok: true, therapist: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── PUT /therapist/schedule ── */
router.put('/schedule', requireTherapist, async (req, res) => {
  try {
    const { sessionTime, sessionCost, availableSlots, notes } = req.body;
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    if (sessionTime !== undefined) therapist.sessionTime = Number(sessionTime);
    if (sessionCost !== undefined) therapist.sessionCost = Number(sessionCost);
    if (availableSlots !== undefined) therapist.availableSlots = availableSlots;
    if (notes !== undefined) therapist.notes = notes;

    await therapist.save();
    return res.json({ ok: true, therapist });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── PUT /therapist/settings (legacy — kept for compat) ── */
router.put('/settings', requireTherapist, async (req, res) => {
  try {
    const { phone, password } = req.body;
    const therapist = await Therapist.findById(req.therapist._id);
    if (!therapist) return res.status(404).json({ error: 'Not found' });

    if (phone) therapist.phone = phone;
    if (password) therapist.password = password;

    await therapist.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
