import { Router } from 'express';
import { Session } from '../models/Session.js';
import { Therapist } from '../models/Therapist.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTherapist } from './therapist.js';

const router = Router();

/* ── POST /api/sessions/book ── */
router.post('/book', requireAuth, async (req, res) => {
  try {
    const { therapistId, slotISO } = req.body;
    if (!therapistId || !slotISO) return res.status(400).json({ error: 'Missing therapistId or slotISO' });

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    // Check if slot exists in therapist's availableSlots
    const slotIndex = therapist.availableSlots.indexOf(slotISO);
    if (slotIndex === -1) {
      return res.status(409).json({ error: 'Slot is no longer available' });
    }

    // Remove the slot
    therapist.availableSlots.splice(slotIndex, 1);
    await therapist.save();

    // Create the session
    const session = await Session.create({
      user: req.user.id,
      therapist: therapist._id,
      therapistName: therapist.name,
      date: new Date(slotISO),
      amountPaid: therapist.sessionCost
    });

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/sessions/me ── */
router.get('/me', requireAuth, async (req, res) => {
  try {
    let sessions = await Session.find({ user: req.user.id }).sort({ date: 1 }).lean();
    
    // Auto-cancellation check
    const now = new Date();
    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true }).lean();
        return updated;
      }
      return s;
    }));

    return res.json({ ok: true, sessions: updatedSessions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/* ── GET /api/sessions/therapist ── */
router.get('/therapist', requireTherapist, async (req, res) => {
  try {
    let sessions = await Session.find({ therapist: req.therapist._id })
      .populate('user', 'name email phone')
      .sort({ date: 1 })
      .lean();
      
    // Auto-cancellation check
    const now = new Date();
    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true })
          .populate('user', 'name email phone').lean();
        return updated;
      }
      return s;
    }));

    return res.json({ ok: true, sessions: updatedSessions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/* ── DELETE /api/sessions/past ── */
router.delete('/past', requireAuth, async (req, res) => {
  try {
    const { sessionIds } = req.body;
    if (!Array.isArray(sessionIds)) return res.status(400).json({ error: 'Invalid input' });

    // Ensure we only delete past sessions belonging to this user
    const now = new Date();
    const result = await Session.deleteMany({
      _id: { $in: sessionIds },
      user: req.user.id,
      date: { $lt: now } // Only allow deleting if date is in the past
    });

    return res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete past sessions' });
  }
});

/* ── POST /api/sessions/:id/rate ── */
router.post('/:id/rate', requireAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 5.' });
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { rating, review, status: 'completed' },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: 'Session not found or unauthorized' });

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit rating' });
  }
});

/* ── POST /api/sessions/:id/complete ── */
router.post('/:id/complete', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete session' });
  }
});

/* ── POST /api/sessions/:id/cancel ── */
router.post('/:id/cancel', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel session' });
  }
});

export default router;
