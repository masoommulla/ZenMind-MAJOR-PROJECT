import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, Settings, Upload, Save,
  ChevronLeft, ChevronRight, PanelLeftOpen, PanelLeftClose, Eye, EyeOff, LogOut, Menu, X, Stethoscope,
  Calendar, Clock, Trash2, CheckSquare, IndianRupee, Star, Info
} from 'lucide-react';
import { apiFetch } from '../api/client';
import ThemeToggle from './ThemeToggle';
import TherapyHub from './TherapyHub';
import VideoRoom from './VideoRoom';
import CancellationPolicy from './CancellationPolicy';
import UserChat from './UserChat';
import ZenAvatarChat from './ZenAvatarChat';
import ZenProgressDashboard from './ZenProgressDashboard';
import CommunityWall from './CommunityWall';
import ResourceHub from './ResourceHub';
import MoodJournal from './MoodJournal';
import PeerCircles from './PeerCircles';
import WellnessGoalTracker from './WellnessGoalTracker';
import ReadingListsUser from './ReadingListsUser';
import WellnessProgramsUser from './WellnessProgramsUser';

type DashboardProps = {
  onLogout: () => void;
  prefetchedMe?: any; // already fetched by App.tsx during startup verification
  initialTab?: TabKey;  // which tab to open right after login (default: 'progress')
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

type TabKey = 'aichat' | 'therapy' | 'settings' | 'sessions' | 'chat' | 'progress' | 'community' | 'resources' | 'journal' | 'circles' | 'goals' | 'reading' | 'programs';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'aichat',     label: 'AI Chat',      icon: <MessageCircle className="w-5 h-5 flex-shrink-0" /> },
  { key: 'therapy',    label: 'Therapy Hub',  icon: <Stethoscope   className="w-5 h-5 flex-shrink-0" /> },
  { key: 'resources',  label: 'Resources',    icon: <Info          className="w-5 h-5 flex-shrink-0" /> },
  { key: 'reading',    label: 'Reading Lists', icon: <Info          className="w-5 h-5 flex-shrink-0" /> },
  { key: 'programs',   label: 'Wellness Programs', icon: <Star       className="w-5 h-5 flex-shrink-0" /> },
  { key: 'journal',    label: 'Mood Journal', icon: <Star          className="w-5 h-5 flex-shrink-0" /> },
  { key: 'circles',    label: 'Peer Circles', icon: <Upload        className="w-5 h-5 flex-shrink-0" /> },
  { key: 'goals',      label: 'My Goals',     icon: <Star          className="w-5 h-5 flex-shrink-0" /> },
  { key: 'progress',   label: 'My Progress',  icon: <Save          className="w-5 h-5 flex-shrink-0" /> },
  { key: 'community',  label: 'Community',    icon: <MessageCircle className="w-5 h-5 flex-shrink-0" /> },
  { key: 'sessions',   label: 'My Sessions',  icon: <Calendar      className="w-5 h-5 flex-shrink-0" /> },
  { key: 'settings',   label: 'Settings',     icon: <Settings      className="w-5 h-5 flex-shrink-0" /> },
];

