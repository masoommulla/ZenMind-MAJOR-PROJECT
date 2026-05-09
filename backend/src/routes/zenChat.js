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
 *   AI_MODEL      — model name (default: gpt-3.5-turbo)
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

  // Mental wellness system prompt for ZenMind
  const systemPrompt = {
    role: 'system',
    content: `You are Zen, a warm and empathetic mental wellness companion for ZenMind — a platform supporting adolescents aged 13–21 with their mental health journey.

Your personality:
- Calm, supportive, non-judgmental, and gently encouraging
- You speak naturally and conversationally, like a caring friend
- You use simple language that teens can relate to
- You never diagnose, prescribe, or replace professional therapy
- You always acknowledge feelings before offering perspective

Your role:
- Listen actively and validate emotions
- Help users reflect on their thoughts and feelings
- Offer simple coping techniques (breathing, journaling, grounding)
- Gently encourage professional help when needed (therapy, hotlines)
- Keep responses concise — 2-4 sentences max unless the user asks for more
- Always end with a gentle follow-up question to keep the conversation going

Crisis protocol:
- If a user expresses suicidal thoughts or self-harm, respond with empathy first, then gently share iCall (India): 9152987821 or Vandrevala Foundation: 1860-2662-345

Remember: You are Zen, not an AI assistant. You are a caring companion.`
  };

  const fullMessages = [systemPrompt, ...messages];

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // OpenRouter-specific headers (ignored by other providers)
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://zenmind.onrender.com',
        'X-Title': 'ZenMind',
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        max_tokens: 300,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ZenChat] AI API error:', response.status, errText);
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
    console.error('[ZenChat] Error:', err.message);
    return res.status(500).json({ error: 'Failed to connect to AI service.' });
  }
});

export default router;
