import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, Settings, Upload, Save,
  ChevronLeft, ChevronRight, Eye, EyeOff, LogOut, Menu, X
} from 'lucide-react';
import { apiFetch } from '../api/client';

type DashboardProps = {
  onLogout: () => void;
};

type Me = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  avatar: { mime: string; data: string } | null;
};

type TabKey = 'aichat' | 'settings';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'aichat',   label: 'AI Chat',  icon: <MessageCircle className="w-5 h-5 flex-shrink-0" /> },
  { key: 'settings', label: 'Settings', icon: <Settings      className="w-5 h-5 flex-shrink-0" /> },
];

export default function Dashboard({ onLogout }: DashboardProps) {
  const [tab, setTab]         = useState<TabKey>('aichat');
  const [me, setMe]           = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiFetch<Me>('/me')
      .then((data) => { if (alive) { setMe(data); setError(null); } })
      .catch((e)  => { if (alive) setError(e.message || 'Failed to load profile'); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const avatarUrl = useMemo(() => {
    if (!me?.avatar?.data) return null;
    return `data:${me.avatar.mime};base64,${me.avatar.data}`;
  }, [me?.avatar?.data, me?.avatar?.mime]);

  const initials = me?.name
    ? me.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ZM';

  return (
    <div className="h-screen overflow-hidden bg-[#f7fbf8] flex">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#0d5d3a]/10 z-40 md:hidden shadow-xl flex flex-col">
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/10 min-h-[64px]">
            {avatarUrl
              ? <img src={avatarUrl} alt="P" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0d5d3a]/20 flex-shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            }
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-[#0a2617] font-bold text-sm truncate" style={{fontFamily:'Syne,sans-serif'}}>Dashboard</div>
              <div className="text-xs text-[#4a7c5d] truncate">{me?.name}</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => { setTab(key); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all ${tab === key ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-white text-[#0a2617] border-transparent hover:bg-[#f3fbf6]'}`}>
                <span className={tab === key ? 'text-white' : 'text-[#0d5d3a]'}>{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#0d5d3a]/10 p-2">
            <button type="button" onClick={onLogout}
              className="w-full flex items-center gap-2.5 text-sm font-semibold text-[#e05555] hover:bg-red-50 rounded-2xl px-3 py-2.5 transition">
              <LogOut className="w-4 h-4 flex-shrink-0" /><span>Sign out</span>
            </button>
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0 relative" style={{ width: collapsed ? 64 : 256, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Toggle tab â€” sits on the right edge, always visible */}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3.5 top-5 z-20 w-7 h-7 bg-white border border-[#0d5d3a]/15 rounded-full shadow-md flex items-center justify-center text-[#0d5d3a] hover:bg-[#f0fbf4] transition"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar inner â€” scrollable, clips content during animation */}
        <div className="h-full overflow-hidden overflow-y-auto bg-white border-r border-[#0d5d3a]/10 flex flex-col">

          {/* Header: avatar always at left-12px, text fades in */}
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/08 min-h-[64px]">
            {/* Avatar â€” fixed size and position in both states */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0d5d3a]/20 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            {/* Text â€” only when expanded */}
            {!collapsed && (
              <div className="ml-2 flex-1 min-w-0 overflow-hidden">
                <div className="text-[#0a2617] font-bold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</div>
                <div className="text-xs text-[#4a7c5d] truncate">{me?.name || 'â€”'}</div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-1">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => setTab(key)} title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all ${
                  tab === key ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-white text-[#0a2617] border-transparent hover:bg-[#f3fbf6] hover:border-[#0d5d3a]/12'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className={tab === key ? 'text-white' : 'text-[#0d5d3a]'}>{icon}</span>
                {!collapsed && <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">{label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-[#0d5d3a]/08">
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <div className="rounded-2xl border border-[#0d5d3a]/12 bg-gradient-to-br from-white to-[#f4fbf6] px-3 py-2.5">
                  <div className="text-xs text-[#4a7c5d]">Signed in as</div>
                  <div className="text-sm text-[#0a2617] font-semibold truncate">{me?.email || 'â€”'}</div>
                </div>
              </div>
            )}
            <div className={`p-2 ${collapsed ? 'flex justify-center' : ''}`}>
              <button type="button" onClick={onLogout} title="Sign out"
                className={`flex items-center gap-2.5 text-sm font-semibold text-[#e05555] hover:bg-red-50 rounded-2xl transition px-3 py-2.5 ${
                  collapsed ? 'justify-center w-10 h-10 px-0' : 'w-full'
                }`}>
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Sign out</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="flex-shrink-0 bg-white/80 backdrop-blur border-b border-[#0d5d3a]/10 z-10">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-[#0a2617] text-xl sm:text-2xl" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                {loading ? 'Loadingâ€¦' : `Welcome, ${me?.name?.split(' ')[0] || 'there'}!`}
              </div>
              <div className="text-sm text-[#4a7c5d]">Your personal wellness dashboard</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#0d5d3a]/15 text-[#0d5d3a] hover:bg-[#f0fbf4] transition">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
            )}
            {tab === 'aichat'   && <AiChatPanel />}
            {tab === 'settings' && <SettingsPanel me={me} setMe={setMe} onLogout={onLogout} />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* â”€â”€ AI CHAT (full-width, no Quick Actions) â”€â”€ */
function AiChatPanel() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-3xl bg-white border border-[#0d5d3a]/10 shadow-sm p-6 min-h-[500px]">
        <div className="text-[#0a2617] text-lg font-semibold mb-2">AI Chat</div>
        <p className="text-sm text-[#4a7c5d] mb-5">
          This section will connect to your AI chat backend next. For now it's a clean placeholder UI.
        </p>
        <div className="rounded-2xl border border-[#0d5d3a]/10 bg-[#f7fbf8] h-[380px] flex items-center justify-center">
          <div className="text-center text-[#4a7c5d]">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm opacity-60">AI Chat coming soon</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── SETTINGS (Profile + Security combined) ── */
function SettingsPanel({ me, setMe, onLogout }: { me: Me | null; setMe: (v: Me | null) => void; onLogout: () => void }) {
  /* ---- Profile state ---- */
  const [name, setName]   = useState(me?.name  || '');
  const [phone, setPhone] = useState(me?.phone || '');
  const [age, setAge]     = useState(String(me?.age ?? ''));
  const [gender, setGender] = useState(me?.gender || '');
  const [saving, setSaving]     = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { setName(me?.name||''); setPhone(me?.phone||''); setAge(me?.age!==undefined?String(me.age):''); setGender(me?.gender||''); }, [me]);

  const avatarUrl = me?.avatar?.data ? `data:${me.avatar.mime};base64,${me.avatar.data}` : null;
  const initials  = me?.name ? me.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'ZM';

  const handleAvatar = async (file: File) => {
    const base64 = await fileToBase64(file);
    const data = base64.split(',')[1] || '';
    await apiFetch('/me/avatar', { method: 'PUT', body: JSON.stringify({ mime: file.type, data }) });
    const refreshed = await apiFetch<Me>('/me');
    setMe(refreshed);
  };

  const saveProfile = async () => {
    setSaving(true); setProfileMsg(null);
    try {
      const updated = await apiFetch<Me>('/me', { method: 'PUT', body: JSON.stringify({ name, phone, age: Number(age), gender }) });
      setMe(updated); setProfileMsg({ text: 'Profile saved ✓', ok: true });
    } catch (e: any) { setProfileMsg({ text: e.message || 'Save failed', ok: false }); }
    finally { setSaving(false); }
  };

  /* ---- Password state ---- */
  const [pwMode, setPwMode]             = useState<'old'|'otp'>('old');
  const [oldPassword, setOldPassword]   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [showOld, setShowOld]           = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [otpStep, setOtpStep]           = useState<'send'|'verify'|'reset'>('send');
  const [otpCode, setOtpCode]           = useState('');
  const [otpNew, setOtpNew]             = useState('');
  const [otpConfirm, setOtpConfirm]     = useState('');
  const [showOtpNew, setShowOtpNew]     = useState(false);
  const [showOtpConfirm, setShowOtpConfirm] = useState(false);
  const [otpSecs, setOtpSecs]           = useState(0);
  const [pwBusy, setPwBusy]             = useState(false);
  const [pwMsg, setPwMsg]               = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (otpSecs <= 0) return;
    const t = setInterval(() => setOtpSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, [otpSecs]);

  const resetOtp = () => { setOtpStep('send'); setOtpCode(''); setOtpNew(''); setOtpConfirm(''); setOtpSecs(0); };

  const updateWithOld = async () => {
    if (newPassword !== confirmPw)  { setPwMsg({ text: 'Passwords do not match', ok: false }); return; }
    if (newPassword.length < 6)     { setPwMsg({ text: 'Min. 6 characters', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/update-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) });
      setOldPassword(''); setNewPassword(''); setConfirmPw('');
      setPwMsg({ text: 'Password updated ✓', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Update failed', ok: false }); }
    finally { setPwBusy(false); }
  };

  const sendOtp = async () => {
    setPwBusy(true); setPwMsg(null);
    try {
      /* /auth/send-otp is authenticated â€” fetches email from DB via JWT */
      await apiFetch('/auth/send-otp', { method: 'POST', body: '{}' });
      setOtpSecs(120); setOtpStep('verify');
      setPwMsg({ text: 'OTP sent to your registered email ✓', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Failed to send OTP', ok: false }); }
    finally { setPwBusy(false); }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) { setPwMsg({ text: 'Enter 6-digit code', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: me?.phone, code: otpCode }) });
      setOtpStep('reset'); setPwMsg({ text: 'Code verified ✓', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Invalid code', ok: false }); }
    finally { setPwBusy(false); }
  };

  const resetWithOtp = async () => {
    if (otpNew !== otpConfirm) { setPwMsg({ text: 'Passwords do not match', ok: false }); return; }
    if (otpNew.length < 6)     { setPwMsg({ text: 'Min. 6 characters', ok: false }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ phone: me?.phone, code: otpCode, newPassword: otpNew }) });
      resetOtp(); setPwMsg({ text: 'Password reset ✓', ok: true });
    } catch (e: any) { setPwMsg({ text: e.message||'Reset failed', ok: false }); }
    finally { setPwBusy(false); }
  };

  /* ---- Delete Account state ---- */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== me?.email && deleteConfirmText.trim() !== me?.phone) {
      setDeleteMsg({ text: 'Email or phone does not match.', ok: false });
      return;
    }
    setDeleteBusy(true); setDeleteMsg(null);
    try {
      await apiFetch('/me', { method: 'DELETE' });
      onLogout(); // Log the user out immediately since account is gone
    } catch (e: any) {
      setDeleteMsg({ text: e.message || 'Failed to delete account', ok: false });
      setDeleteBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

      {/* ── PROFILE SECTION ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[#0a2617] text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Profile</h2>
            <p className="text-sm text-[#4a7c5d]">Update your personal details and photo.</p>
          </div>
          {profileMsg && <div className={`text-sm font-semibold ${profileMsg.ok ? 'text-[#0d5d3a]' : 'text-red-600'}`}>{profileMsg.text}</div>}
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#0d5d3a]/15" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xl font-bold">{initials}</div>
        )}
        <div>
          <div className="text-sm font-semibold text-[#0a2617]">Profile Photo</div>
          <div className="text-xs text-[#4a7c5d] mb-2">PNG/JPG recommended</div>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#0d5d3a]/12 text-[#0d5d3a] text-sm font-semibold cursor-pointer hover:bg-[#f0fbf4] transition">
            <Upload className="w-3.5 h-3.5" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) handleAvatar(f).catch(()=>{}); }} />
          </label>
        </div>
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-6">
        <Field label="Name"  value={name}  onChange={setName}  placeholder="Your name" />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 â€¦" />
        <Field label="Email (read-only)" value={me?.email||''} onChange={()=>{}} placeholder="" disabled />
        <Field label="Age"   value={age}   onChange={setAge}   placeholder="e.g. 16" />
        <label className="block">
          <div className="text-xs font-semibold text-[#0a2617]">Gender</div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 bg-[#fbfdfb] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/20"
          >
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button type="button" onClick={saveProfile} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60 hover:bg-[#0a4a2e] transition">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-8" />

      {/* ── SECURITY SECTION ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#0a2617] text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Security</h2>
            <p className="text-sm text-[#4a7c5d]">Change your password using your current password or via OTP sent to your email.</p>
          </div>
          {pwMsg && <div className={`text-sm font-semibold max-w-xs text-right ${pwMsg.ok ? 'text-[#0d5d3a]' : 'text-red-600'}`}>{pwMsg.text}</div>}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl bg-[#eaf6ee] p-1 max-w-xs mb-6">
        {(['old','otp'] as const).map(m => (
          <button key={m} type="button" onClick={() => { setPwMode(m); setPwMsg(null); resetOtp(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${pwMode===m ? 'bg-[#0d5d3a] text-white' : 'text-[#0d5d3a]'}`}>
            {m==='old' ? 'Old password' : 'Via OTP'}
          </button>
        ))}
      </div>

      {pwMode === 'old' ? (
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="sm:col-span-2">
            <PwField label="Current password" value={oldPassword} onChange={setOldPassword} show={showOld} onToggle={() => setShowOld(s=>!s)} placeholder="Enter current password" />
          </div>
          <PwField label="New password"     value={newPassword} onChange={setNewPassword} show={showNew}     onToggle={() => setShowNew(s=>!s)}     placeholder="Min. 6 characters" />
          <PwField label="Confirm password" value={confirmPw}   onChange={setConfirmPw}   show={showConfirm} onToggle={() => setShowConfirm(s=>!s)} placeholder="Repeat new password" />
          <div className="sm:col-span-2">
            <button type="button" onClick={updateWithOld} disabled={pwBusy}
              className="px-5 py-3 rounded-2xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-60">
              {pwBusy ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl space-y-3">
          {/* Step 1 */}
          <div className={`rounded-2xl border p-4 ${otpStep!=='send' ? 'bg-[#f4fbf6] border-[#0d5d3a]/20' : 'bg-white border-[#0d5d3a]/12'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#0a2617]">Step 1 — Send OTP to your email</div>
                <div className="text-xs text-[#4a7c5d] mt-0.5">
                  We'll send a 6-digit code to your registered email.
                  {otpSecs > 0 && <span className="ml-2 text-[#0d5d3a] font-semibold">Expires in {otpSecs}s</span>}
                </div>
              </div>
              <button type="button" onClick={sendOtp} disabled={pwBusy || otpSecs > 0}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#0d5d3a] text-white text-sm font-semibold hover:bg-[#0a4a2e] transition disabled:opacity-60">
                {otpSecs > 0 ? `Resend (${otpSecs}s)` : pwBusy && otpStep==='send' ? 'Sending…' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          {(otpStep==='verify'||otpStep==='reset') && (
            <div className={`rounded-2xl border p-4 ${otpStep==='reset' ? 'bg-[#f4fbf6] border-[#0d5d3a]/20' : 'bg-white border-[#0d5d3a]/12'}`}>
              <div className="text-sm font-semibold text-[#0a2617] mb-3">Step 2 — Enter the code</div>
              <div className="flex gap-3 items-end">
                <div className="flex-1"><Field label="6-digit OTP" value={otpCode} onChange={setOtpCode} placeholder="e.g. 123456" disabled={otpStep==='reset'} /></div>
                {otpStep==='verify' && (
                  <button type="button" onClick={verifyOtp} disabled={pwBusy||otpCode.length!==6}
                    className="shrink-0 px-4 py-3 rounded-xl bg-[#0d5d3a] text-white text-sm font-semibold hover:bg-[#0a4a2e] transition disabled:opacity-60">
                    {pwBusy ? 'Checking…' : 'Verify OTP'}
                  </button>
                )}
                {otpStep==='reset' && <div className="shrink-0 px-3 py-2 rounded-xl bg-[#0d5d3a]/10 text-[#0d5d3a] text-xs font-semibold">✓ Verified</div>}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {otpStep==='reset' && (
            <div className="rounded-2xl border border-[#0d5d3a]/12 bg-white p-4">
              <div className="text-sm font-semibold text-[#0a2617] mb-3">Step 3 — Set new password</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <PwField label="New password"     value={otpNew}     onChange={setOtpNew}     show={showOtpNew}     onToggle={() => setShowOtpNew(s=>!s)}     placeholder="Min. 6 characters" />
                <PwField label="Confirm password" value={otpConfirm} onChange={setOtpConfirm} show={showOtpConfirm} onToggle={() => setShowOtpConfirm(s=>!s)} placeholder="Repeat new password" />
                <div className="sm:col-span-2">
                  <button type="button" onClick={resetWithOtp} disabled={pwBusy}
                    className="px-5 py-3 rounded-2xl bg-[#0d5d3a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-60">
                    {pwBusy ? 'Resetting…' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-10" />

      {/* ── DANGER ZONE (Delete Account) ── */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-red-600 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Danger Zone</h2>
            <p className="text-sm text-red-500/80 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 max-w-xl">
            <h3 className="text-red-700 font-bold mb-2">Are you absolutely sure?</h3>
            <p className="text-red-600/80 text-sm mb-4">
              This action cannot be undone. This will permanently delete your personal information, settings, and all active sessions.
            </p>
            <label className="block mb-4">
              <div className="text-sm font-semibold text-red-700 mb-1.5 block">
                Please type your registered email or phone number to confirm:
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={me?.email || me?.phone || ''}
                className="w-full bg-white border border-red-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all text-sm"
              />
            </label>
            
            {deleteMsg && (
              <div className={`mb-4 text-sm font-semibold ${deleteMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
                {deleteMsg.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteBusy || !deleteConfirmText.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteBusy ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setDeleteMsg(null);
                }}
                disabled={deleteBusy}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
}

/* â”€â”€ FIELD â”€â”€ */
function Field({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617]">{label}</div>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 bg-[#fbfdfb] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/20 disabled:opacity-60"
      />
    </label>
  );
}


/* â”€â”€ PASSWORD FIELD WITH SHOW/HIDE â”€â”€ */
function PwField({ label, value, onChange, show, onToggle, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617]">{label}</div>
      <div className="mt-1.5 relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-[#0d5d3a]/12 bg-[#fbfdfb] px-4 pr-11 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/20"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] hover:text-[#0d5d3a] transition">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
