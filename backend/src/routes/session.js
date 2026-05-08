import { Router } from 'express';
import { Session } from '../models/Session.js';
import { Therapist } from '../models/Therapist.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { requireTherapist } from './therapist.js';
import {
  sendSessionBookingUser,
  sendSessionBookingTherapist,
  sendSessionReminderUser,
  sendSessionReminderTherapist,
  sendSessionCompleteUser,
  sendCancellationUser,
  sendCancellationTherapistNotif,
  sendTherapistNoShowUser,
} from '../utils/mailer.js';

const router = Router();

// ─── Helper: schedule 10-min reminders (in-process, lost on restart) ─────────
function scheduleReminders({ user, therapist, session }) {
  const sessionMs   = new Date(session.date).getTime();
  const reminderMs  = sessionMs - 10 * 60 * 1000;
  const delay       = reminderMs - Date.now();
  if (delay <= 0) return; // session too soon / already passed
  setTimeout(async () => {
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);
    sendSessionReminderUser({
      toEmail: user.email, userName: user.name,
      therapistName: therapist.name, sessionDate: sd, sessionTime: st
    }).catch(e => console.error('[Mailer] reminder-user:', e.message));
    sendSessionReminderTherapist({
      toEmail: therapist.email, therapistName: therapist.name,
      userName: user.name, sessionDate: sd, sessionTime: st
    }).catch(e => console.error('[Mailer] reminder-therapist:', e.message));
  }, delay);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

// ─── Helper: refund % based on days until session ────────────────────────────
function refundPercent(sessionDate) {
  const days = (new Date(sessionDate) - Date.now()) / (1000 * 60 * 60 * 24);
  if (days >= 3) return 100;
  if (days >= 2) return 80;
  return 70;
}

/* ── POST /api/sessions/book ── */
router.post('/book', requireAuth, async (req, res) => {
  try {
    const { therapistId, slotISO } = req.body;
    if (!therapistId || !slotISO) return res.status(400).json({ error: 'Missing therapistId or slotISO' });

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const slotIndex = therapist.availableSlots.indexOf(slotISO);
    if (slotIndex === -1) return res.status(409).json({ error: 'Slot is no longer available' });

    therapist.availableSlots.splice(slotIndex, 1);
    await therapist.save();

    const user = await User.findById(req.user.id).lean();

    const session = await Session.create({
      user: req.user.id,
      therapist: therapist._id,
      therapistName: therapist.name,
      date: new Date(slotISO),
      amountPaid: therapist.sessionCost
    });

    // Send booking confirmation emails (non-blocking)
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);
    sendSessionBookingUser({
      toEmail: user.email, userName: user.name,
      therapistName: therapist.name, therapistSpec: therapist.specialization,
      therapistClinic: therapist.clinicAddress, sessionDate: sd, sessionTime: st,
      amountPaid: therapist.sessionCost, sessionDuration: therapist.sessionTime
    }).catch(e => console.error('[Mailer] booking-user:', e.message));

    sendSessionBookingTherapist({
      toEmail: therapist.email, therapistName: therapist.name,
      userName: user.name, userPhone: user.phone,
      sessionDate: sd, sessionTime: st,
      sessionDuration: therapist.sessionTime, amountPaid: therapist.sessionCost
    }).catch(e => console.error('[Mailer] booking-therapist:', e.message));

    // Schedule 10-min reminders
    scheduleReminders({ user, therapist, session });

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/sessions/me ── */
router.get('/me', requireAuth, async (req, res) => {
  try {
    let sessions = await Session.find({ user: req.user.id }).sort({ date: 1 }).lean();
    const now = new Date();
    const user = await User.findById(req.user.id).lean();

    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true }).lean();
        // Auto-cancel: user no-show → 70% refund
        const therapist = await Therapist.findById(s.therapist).lean();
        if (user && therapist) {
          sendCancellationUser({
            toEmail: user.email, userName: user.name,
            therapistName: s.therapistName,
            sessionDate: fmtDate(s.date), sessionTime: fmtTime(s.date),
            amountPaid: s.amountPaid, refundPct: 70, reason: 'noshow'
          }).catch(e => console.error('[Mailer] auto-cancel-noshow:', e.message));
        }
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

    const now = new Date();
    const updatedSessions = await Promise.all(sessions.map(async (s) => {
      if (s.status === 'booked' && now.getTime() > new Date(s.date).getTime() + 10 * 60 * 1000) {
        const updated = await Session.findByIdAndUpdate(s._id, { status: 'cancelled' }, { new: true })
          .populate('user', 'name email phone').lean();
        // Therapist no-show → 100% refund to user
        if (s.user) {
          sendTherapistNoShowUser({
            toEmail: s.user.email, userName: s.user.name,
            therapistName: s.therapistName,
            sessionDate: fmtDate(s.date), sessionTime: fmtTime(s.date),
            amountPaid: s.amountPaid
          }).catch(e => console.error('[Mailer] therapist-noshow:', e.message));
        }
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
    const now = new Date();
    const result = await Session.deleteMany({
      _id: { $in: sessionIds },
      user: req.user.id,
      date: { $lt: now }
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
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 5.' });
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
    const session = await Session.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Send post-session thank-you to user
    const user = await User.findById(session.user).lean();
    if (user) {
      sendSessionCompleteUser({
        toEmail: user.email, userName: user.name, therapistName: session.therapistName
      }).catch(e => console.error('[Mailer] post-session:', e.message));
    }

    return res.json({ ok: true, session });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete session' });
  }
});

/* ── POST /api/sessions/:id/cancel ── */
router.post('/:id/cancel', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('user', 'name email phone');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const therapist = await Therapist.findById(session.therapist).lean();
    const refundPct = refundPercent(session.date);
    const sd = fmtDate(session.date);
    const st = fmtTime(session.date);

    session.status = 'cancelled';
    await session.save();

    // Email user with refund details
    if (session.user) {
      sendCancellationUser({
        toEmail: session.user.email, userName: session.user.name,
        therapistName: session.therapistName,
        sessionDate: sd, sessionTime: st,
        amountPaid: session.amountPaid, refundPct, reason: 'manual'
      }).catch(e => console.error('[Mailer] cancel-user:', e.message));
    }

    // Notify therapist that slot was cancelled
    if (therapist && session.user) {
      sendCancellationTherapistNotif({
        toEmail: therapist.email, therapistName: therapist.name,
        userName: session.user.name, sessionDate: sd, sessionTime: st
      }).catch(e => console.error('[Mailer] cancel-therapist:', e.message));
    }

    return res.json({ ok: true, session, refundPct });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel session' });
  }
});

export default router;
