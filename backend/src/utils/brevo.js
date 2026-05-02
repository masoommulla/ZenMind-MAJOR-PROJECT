/**
 * Brevo transactional email via REST API — using axios.
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
 */

import axios from 'axios';

async function brevoPost(payload) {
  const apiKey      = (process.env.BREVO_API_KEY      || '').trim();
  const senderEmail = (process.env.BREVO_SENDER_EMAIL  || '').trim();
  const senderName  =  process.env.BREVO_SENDER_NAME  || 'ZenMind';

  if (!apiKey)      throw new Error('[Brevo] BREVO_API_KEY missing from .env');
  if (!senderEmail) throw new Error('[Brevo] BREVO_SENDER_EMAIL missing from .env');

  const requestBody = {
    sender: { email: senderEmail, name: senderName },
    ...payload,
  };

  console.log(`[Brevo] Sending to: ${JSON.stringify(payload.to)} | subject: ${payload.subject}`);

  try {
    const { data } = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        timeout: 15000,
      }
    );
    console.log('[Brevo] ✅ Email sent. messageId:', data.messageId);
    return data;
  } catch (err) {
    if (err.response) {
      const msg = JSON.stringify(err.response.data);
      console.error(`[Brevo] ❌ HTTP ${err.response.status}:`, msg);
      throw new Error(`Brevo error ${err.response.status}: ${msg}`);
    } else if (err.request) {
      console.error('[Brevo] ❌ No response from Brevo (network/timeout):', err.message);
      throw new Error('Brevo: network error — no response received');
    } else {
      console.error('[Brevo] ❌ Request setup error:', err.message);
      throw new Error(`Brevo: ${err.message}`);
    }
  }
}

export async function sendOtpEmail({ toEmail, toName, code }) {
  return brevoPost({
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: 'Your ZenMind Verification Code',
    htmlContent: `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#eef6f1;padding:32px 16px;">
  <div style="max-width:480px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,93,58,0.10);">
    <div style="background:linear-gradient(135deg,#0d5d3a,#1a8a5a);padding:28px 32px;">
      <h2 style="margin:0;color:#fff;font-size:20px;font-weight:700;">&#128272; ZenMind Verification</h2>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 12px;">Hey <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 24px;">
        Your one-time verification code is below. It expires in <strong>2 minutes</strong>.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <div style="display:inline-block;background:#f4fbf6;border:2px solid #0d5d3a;border-radius:14px;padding:18px 40px;">
          <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#0d5d3a;font-family:monospace;">${code}</span>
        </div>
      </div>
      <p style="color:#8aab99;font-size:13px;line-height:1.6;margin:0;">
        If you didn't request this, ignore this email. Never share this code.
      </p>
    </div>
    <div style="background:#f7fbf8;padding:16px 32px;border-top:1px solid #e0ede6;">
      <p style="margin:0;font-size:12px;color:#8aab99;text-align:center;">&#128153; Team ZenMind</p>
    </div>
  </div>
</div>`,
  });
}

export async function sendWelcomeEmail({ toEmail, toName }) {
  return brevoPost({
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: "Welcome to ZenMind — You're not alone",
    htmlContent: `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#eef6f1;padding:32px 16px;">
  <div style="max-width:580px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,93,58,0.10);">
    <div style="background:linear-gradient(135deg,#0d5d3a,#1a8a5a);padding:32px 36px;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Welcome to ZenMind &#127807;</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your personal mental wellness companion</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="font-size:17px;color:#0a2617;margin:0 0 16px;">Hi <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0;">
        We're really glad you're here. Start your wellness journey today.
      </p>
    </div>
    <div style="background:#f7fbf8;padding:20px 36px;border-top:1px solid #e0ede6;">
      <p style="margin:0;font-size:12px;color:#8aab99;text-align:center;">&#128153; Team ZenMind</p>
    </div>
  </div>
</div>`,
  });
}