export default function Dashboard({ onLogout, prefetchedMe, initialTab }: DashboardProps) {
  const [tab, setTab]         = useState<TabKey>(initialTab ?? 'progress');
  const [me, setMe]           = useState<Me | null>(prefetchedMe ?? null);
  const [loading, setLoading] = useState(!prefetchedMe); // no loading if we have data
  const [error, setError]     = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatTherapist, setChatTherapist] = useState<any | null>(null);

  useEffect(() => {
    // If prefetchedMe was already provided, skip the fetch
    if (prefetchedMe) { setMe(prefetchedMe); setLoading(false); return; }

    // Fallback: fetch /me (happens after AuthPage login without full page reload)
    let alive = true;
    setLoading(true);
    const fetchMe = (attempt = 0): Promise<Me> =>
      apiFetch<Me>('/me', { timeoutMs: 8000 }).catch((e) => {
        if (attempt === 0) return fetchMe(1);
        throw e;
      });
    fetchMe()
      .then((data) => { if (alive) { setMe(data); setError(null); } })
      .catch((e)  => { if (alive) setError(e.message || 'Failed to load profile'); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [prefetchedMe]); // re-run if App passes fresh data

  const avatarUrl = useMemo(() => {
    if (!me?.avatar?.data) return null;
    return `data:${me.avatar.mime};base64,${me.avatar.data}`;
  }, [me?.avatar?.data, me?.avatar?.mime]);

  const initials = me?.name
    ? me.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ZM';

  return (
    <div className="h-screen overflow-hidden bg-[#f7fbf8] dark:bg-[#050505] flex transition-colors duration-300">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 z-40 md:hidden shadow-xl flex flex-col">
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/10 dark:border-white/10 min-h-[64px]">
            {avatarUrl
              ? <img src={avatarUrl} alt="P" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0d5d3a]/20 dark:ring-white/20 flex-shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            }
            <div className="ml-2 flex-1 min-w-0">
              <div className="text-[#0a2617] dark:text-gray-100 font-bold text-sm truncate" style={{fontFamily:'Syne,sans-serif'}}>Dashboard</div>
              <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{me?.name}</div>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => { setTab(key); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all ${tab === key ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white border-[#0d5d3a] dark:border-[#1a8a5a]' : 'bg-white dark:bg-transparent text-[#0a2617] dark:text-gray-300 border-transparent hover:bg-[#f3fbf6] dark:hover:bg-white/5'}`}>
                <span className={tab === key ? 'text-white' : 'text-[#0d5d3a] dark:text-[#10b981]'}>{icon}</span>
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

        {/* Toggle tab */}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3.5 top-5 z-20 w-7 h-7 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-full shadow-md flex items-center justify-center text-[#0d5d3a] dark:text-gray-300 hover:bg-[#f0fbf4] dark:hover:bg-[#222222] transition"
        >
          {collapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar inner */}
        <div className="h-full overflow-hidden overflow-y-auto bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 flex flex-col">

          {/* Header */}
          <div className="flex items-center p-3 border-b border-[#0d5d3a]/10 dark:border-white/10 min-h-[64px]">
            {/* Avatar â€” fixed size and position in both states */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0d5d3a]/20 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            {/* Text */}
            {!collapsed && (
              <div className="ml-2 flex-1 min-w-0 overflow-hidden">
                <div className="text-[#0a2617] dark:text-gray-100 font-bold text-sm truncate" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</div>
                <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{me?.name || '-'}</div>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-2 space-y-1">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => setTab(key)} title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all ${
                  tab === key ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white border-[#0d5d3a] dark:border-[#1a8a5a]' : 'bg-white dark:bg-transparent text-[#0a2617] dark:text-gray-300 border-transparent hover:bg-[#f3fbf6] dark:hover:bg-white/5 dark:hover:border-white/10'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className={tab === key ? 'text-white' : 'text-[#0d5d3a] dark:text-[#10b981]'}>{icon}</span>
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
                  <div className="text-sm text-[#0a2617] font-semibold truncate">{me?.email || '-'}</div>
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="flex-shrink-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur border-b border-[#0d5d3a]/10 dark:border-white/10 z-10">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              {/* Desktop Welcome */}
              <div className="hidden md:block">
                <div className="text-[#0a2617] dark:text-gray-100 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {loading ? 'Loading...' : `Welcome, ${me?.name?.split(' ')[0] || 'there'}!`}
                </div>
                <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Your personal wellness dashboard</div>
              </div>

              {/* Divider for desktop */}
              {(tab === 'sessions' || tab === 'therapy' || tab === 'aichat') && (
                <div className="hidden md:block w-px h-10 bg-gray-200 dark:bg-gray-800 mx-2"></div>
              )}

              {/* Dynamic Header */}
              <div>
                <div className="text-[#0a2617] dark:text-gray-100 text-lg sm:text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {tab === 'sessions' ? 'My Sessions' : 
                   tab === 'therapy' ? 'Therapy Hub' : 
                   tab === 'chat' ? 'Chat' :
                   tab === 'aichat' ? 'AI Chat' : 
                   tab === 'progress' ? 'My Progress' :
                   tab === 'community' ? 'Community Stories' :
                   tab === 'resources' ? 'Wellness Resources' :
                   tab === 'reading' ? 'Therapist Reading Lists' :
                   tab === 'journal' ? 'Mood Journal' :
                   tab === 'circles' ? 'Peer Support Circles' :
                   tab === 'goals' ? 'Wellness Goals' :
                   tab === 'programs' ? 'Guided Wellness Programs' :
                   tab === 'settings' ? 'Settings' :
                   loading ? 'Loading...' : `Welcome, ${me?.name?.split(' ')[0] || 'there'}!`}
                </div>
                <div className="text-sm text-[#4a7c5d] dark:text-gray-400">
                  {tab === 'sessions' ? 'Manage your upcoming therapy appointments and view history.' : 
                   tab === 'therapy' ? 'Connect with verified professionals for your mental wellness journey.' : 
                   tab === 'chat' ? 'Secure, real-time messaging with your therapist.' :
                   tab === 'aichat' ? 'Your intelligent companion for mental wellness.' : 
                   tab === 'progress' ? 'Track your mood, sessions and mental wellness journey over time.' :
                   tab === 'community' ? 'Read and share stories — you are never alone. 💚' :
                   tab === 'resources' ? 'Curated videos, audio, articles & more for your wellness journey. 📚' :
                   tab === 'reading' ? 'Books, articles & resources hand-picked by our therapists.' :
                   tab === 'journal' ? 'Your private wellness diary with AI-powered weekly insights.' :
                   tab === 'circles' ? 'Real-time group spaces where you can share, support and feel less alone.' :
                   tab === 'goals' ? 'Build daily habits, track streaks and get nudged to never miss a day.' :
                   tab === 'programs' ? 'Structured day-by-day programs designed by mental health experts — free and science-backed.' :
                   tab === 'settings' ? 'Manage your account settings and preferences.' :
                   'Your personal wellness dashboard'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button type="button" onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-xl border border-[#0d5d3a]/15 text-[#0d5d3a] dark:border-white/10 dark:text-gray-300 hover:bg-[#f0fbf4] dark:hover:bg-white/10 transition">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          {tab === 'therapy' ? (
            <TherapyHub 
              onSessionBooked={() => setTab('sessions')} 
              onStartChat={(t) => { setChatTherapist(t); setTab('chat'); }} 
            />
          ) : tab === 'sessions' ? (
            <div className="flex-1 overflow-y-auto">
              <MySessionsPanel />
            </div>
          ) : tab === 'chat' && chatTherapist && me ? (
            <div className="flex-1 overflow-hidden">
              <UserChat therapist={chatTherapist} me={me} onBack={() => setTab('therapy')} />
            </div>
          ) : tab === 'aichat' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6 py-4">
              <AiChatPanel onNavigateToTherapy={() => setTab('therapy')} />
            </div>
          ) : tab === 'progress' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ZenProgressDashboard />
            </div>
          ) : tab === 'community' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <CommunityWall />
            </div>
          ) : tab === 'resources' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ResourceHub />
            </div>
          ) : tab === 'journal' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <MoodJournal />
            </div>
          ) : tab === 'circles' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <PeerCircles userId={me?.id} />
            </div>
          ) : tab === 'goals' ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <WellnessGoalTracker />
            </div>
          ) : tab === 'reading' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <ReadingListsUser />
              </div>
            </div>
          ) : tab === 'programs' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                <WellnessProgramsUser />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                {error && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
                )}
                {tab === 'settings' && <SettingsPanel me={me} setMe={setMe} onLogout={onLogout} />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* AI CHAT */
function AiChatPanel({ onNavigateToTherapy }: { onNavigateToTherapy?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <ZenAvatarChat onNavigateToTherapy={onNavigateToTherapy} />
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
          <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#0d5d3a]/15 dark:ring-white/10" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xl font-bold">{initials}</div>
        )}
        <div>
          <div className="text-sm font-semibold text-[#0a2617] dark:text-gray-100">Profile Photo</div>
          <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mb-2">PNG/JPG recommended</div>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 text-sm font-semibold cursor-pointer hover:bg-[#f0fbf4] dark:hover:bg-[#222222] transition">
            <Upload className="w-3.5 h-3.5" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) handleAvatar(f).catch(()=>{}); }} />
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-6">
        <Field label="Name"  value={name}  onChange={setName}  placeholder="Your name" />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 ..." />
        <Field label="Email (read-only)" value={me?.email||''} onChange={()=>{}} placeholder="" disabled />
        <Field label="Age"   value={age}   onChange={setAge}   placeholder="e.g. 16" />
        <label className="block">
          <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">Gender</div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50"
          >
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <button type="button" onClick={saveProfile} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 disabled:opacity-60 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#0d5d3a]/10 my-8" />

      {/* SECURITY SECTION */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#0a2617] dark:text-gray-100 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Security</h2>
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400">Change your password using your current password or via OTP sent to your email.</p>
          </div>
          {pwMsg && <div className={`text-sm font-semibold max-w-xs text-right ${pwMsg.ok ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-red-600 dark:text-red-400'}`}>{pwMsg.text}</div>}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl bg-[#eaf6ee] dark:bg-[#1a1a1a] p-1 max-w-xs mb-6 border border-transparent dark:border-white/10">
        {(['old','otp'] as const).map(m => (
          <button key={m} type="button" onClick={() => { setPwMode(m); setPwMsg(null); resetOtp(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${pwMode===m ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white' : 'text-[#0d5d3a] dark:text-gray-400 hover:text-white hover:bg-white/5'}`}>
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
              className="px-5 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-semibold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition disabled:opacity-60">
              {pwBusy ? 'Updating...' : 'Update Password'}
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

      {/* DANGER ZONE (Delete Account) */}
      <div className="mb-8 mt-10 border-t border-red-500/10 pt-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-red-600 dark:text-red-500 text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Danger Zone</h2>
            <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-[#1a0505] border border-red-200 dark:border-red-500/20 rounded-2xl p-5 max-w-xl">
            <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Are you absolutely sure?</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
              This action cannot be undone. This will permanently delete your personal information, settings, and all active sessions.
            </p>
            <label className="block mb-4">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1.5 block">
                Please type your registered email or phone number to confirm:
              </div>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={me?.email || me?.phone || ''}
                className="w-full bg-white dark:bg-[#111111] border border-red-300 dark:border-red-500/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-400 text-black dark:text-white transition-all text-sm"
              />
            </label>
            
            {deleteMsg && (
              <div className={`mb-4 text-sm font-semibold ${deleteMsg.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#222222] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#333333] transition"
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

/* FIELD */
function Field({ label, value, onChange, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">{label}</div>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50 disabled:opacity-60"
      />
    </label>
  );
}


/* PASSWORD FIELD WITH SHOW/HIDE */
function PwField({ label, value, onChange, show, onToggle, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-[#0a2617] dark:text-gray-300">{label}</div>
      <div className="mt-1.5 relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] px-4 pr-11 py-3 text-sm outline-none text-[#0a2617] dark:text-white focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/50"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-white transition">
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

/* ── MY SESSIONS PANEL ── */
function MySessionsPanel() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionTab, setSessionTab] = useState<'upcoming'|'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPast, setSelectedPast] = useState<string[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null); // null = modal closed
  const [now, setNow] = useState(new Date());
  const [activeVideoSession, setActiveVideoSession] = useState<string | null>(null);
  
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSession = async () => {
    if (!cancelSessionId) return;
    setCancelling(true);
    try {
      await apiFetch(`/sessions/${cancelSessionId}/cancel`, { method: 'POST' });
      setCancelSessionId(null);
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to cancel session');
    } finally {
      setCancelling(false);
    }
  };
  
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const submitRating = async () => {
    if (!ratingSessionId || ratingVal === 0) return;
    setSubmittingRating(true);
    try {
      await apiFetch(`/sessions/${ratingSessionId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating: ratingVal, review: reviewText })
      });
      setRatingSessionId(null);
      setRatingVal(0);
      setReviewText('');
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await apiFetch<any>('/sessions/me');
      if (res.ok) setSessions(res.sessions || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Opens the confirm modal for deleting specific ids (or current selection)
  const confirmDeletePast = (ids?: string[]) => {
    const toDelete = ids ?? selectedPast;
    if (toDelete.length === 0) return;
    setPendingDeleteIds(toDelete);
  };

  const handleDeletePast = async () => {
    if (!pendingDeleteIds || pendingDeleteIds.length === 0) return;
    try {
      await apiFetch('/sessions/past', {
        method: 'DELETE',
        body: JSON.stringify({ sessionIds: pendingDeleteIds })
      });
      setSelectedPast(prev => prev.filter(id => !pendingDeleteIds.includes(id)));
      setPendingDeleteIds(null);
      fetchSessions();
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  const todayStr = now.toDateString();

  const upcoming = sessions.filter(s => {
    const d = new Date(s.date);
    return d > now && d.toDateString() !== todayStr && s.status !== 'completed' && s.status !== 'cancelled';
  });

  const today = sessions.filter(s => {
    const d = new Date(s.date);
    return d.toDateString() === todayStr && s.status !== 'completed' && s.status !== 'cancelled';
  });

  const past = sessions.filter(s => {
    const d = new Date(s.date);
    return s.status === 'completed' || s.status === 'cancelled' || (d <= now && d.toDateString() !== todayStr);
  });

  const togglePastSelect = (id: string) => {
    setSelectedPast(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllPast = () => {
    if (selectedPast.length === past.length) setSelectedPast([]);
    else setSelectedPast(past.map(p => p._id));
  };

  const formatCountdown = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return 'Starting now';
    
    // Only show hours/mins/secs if within 24 hours
    if (diff <= 24 * 60 * 60 * 1000) {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `Starts in ${h}h ${m}m ${s}s`;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const isJoinable = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    // Joinable if it's within 2 minutes of starting (120,000 ms) and up to 1 hour after starting (-3600000 ms)
    return diff <= 2 * 60 * 1000 && diff >= -60 * 60 * 1000;
  };

  if (loading) return <div className="p-8 text-center text-[#4a7c5d] font-bold">Loading your sessions...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
      
      {/* Sub Tabs */}
      <div className="flex border-b border-[#0d5d3a]/10 dark:border-white/10 mb-8 overflow-x-auto hide-scrollbar">
        <button onClick={() => setSessionTab('upcoming')}
          className={`whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition ${sessionTab === 'upcoming' ? 'border-[#0d5d3a] text-[#0d5d3a] dark:border-[#10b981] dark:text-[#10b981]' : 'border-transparent text-[#4a7c5d] hover:text-[#0a2617] dark:text-gray-400 dark:hover:text-white'}`}>
          Upcoming Sessions
        </button>
        <button onClick={() => setSessionTab('past')}
          className={`whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition ${sessionTab === 'past' ? 'border-[#0d5d3a] text-[#0d5d3a] dark:border-[#10b981] dark:text-[#10b981]' : 'border-transparent text-[#4a7c5d] hover:text-[#0a2617] dark:text-gray-400 dark:hover:text-white'}`}>
          Past Sessions
        </button>
      </div>

      {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      {sessionTab === 'upcoming' && (
        <>
          {/* TODAY */}
          {today.length > 0 && (
        <div className="mb-10">
          <h3 className="font-bold text-[#0a2617] dark:text-white mb-4 flex items-center gap-2 text-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Today's Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {today.map(s => (
              <div key={s._id} className="bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10"><Stethoscope size={100} /></div>
                <div className="relative z-10">
                  <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full inline-block mb-4 backdrop-blur-sm">
                    {formatCountdown(new Date(s.date))}
                  </div>
                  <h4 className="font-black text-xl mb-1">{s.therapistName}</h4>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-1">
                    <Clock size={14} /> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-4">
                    <IndianRupee size={14} /> {s.amountPaid} Paid
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      disabled={!isJoinable(new Date(s.date))}
                      onClick={() => setActiveVideoSession(s._id)}
                      className="flex-1 py-2.5 rounded-xl font-bold bg-white text-[#0d5d3a] shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isJoinable(new Date(s.date)) ? 'Join Call' : 'Wait...'}
                    </button>
                    <button 
                      onClick={() => setCancelSessionId(s._id)}
                      className="px-4 py-2.5 rounded-xl font-bold bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING */}
      <div className="mb-10">
        <h3 className="font-bold text-[#0a2617] dark:text-white mb-4 flex items-center gap-2 text-lg">
          Upcoming Sessions
        </h3>
        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/5 rounded-3xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-[#4a7c5d] dark:text-gray-400 font-medium">No upcoming sessions scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map(s => (
              <div key={s._id} className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 px-3 py-1 rounded-full">
                    {formatCountdown(new Date(s.date))}
                  </div>
                </div>
                <h4 className="font-bold text-[#0a2617] dark:text-white text-lg mb-2">{s.therapistName}</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 text-sm font-medium">
                    <Calendar size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 text-sm font-medium">
                    <Clock size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 text-sm font-medium">
                    <IndianRupee size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {s.amountPaid} Paid
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button 
                    disabled={!isJoinable(new Date(s.date))}
                    onClick={() => setActiveVideoSession(s._id)}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md hover:bg-[#0a4a2e] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isJoinable(new Date(s.date)) ? 'Join Call' : 'Wait...'}
                  </button>
                  <button 
                    onClick={() => setCancelSessionId(s._id)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {sessionTab === 'past' && (
      <div>
        {/* PAST */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 text-lg">
            Past Sessions
          </h3>
          {past.length > 0 && (
            <div className="flex gap-2">
              <button onClick={selectAllPast} className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#e6f4ea] dark:bg-[#1a8a5a]/20 px-3 py-1.5 rounded-lg hover:bg-[#cce8d5] dark:hover:bg-[#1a8a5a]/40 transition">
                {selectedPast.length === past.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedPast.length > 0 && (
                <button onClick={() => confirmDeletePast()} className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
                  <Trash2 size={12} /> Delete ({selectedPast.length})
                </button>
              )}
            </div>
          )}
        </div>
        
        {past.length === 0 ? (
          <div className="bg-[#fbfdfb] dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-400 font-medium">No past sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map(s => {
              const selected = selectedPast.includes(s._id);
              return (
                <div key={s._id}
                  className={`border rounded-3xl p-5 cursor-pointer transition-all ${selected ? 'bg-[#e6f4ea]/50 dark:bg-[#0d5d3a]/10 border-[#0d5d3a] dark:border-[#10b981]' : 'bg-white dark:bg-[#111111] border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <h4 onClick={() => togglePastSelect(s._id)} className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 flex-1 cursor-pointer">
                      {s.therapistName}
                      {s.status === 'cancelled' && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDeletePast([s._id]); }}
                        className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition"
                        title="Delete this session"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div onClick={() => togglePastSelect(s._id)} className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${selected ? 'bg-[#0d5d3a] border-[#0d5d3a] text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                        {selected && <CheckSquare size={12} />}
                      </div>
                    </div>
                  </div>
                  
                  <div onClick={() => togglePastSelect(s._id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                    <Calendar size={12} /> {new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div onClick={() => togglePastSelect(s._id)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
                    <Clock size={12} /> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ₹{s.amountPaid}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
      {activeVideoSession && (
        <VideoRoom roomId={activeVideoSession} onLeave={async () => {
          try {
            await apiFetch(`/sessions/${activeVideoSession}/complete`, { method: 'POST' });
          } catch(e) {}
          setRatingSessionId(activeVideoSession);
          setActiveVideoSession(null);
          fetchSessions();
        }} />
      )}

      {/* DELETE PAST SESSIONS CONFIRM MODAL */}
      <AnimatePresence>
        {pendingDeleteIds !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white dark:bg-[#111111] rounded-3xl p-7 max-w-sm w-full shadow-2xl relative border border-red-200/60 dark:border-red-500/20"
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <Trash2 size={30} className="text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-xl font-black text-center text-[#0a2617] dark:text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Delete {pendingDeleteIds.length === 1 ? 'Session' : `${pendingDeleteIds.length} Sessions`}?
              </h3>

              {/* Body */}
              <p className="text-center text-[#4a7c5d] dark:text-gray-400 text-sm font-medium mb-2">
                This will permanently remove
                {pendingDeleteIds.length === 1
                  ? ' this session'
                  : ` these ${pendingDeleteIds.length} sessions`}{' '}
                from your history.
              </p>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  The review you gave for{' '}
                  {pendingDeleteIds.length === 1 ? 'this session' : 'these sessions'}{' '}
                  will also be deleted permanently.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteIds(null)}
                  className="flex-1 py-3 rounded-xl bg-[#f4f4f4] dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0a2617] dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/5 transition"
                >
                  Keep It
                </button>
                <button
                  onClick={handleDeletePast}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {ratingSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10">
              <button onClick={() => setRatingSessionId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="fill-current" />
                </div>
                <h3 className="text-2xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Rate Your Session</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-sm font-medium">How was your session? Your feedback helps us improve.</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRatingVal(star)} className={`transition-all ${ratingVal >= star ? 'text-amber-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400/50 hover:scale-110'}`}>
                    <Star size={36} className={ratingVal >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <textarea
                  placeholder="Leave an optional review..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/5 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-sm resize-none h-24 text-gray-900 dark:text-white"
                />
              </div>

              <button
                disabled={ratingVal === 0 || submittingRating}
                onClick={submitRating}
                className="w-full py-3.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold hover:bg-[#0a4a2e] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {cancelSessionId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Cancel Session?</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-sm font-medium mb-4">Are you sure you want to cancel this session?</p>
                
                <button 
                  onClick={() => setShowPolicy(true)}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <Info size={14} /> Read cancellation policy before cancelling
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  disabled={cancelling}
                  onClick={() => setCancelSessionId(null)} 
                  className="flex-1 py-3 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0a2617] dark:text-white rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition disabled:opacity-50"
                >
                  No, Keep it
                </button>
                <button
                  disabled={cancelling}
                  onClick={handleCancelSession}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPolicy && <CancellationPolicy onClose={() => setShowPolicy(false)} />}
      </AnimatePresence>

    </motion.div>
  );
}
