/**
 * Nodemailer email utility — Gmail SMTP
 *
 * .env variables required:
 *   EMAIL_USER  = your Gmail address (e.g. yourname@gmail.com)
 *   EMAIL_PASS  = Gmail App Password (16-char, generated in Google Account → Security → App Passwords)
 *   EMAIL_FROM_NAME = Display name (default: ZenMind)
 */

import nodemailer from 'nodemailer';

function createTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('[Mailer] EMAIL_USER or EMAIL_PASS is missing from .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const fromName = () => process.env.EMAIL_FROM_NAME || 'ZenMind';
const fromAddr = () => process.env.EMAIL_USER;
const from     = () => `"${fromName()}" <${fromAddr()}>`;

/* ─── OTP EMAIL ─── */
export async function sendOtpEmail({ toEmail, toName, code }) {
  const transporter = createTransport();

  console.log(`[Mailer] Sending OTP to: ${toEmail}`);

  await transporter.sendMail({
    from: from(),
    to: toEmail,
    subject: 'Your ZenMind Verification Code',
    html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#eef6f1;padding:32px 16px;">
  <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,93,58,0.10);">
    <div style="background:linear-gradient(135deg,#0d5d3a,#1a8a5a);padding:28px 32px;">
      <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">&#128272; ZenMind Verification</h2>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#0a2617;margin:0 0 12px;">Hey <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 24px;">
        Use the code below to verify your identity. It expires in <strong>2 minutes</strong>.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <div style="display:inline-block;background:#f4fbf6;border:2px solid #0d5d3a;border-radius:14px;padding:18px 40px;">
          <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#0d5d3a;font-family:monospace;">${code}</span>
        </div>
      </div>
      <p style="color:#8aab99;font-size:13px;line-height:1.6;margin:0;">
        If you didn't request this, you can safely ignore this email.<br/>
        Never share this code with anyone.
      </p>
    </div>
    <div style="background:#f7fbf8;padding:16px 32px;border-top:1px solid #e0ede6;">
      <p style="margin:0;font-size:12px;color:#8aab99;text-align:center;">
        &#128153; Team ZenMind &nbsp;&bull;&nbsp; Adolescent Mental Wellness Platform
      </p>
    </div>
  </div>
</div>`,
  });

  console.log(`[Mailer] ✅ OTP sent to ${toEmail}`);
}

/* ─── WELCOME EMAIL ─── */
export async function sendWelcomeEmail({ toEmail, toName }) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: from(),
    to: toEmail,
    subject: "Welcome to ZenMind 🌿 You're not alone",
    html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#eef6f1;padding:32px 16px;">
  <div style="max-width:580px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,93,58,0.10);">
    <div style="background:linear-gradient(135deg,#0d5d3a,#1a8a5a);padding:32px 36px;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Welcome to ZenMind &#127807;</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your personal mental wellness companion</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="font-size:17px;color:#0a2617;margin:0 0 16px;">Hi <strong>${toName || 'there'}</strong>,</p>
      <p style="color:#4a7c5d;line-height:1.7;margin:0 0 20px;">
        We're really glad you're here. ZenMind is a safe space designed for adolescents — where your thoughts and emotions are heard without judgment.
      </p>
    </div>
    <div style="background:#f7fbf8;padding:20px 36px;border-top:1px solid #e0ede6;">
      <p style="margin:0;font-size:12px;color:#8aab99;text-align:center;">
        &#128153; Team ZenMind &nbsp;&bull;&nbsp; Adolescent Mental Wellness Platform
      </p>
    </div>
  </div>
</div>`,
  });

  console.log(`[Mailer] ✅ Welcome email sent to ${toEmail}`);
}
