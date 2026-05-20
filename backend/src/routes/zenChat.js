import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import ZenSession from '../models/ZenSession.js';
import ZenMessage from '../models/ZenMessage.js';
import CrisisLog from '../models/CrisisLog.js';
import User from '../models/User.js';

const router = Router();

// ── ISO Week helper ────────────────────────────────────────────────────────────
function getISOWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── Privacy helper ─────────────────────────────────────────────────────────────
function hashUserId(userId) {
  return crypto.createHash('sha256').update(String(userId)).digest('hex');
}

// ── Crisis keyword definitions ─────────────────────────────────────────────────
// Grouped by category. Text is lowercased before matching.
// Phrases chosen carefully — broad enough to catch real signals, narrow enough to
// avoid false positives on casual language.
const CRISIS_PATTERNS = [
  {
    category: 'suicide_ideation',
    phrases: [
      'end my life', 'ending my life', 'take my life', 'taking my life',
      'kill myself', 'killing myself', 'want to die', 'wants to die',
      'wish i was dead', 'wish i were dead', 'better off dead',
      'no reason to live', 'not worth living', 'don\'t want to be alive',
      'dont want to be alive', 'suicidal', 'suicide',
    ],
  },
  {
    category: 'self_harm',
    phrases: [
      'hurt myself', 'hurting myself', 'cut myself', 'cutting myself',
      'self harm', 'self-harm', 'selfharm', 'harming myself',
      'burn myself', 'burning myself', 'harm myself',
    ],
  },
  {
    category: 'severe_distress',
    phrases: [
      'can\'t go on', 'cant go on', 'cannot go on', 'can\'t take it anymore',
      'cant take it anymore', 'cannot take it anymore', 'give up on life',
      'giving up on life', 'have nothing to live for', 'has nothing to live for',
      'life is not worth', 'feel hopeless', 'feeling hopeless', 'no hope left',
      'lost all hope', 'completely hopeless',
    ],
  },
  {
    category: 'hindi_crisis',
    phrases: [
      'marna chahta', 'marna chahti', 'mar jaana chahta', 'mar jaana chahti',
      'jeena nahi', 'jina nahi', 'zindagi nahi chahiye', 'khud ko hurt karna',
      'khud ko cut karna', 'maut chahiye', 'khatam karna chahta', 'khatam karna chahti',
    ],
  },
];

/**
 * Checks whether a user message contains a crisis signal.
 * Returns { triggered: boolean, category?: string } — never throws.
 */
function checkCrisisKeywords(message) {
  if (!message || typeof message !== 'string') return { triggered: false };
  const lower = message.toLowerCase().trim();
  for (const group of CRISIS_PATTERNS) {
    for (const phrase of group.phrases) {
      if (lower.includes(phrase)) {
        return { triggered: true, category: group.category };
      }
    }
  }
  return { triggered: false };
}

// ── Per-user cooldown map (in-memory, resets on server restart) ────────────────
// Prevents log spam if user repeatedly sends crisis messages in quick succession.
const CRISIS_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const lastCrisisTime = new Map(); // userId -> timestamp

/**
 * POST /api/zen-chat
 * Handles a Zeni AI reply and persists messages to MongoDB.
 *
 * Body: { messages: [{role, content}], sessionId?: string }
 * Returns: { reply, sessionId }
 *
 * Session lifecycle:
 *   - No sessionId → creates a new ZenSession automatically
 *   - sessionId provided → appends to existing session
 *   - DB writes are fire-and-forget (never delay the AI response)
 *
 * Crisis flow:
 *   - Latest user message is scanned BEFORE the Groq call
 *   - If a crisis keyword is detected: skip Groq, return crisis type response
 *   - Log is stored anonymized (hashed userId + phrase category + ISO week)
 *   - 10-minute per-user cooldown prevents log flooding
 */
