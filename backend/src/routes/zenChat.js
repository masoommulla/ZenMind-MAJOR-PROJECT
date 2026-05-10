import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/zen-chat
 * Generic OpenAI-compatible endpoint — works with any provider:
 *   OpenAI, Groq, Together AI, Mistral, OpenRouter, etc.
 *
 * .env:
 *   AI_API_KEY    — your API key from any provider
 *   AI_API_URL    — base URL (default: https://api.openai.com/v1)
 *   AI_MODEL      — model name (default: llama-3.1-8b-instant)
 */
router.post('/', requireAuth, async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1';
  const model  = process.env.AI_MODEL  || 'llama-3.1-8b-instant';

  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured. Please set AI_API_KEY.' });
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
If the user keeps expressing the same distress after 2-3 exchanges, gently offer:
→ Say something like: "You know, someone your age went through something very similar and found their way out. Would you like to hear their story? It might help to know you're not alone."
→ Then add this EXACT tag at the END of your message (nothing after it): [ACTION:STORY_BUTTONS]

STAGE 3 — IF STORY DIDN'T HELP (follow up after sharing):
After sharing a story, ask: "Did that feel helpful at all, or do you feel like you need more support?"
If they say no or still seem stuck, move to Stage 4.

STAGE 4 — SUGGEST THERAPIST + CLASSIFY:
When you feel the user needs professional help, do ALL of these in ONE message:
1. Gently say you think talking to a professional might really help.
2. Based on the conversation, briefly classify what you sense they might be dealing with (stress / anxiety / depression / bullying / low self-esteem / grief — pick the most relevant).
3. Say something like: "Based on what you've shared, it sounds like you might be dealing with [classification]. We have therapists on ZenMind who specialize in exactly this."
4. End with: "You can visit our Therapy Hub and find a therapist who truly gets what you're going through."
5. Add this EXACT tag at END of message: [ACTION:THERAPY_BUTTON]

━━━ CRISIS PROTOCOL ━━━
- If a user mentions feeling hopeless, not wanting to live, ending their life, or self-harm — DO NOT immediately share helpline numbers.
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
- Never add any text after an ACTION tag`
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

    return res.json({ reply });
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
