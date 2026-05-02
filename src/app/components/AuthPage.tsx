import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import logo from '../../../asset/logo.png';

type AuthPageProps = {
  onBackHome: () => void;
  onAuthSuccess: () => void;
};

export default function AuthPage({ onBackHome, onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSeconds, setOtpSeconds] = useState(0);

  /* Forgot-password state */
  const [fp, setFp] = useState({
    open: false, phone: '', code: '', newPassword: '',
    step: 'phone' as 'phone' | 'verify' | 'reset',
  });
  const [fpMsg, setFpMsg] = useState<{ text: string; ok: boolean } | null>(null);

  /* Password visibility */
  const [showPw,   setShowPw]   = useState(false);
  const [showFpPw, setShowFpPw] = useState(false);

  const leftCopy = useMemo(() => {
    if (mode === 'signup') {
      return {
        title: 'Start Your Wellness Journey.',
        emphasis: 'Today',
        description: 'Create your ZenMind account in minutes. Get compassionate support, guided therapy access, and progress insights tailored for you.',
        footnote: 'Secure • Private • Built for adolescents in India',
      };
    }
    return {
      title: 'Welcome Back.',
      emphasis: 'We missed you',
      description: 'Log in to continue your mental health journey with trusted support, guided therapy access, and personalized insights.',
      footnote: 'Secure • Private • 24/7 support',
    };
  }, [mode]);

  useEffect(() => {
    if (otpSeconds <= 0) return;
    const t = window.setInterval(() => setOtpSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [otpSeconds]);

  const resetFp = () => {
    setFp({ open: false, phone: '', code: '', newPassword: '', step: 'phone' });
    setFpMsg(null);
    setOtpSeconds(0);
  };

  return (
    <section className="min-h-screen bg-[#f7fbf8] py-10 sm:py-14 px-4 sm:px-6 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative grid lg:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(7,29,19,0.18)] border border-black/5"
        >
          {/* ── LEFT PANEL ── */}
          <motion.div
            className="relative text-white p-8 sm:p-10 lg:p-12 min-h-[420px] lg:min-h-[560px] flex flex-col justify-between bg-[#0a2617]"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a2617] via-[#0b2f1d] to-[#0d5d3a]" />
              <div className="absolute -top-10 -left-12 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -right-12 w-72 h-72 bg-[#c8e6c9]/15 blur-3xl rounded-full" />
              <div className="absolute inset-0 [background:linear-gradient(135deg,transparent_0%,transparent_44%,rgba(255,255,255,0.08)_44%,rgba(255,255,255,0.08)_56%,transparent_56%,transparent_100%)] opacity-70" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <img src={logo} alt="ZenMind Logo" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/25" />
                <div>
                  <div className="text-lg tracking-wide" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>ZenMind</div>
                  <div className="text-xs text-white/70 -mt-0.5">Mental wellness for teens</div>
                </div>
              </div>

              <div className="mt-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/15 px-3 py-1 text-xs sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-[#c8e6c9]" />
                  {fp.open ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Sign in to continue'}
                </div>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl leading-[1.05]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {fp.open ? <>Recover <span className="text-[#c8e6c9]">access</span></> : <>{leftCopy.title} <span className="text-[#c8e6c9]">{leftCopy.emphasis}</span></>}
                </h1>
                <p className="mt-4 text-white/85 text-base sm:text-lg max-w-md">
                  {fp.open ? "We'll send a one-time code to your registered email." : leftCopy.description}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-10 flex items-center justify-between text-xs sm:text-sm text-white/70">
              <span>{fp.open ? 'ZenMind • Account Recovery' : leftCopy.footnote}</span>
              <span className="hidden sm:inline">ZenMind • 2026</span>
            </div>
          </motion.div>

          {/* ── RIGHT PANEL ── */}
          <motion.div
            key={fp.open ? 'forgot' : mode}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative p-7 sm:p-10 lg:p-12 min-h-[420px] lg:min-h-[560px] flex flex-col"
          >
            <button
              type="button"
              onClick={onBackHome}
              className="absolute top-4 right-4 text-xs sm:text-sm text-[#4a7c5d] hover:text-[#0d5d3a] transition"
            >
              ← Back to Home
            </button>

            {/* ── FORGOT PASSWORD VIEW (replaces login form) ── */}
            {fp.open ? (
              <div className="flex-1 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={resetFp}
                  className="flex items-center gap-1.5 text-sm text-[#4a7c5d] hover:text-[#0d5d3a] mb-6 font-medium transition w-fit"
                >
                  ← Back to login
                </button>

                <h2 className="text-2xl sm:text-3xl text-[#0a2617] mb-1" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  Reset Password
                </h2>
                <p className="text-sm sm:text-base text-[#4a7c5d] mb-7">
                  {fp.step === 'phone'  && 'Enter your registered mobile number to receive an OTP.'}
                  {fp.step === 'verify' && 'Enter the 6-digit code sent to your email.'}
                  {fp.step === 'reset'  && 'Choose a new password for your account.'}
                </p>

                {/* Step 1 – phone */}
                {fp.step === 'phone' && (
                  <div className="space-y-4">
                    <Input
                      name="fpPhone" icon={Phone}
                      label="Registered Mobile Number" placeholder="e.g. +91 98765 43210"
                      type="tel" required value={fp.phone}
                      onValueChange={v => setFp(p => ({ ...p, phone: v }))}
                    />
                    <button
                      type="button" disabled={!fp.phone.trim() || busy}
                      onClick={async () => {
                        setBusy(true); setFpMsg(null);
                        try {
                          const { apiFetch } = await import('../api/client');
                          await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ phone: fp.phone }) });
                          setOtpSeconds(120);
                          setFp(p => ({ ...p, step: 'verify' }));
                          setFpMsg({ text: 'OTP sent to your registered email ✓', ok: true });
                        } catch (err: any) {
                          setFpMsg({ text: err.message || 'Failed to send OTP', ok: false });
                        } finally { setBusy(false); }
                      }}
                      className="w-full py-3 rounded-xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] disabled:opacity-60 transition"
                    >
                      {busy ? 'Sending…' : 'Request OTP'} <ArrowRight className="inline-block ml-2 w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 2 – verify */}
                {fp.step === 'verify' && (
                  <div className="space-y-4">
                    {otpSeconds > 0 && (
                      <p className="text-xs text-[#0d5d3a] font-semibold">Code expires in {otpSeconds}s</p>
                    )}
                    <Input
                      name="fpCode" icon={Lock}
                      label="6-digit OTP" placeholder="e.g. 123456"
                      type="text" required value={fp.code}
                      onValueChange={v => setFp(p => ({ ...p, code: v }))}
                    />
                    <button
                      type="button" disabled={fp.code.length !== 6 || busy}
                      onClick={async () => {
                        setBusy(true); setFpMsg(null);
                        try {
                          const { apiFetch } = await import('../api/client');
                          await apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: fp.phone, code: fp.code }) });
                          setFp(p => ({ ...p, step: 'reset' }));
                          setFpMsg({ text: 'Code verified ✓', ok: true });
                        } catch (err: any) {
                          setFpMsg({ text: err.message || 'Invalid code', ok: false });
                        } finally { setBusy(false); }
                      }}
                      className="w-full py-3 rounded-xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] disabled:opacity-60 transition"
                    >
                      {busy ? 'Verifying…' : 'Verify OTP'} <ArrowRight className="inline-block ml-2 w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFp(p => ({ ...p, step: 'phone' }))}
                      className="text-sm text-[#4a7c5d] hover:text-[#0d5d3a] font-medium"
                    >
                      Change mobile number
                    </button>
                  </div>
                )}

                {/* Step 3 – new password */}
                {fp.step === 'reset' && (
                  <div className="space-y-4">
                    <Input
                      name="fpNewPw" icon={Lock}
                      label="New Password (min. 6 characters)" placeholder="Enter new password"
                      type={showFpPw ? 'text' : 'password'} required
                      value={fp.newPassword}
                      onValueChange={v => setFp(p => ({ ...p, newPassword: v }))}
                      showToggle onToggle={() => setShowFpPw(s => !s)} showing={showFpPw}
                    />
                    <button
                      type="button" disabled={fp.newPassword.length < 6 || busy}
                      onClick={async () => {
                        setBusy(true); setFpMsg(null);
                        try {
                          const { apiFetch } = await import('../api/client');
                          await apiFetch('/auth/reset-password', {
                            method: 'POST',
                            body: JSON.stringify({ phone: fp.phone, code: fp.code, newPassword: fp.newPassword }),
                          });
                          resetFp();
                        } catch (err: any) {
                          setFpMsg({ text: err.message || 'Reset failed', ok: false });
                        } finally { setBusy(false); }
                      }}
                      className="w-full py-3 rounded-xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] disabled:opacity-60 transition"
                    >
                      {busy ? 'Resetting…' : 'Reset Password'} <ArrowRight className="inline-block ml-2 w-4 h-4" />
                    </button>
                  </div>
                )}

                {fpMsg && (
                  <div className={`mt-5 text-sm font-semibold ${fpMsg.ok ? 'text-[#0d5d3a]' : 'text-red-600'}`}>
                    {fpMsg.text}
                  </div>
                )}
              </div>

            ) : (
              /* ── NORMAL LOGIN / SIGNUP ── */
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl text-[#0a2617]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {mode === 'signup' ? 'Create Account' : 'Login'}
                </h2>
                <p className="mt-1 text-sm sm:text-base text-[#4a7c5d]">
                  {mode === 'signup' ? 'Create your ZenMind account to get started.' : 'Welcome back — enter your details to continue.'}
                </p>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {mode === 'signup' ? (
                  <form
                    className="mt-7 grid sm:grid-cols-2 gap-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      const payload = {
                        name:     String(form.get('name')     || ''),
                        phone:    String(form.get('phone')    || ''),
                        email:    String(form.get('email')    || ''),
                        age:      Number(form.get('age')      || 0),
                        gender:   String(form.get('gender')   || ''),
                        password: String(form.get('password') || ''),
                      };
                      setBusy(true); setError(null);
                      try {
                        const { apiFetch } = await import('../api/client');
                        await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
                        onAuthSuccess();
                      } catch (err: any) {
                        setError(err.message || 'Signup failed');
                      } finally { setBusy(false); }
                    }}
                  >
                    <Input name="name"     icon={User}  label="Full Name"       placeholder="e.g. Aarav Sharma"        type="text"   required />
                    <Input name="phone"    icon={Phone} label="Mobile Number"   placeholder="e.g. +91 98765 43210"    type="tel"    required />
                    <div className="sm:col-span-2">
                      <Input name="email"  icon={Mail}  label="Email"           placeholder="e.g. you@gmail.com"      type="email"  required />
                    </div>
                    
                    <Input name="age"      icon={User}  label="Age"             placeholder="e.g. 16"                 type="number" required />
                    <label className="block">
                      <span className="text-xs sm:text-sm text-[#0a2617] font-medium">Gender</span>
                      <div className="mt-1.5 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]">
                          <User className="w-4 h-4" />
                        </span>
                        <select name="gender" required className="w-full rounded-xl border border-[#0d5d3a]/18 bg-[#fbfdfb] pl-10 pr-10 py-3 text-sm sm:text-base outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/25 appearance-none">
                          <option value="" disabled selected>Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other / Prefer not to say</option>
                        </select>
                      </div>
                    </label>

                    <div className="sm:col-span-2">
                      <Input name="password" icon={Lock}  label="Password"        placeholder="Create a strong password"
                        type={showPw ? 'text' : 'password'} required
                        showToggle onToggle={() => setShowPw(s => !s)} showing={showPw} />
                    </div>

                    <div className="sm:col-span-2 mt-1">
                      <button type="submit" disabled={busy}
                        className="w-full py-3 rounded-xl bg-[#0d5d3a] text-white font-medium shadow-lg shadow-[#0d5d3a]/20 hover:shadow-xl transition disabled:opacity-60">
                        {busy ? 'Creating…' : 'Create Account'} <ArrowRight className="inline-block ml-2 w-4 h-4" />
                      </button>
                    </div>

                    <p className="sm:col-span-2 text-center text-xs sm:text-sm text-[#4a7c5d] mt-1">
                      Already have an account?{' '}
                      <button type="button" className="font-semibold text-[#0d5d3a] hover:underline" onClick={() => setMode('login')}>
                        Sign in
                      </button>
                    </p>
                  </form>
                ) : (
                  <form
                    className="mt-7 grid grid-cols-1 gap-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      const payload = {
                        identifier: String(form.get('identifier') || ''),
                        password:   String(form.get('password')   || ''),
                      };
                      setBusy(true); setError(null);
                      try {
                        const { apiFetch } = await import('../api/client');
                        await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
                        onAuthSuccess();
                      } catch (err: any) {
                        setError(err.message || 'Login failed');
                      } finally { setBusy(false); }
                    }}
                  >
                    <Input name="identifier" icon={Mail} label="Email or Mobile Number"
                      placeholder="e.g. you@gmail.com or +91 98765 43210" type="text" required />
                    <Input name="password" icon={Lock} label="Password" placeholder="Enter your password"
                      type={showPw ? 'text' : 'password'} required
                      showToggle onToggle={() => setShowPw(s => !s)} showing={showPw} />

                    {/* Forgot password link — inline with password label feel */}
                    <button
                      type="button"
                      onClick={() => { setError(null); setFp(p => ({ ...p, open: true })); }}
                      className="text-sm text-[#0d5d3a] font-semibold hover:underline text-left -mt-2"
                    >
                      Forgot password?
                    </button>

                    <div>
                      <button type="submit" disabled={busy}
                        className="w-full py-3 rounded-xl bg-[#0d5d3a] text-white font-medium shadow-lg shadow-[#0d5d3a]/20 hover:shadow-xl transition disabled:opacity-60">
                        {busy ? 'Logging in…' : 'Login'} <ArrowRight className="inline-block ml-2 w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-center text-xs sm:text-sm text-[#4a7c5d] mt-1">
                      New to ZenMind?{' '}
                      <button type="button" className="font-semibold text-[#0d5d3a] hover:underline" onClick={() => setMode('signup')}>
                        Create an account
                      </button>
                    </p>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Input({
  name, label, type, required, placeholder,
  icon: Icon, value, onValueChange,
  showToggle, onToggle, showing,
}: {
  name: string; label: string; type: string; required?: boolean;
  placeholder: string; icon: React.ComponentType<{ className?: string }>;
  value?: string; onValueChange?: (v: string) => void;
  showToggle?: boolean; onToggle?: () => void; showing?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs sm:text-sm text-[#0a2617] font-medium">{label}</span>
      <div className="mt-1.5 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]">
          <Icon className="w-4 h-4" />
        </span>
        <input
          name={name} type={type} required={required} placeholder={placeholder}
          value={value}
          onChange={(e) => (onValueChange ? onValueChange(e.target.value) : undefined)}
          className="w-full rounded-xl border border-[#0d5d3a]/18 bg-[#fbfdfb] pl-10 pr-10 py-3 text-sm sm:text-base outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/25"
        />
        {showToggle && (
          <button type="button" onClick={onToggle} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] hover:text-[#0d5d3a] transition">
            {showing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </label>
  );
}