router.post('/', requireAuth, async (req, res) => {
  const { messages, sessionId: incomingSessionId } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  // Check user tier and credits
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (user.subscriptionTier !== 'platinum' && user.aiWeeklyCredits <= 0) {
    return res.status(403).json({ error: 'You have run out of AI Chat credits for this week. Please upgrade your plan.' });
  }

  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1';
  const model  = process.env.AI_MODEL  || 'llama-3.1-8b-instant';

  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured. Please set AI_API_KEY.' });
  }

  // ── Resolve / create session ────────────────────────────────────────────
  let sessionId = incomingSessionId || null;
  let session = null;

  try {
    if (sessionId) {
      session = await ZenSession.findOne({ _id: sessionId, userId: req.user.id });
    }

    if (!session) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 70).replace(/\n/g, ' ')
        : 'New Conversation';
      session = await ZenSession.create({ userId: req.user.id, title });
      sessionId = session._id.toString();
    }
  } catch (dbErr) {
    console.error('[ZenChat] Session resolve error:', dbErr.message);
  }

  // ── Persist user's latest message (fire-and-forget) ─────────────────────
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (session && latestUserMsg) {
    ZenMessage.create({
      sessionId: session._id,
      role: 'user',
      content: latestUserMsg.content,
    }).catch(e => console.error('[ZenChat] Save user msg error:', e.message));
  }

  // ── 🚨 CRISIS KEYWORD SCAN (runs BEFORE any Groq call) ──────────────────
  if (latestUserMsg) {
    const { triggered, category } = checkCrisisKeywords(latestUserMsg.content);

    if (triggered) {
      const userId = req.user.id;
      const now = Date.now();
      const lastTime = lastCrisisTime.get(userId) || 0;
      const inCooldown = (now - lastTime) < CRISIS_COOLDOWN_MS;

      if (!inCooldown) {
        // Update cooldown timestamp
        lastCrisisTime.set(userId, now);

        // Persist anonymized log (fire-and-forget — never blocks response)
        CrisisLog.create({
          userHash: hashUserId(userId),
          phraseCategory: category,
          isoWeek: getISOWeekString(),
        }).catch(e => console.error('[ZenChat] Crisis log error:', e.message));
      }

      // Build a warm, non-alarmist empathy response
      const crisisReply = `I hear you, and what you're feeling right now is real and valid. I'm really glad you're talking to me. You don't have to carry this alone — reaching out like this takes real courage. Can you tell me a little more about what's been happening for you?\n\n[ACTION:CRISIS]`;

      // Save assistant crisis reply (fire-and-forget)
      if (session) {
        Promise.all([
          ZenMessage.create({
            sessionId: session._id,
            role: 'assistant',
            content: crisisReply,
            action: 'CRISIS',
          }),
          ZenSession.findByIdAndUpdate(session._id, { $inc: { messageCount: 2 } }),
        ]).catch(e => console.error('[ZenChat] Save crisis msg error:', e.message));
      }

      return res.json({ reply: crisisReply, sessionId });
    }
  }

  // ── ZenMind Mental Wellness System Prompt ─────────────────────────────────
  const systemPrompt = {
    role: 'system',
    content: `You are Zeni, a warm and deeply empathetic mental wellness companion for ZenMind — a platform supporting adolescents aged 13–21.

━━━ CORE IDENTITY ━━━
- Your name is Zeni. Never say you are an AI, ChatGPT, or any model.
- You are strictly a mental health companion. If asked about anything unrelated to mental health, emotions, stress, relationships, studies, self-esteem, anxiety, depression, bullying, or personal struggles — calmly say: "I'm here only for your mental wellness journey. I'm not able to help with that, but I'm always here if you want to talk about how you're feeling. 💚"
- You can switch languages if the user explicitly asks (e.g. "talk to me in Hindi"). Mirror their language naturally.

━━━ PERSONALITY ━━━
- Deeply empathetic AND sympathetic — feel what they feel, not just acknowledge it
- Warm, calm, non-judgmental, like a trusted older sibling or friend
- Simple, relatable language — no clinical jargon
- NEVER give unsolicited advice. Advice without listening feels dismissive.
- Always acknowledge feelings BEFORE any perspective or suggestion

━━━ CONVERSATION FLOW (follow this strictly) ━━━

STAGE 1 — BE A LISTENER FIRST:
When a user expresses stress, sadness, anxiety, or emotional distress:
→ Do NOT give advice or tips yet.
→ Just listen. Validate. Ask them to share more.
→ Be empathetic: "That sounds really heavy. I'm glad you're sharing this with me."
→ Sympathetic: Show you genuinely feel for them, not just acknowledge.
→ Ask open-ended questions: "Do you want to tell me more about what happened?"

STAGE 2 — OFFER A STORY (only after they've shared and you feel they're still stuck):
If the user keeps expressing the same distress after 2-3 exchanges, gently offer a story:
→ Say something like: "You know, someone your age went through something very similar and found their way out. Would you like to hear their story? It might help to know you're not alone."
→ Then add this EXACT tag at the END of your message (nothing after it): [ACTION:STORY_BUTTONS]
→ IMPORTANT: Use [ACTION:STORY_BUTTONS] ONLY when OFFERING to tell a story. NEVER use it after you have already told the story.

STAGE 2b — TELL THE STORY (when user says yes to hearing a story):
Tell a warm, brief, realistic story of an Indian teenager who overcame a similar struggle. Keep it under 120 words. End on hope.
After the story, ask: "Does that feel a little relatable? How are you feeling right now?"
Then add this EXACT tag at the END of your message (nothing after it): [ACTION:POST_STORY]
→ IMPORTANT: Use [ACTION:POST_STORY] ONLY after you have FINISHED telling the story. Never use STORY_BUTTONS after the story.

STAGE 3 — AFTER STORY CHECK-IN:
The user will see "Feeling good 😊" and "Connect to a real person" buttons after your story.
- If user clicks "Feeling good" → respond warmly, celebrate their resilience, gently keep the conversation going. No action tag needed.
- If user clicks "Connect to a real person" → Move to Stage 3b.

STAGE 3b — PSYCHIATRIST-STYLE ASSESSMENT:
When user wants to connect to a real therapist, first run a short empathetic assessment using these 4 questions (one message, conversational tone, NOT a numbered list — weave them naturally):
1. How long have you been feeling this way — days, weeks, or longer?
2. Has it been affecting your sleep, appetite, or energy levels?
3. Is there something specific that triggered this, or does it feel like it's been building up?
4. On a scale of 1 to 10, how much is this affecting your day-to-day life?

After they answer, in your NEXT message:
→ Summarize what you heard with empathy
→ Classify their state clearly: e.g. "Based on what you've shared, it sounds like you may be experiencing [anxiety / depression / chronic stress / burnout / trauma response / low self-esteem / social isolation]. This is real, and it deserves real support."
→ Say: "You can talk to a real, licensed therapist on ZenMind's Therapy Hub. Every therapist there is verified and specializes in exactly what you're going through. You deserve someone who truly gets it."
→ Then add this EXACT tag at the END: [ACTION:THERAPY_BUTTON]

━━━ CRISIS PROTOCOL ━━━
- IMPORTANT: The backend already scans for direct crisis keywords and handles them automatically before your response is generated. If you still sense indirect crisis signals not caught by the filter (e.g. vague hopelessness, indirect self-harm references), follow these steps:
- First respond with warmth and empathy. Let them feel heard. Say something like: "I hear you, and what you're feeling is real and valid. I'm really glad you're talking to me right now. Can you tell me a bit more about what's happening?"
- If after 1-2 more messages they still express serious risk, OR if they say something very direct about harming themselves — THEN include crisis support with this EXACT tag at END: [ACTION:CRISIS]
- The [ACTION:CRISIS] tag will show Indian crisis helplines as clickable links. You do not need to type the numbers yourself.

━━━ STORY BANK (use these or create similar realistic ones) ━━━
When asked to share a story, tell a brief, realistic, first-person style story of an Indian teenager who overcame something similar (stress, bullying, exam pressure, loneliness, family issues). Make it warm, real, and hopeful. Keep it under 120 words. End it on a note of hope.

━━━ RESPONSE RULES ━━━
- Keep replies concise — 2-5 sentences unless telling a story
- Always end with a gentle follow-up question (unless adding an ACTION tag)
- Never use bullet points or headers in responses — speak naturally
- ACTION tags must ALWAYS be the very last thing in your message, on their own line
- Never add any text after an ACTION tag`,
  };

  const fullMessages = [systemPrompt, ...messages];

  // 25s server-side timeout — must respond before the frontend 30s AbortController fires
  const aiController = new AbortController();
  const aiTimeout = setTimeout(() => aiController.abort(), 25000);

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      signal: aiController.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://zenmind.onrender.com',
        'X-Title': 'ZenMind',
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        max_tokens: 400,
        temperature: 0.82,
      }),
    });

    clearTimeout(aiTimeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ZenChat] AI API error:', response.status, errText);

      if (response.status === 429) {
        return res.status(429).json({ error: 'AI service is busy right now. Please wait a moment and try again.' });
      }
      if (response.status === 401) {
        return res.status(502).json({ error: 'AI service configuration error. Please contact support.' });
      }

      let errMsg = 'AI service error. Please try again.';
      try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
      return res.status(502).json({ error: errMsg });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI service.' });
    }

    // ── Detect action tag to persist alongside assistant message ─────────
    const ACTION_RE = /\[ACTION:(STORY_BUTTONS|POST_STORY|THERAPY_BUTTON|CRISIS)\]/g;
    const actionMatch = new RegExp(ACTION_RE.source, 'g').exec(reply);
    const detectedAction = actionMatch ? actionMatch[1] : null;

    // ── Persist assistant reply (fire-and-forget) ─────────────────────────
    if (session) {
      Promise.all([
        ZenMessage.create({
          sessionId: session._id,
          role: 'assistant',
          content: reply,
          action: detectedAction,
        }),
        ZenSession.findByIdAndUpdate(session._id, {
          $inc: { messageCount: 2 }, // user + assistant
        }),
      ]).catch(e => console.error('[ZenChat] Save assistant msg error:', e.message));
    }

    if (user.subscriptionTier !== 'platinum') {
      await User.findByIdAndUpdate(user._id, { $inc: { aiWeeklyCredits: -1 } });
    }

    return res.json({ reply, sessionId });
  } catch (err) {
    clearTimeout(aiTimeout);
    console.error('[ZenChat] Error:', err.message);

    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI service took too long to respond. Please try again.' });
    }

    return res.status(500).json({ error: 'Failed to connect to AI service.' });
  }
});

export default router;
