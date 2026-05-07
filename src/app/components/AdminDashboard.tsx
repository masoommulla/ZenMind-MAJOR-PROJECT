import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, Shield, CheckCircle, ChevronLeft, ChevronRight, Users, Search, Trash2, Clock, Activity, UserX, UserCheck, Menu, X, AlertTriangle, FileText, Plus, Edit2, Save, Stethoscope, LifeBuoy, Eye } from 'lucide-react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';
import ThemeToggle from './ThemeToggle';
import TherapistsManagement from './TherapistsManagement';

type AdminDashboardProps = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'therapists' | 'content' | 'support' | 'settings'>('users');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('Admin');

  useEffect(() => {
    apiFetch('/admin/me').then((res: any) => setAdminUsername(res.username)).catch(() => {});
  }, []);

  const navTo = (tab: 'users' | 'therapists' | 'content' | 'support' | 'settings') => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const SidebarContent = ({ mobile }: { mobile?: boolean }) => (
    <>
      <div className={`p-5 flex items-center ${(!mobile && sidebarExpanded) || mobile ? 'gap-3' : 'justify-center'} h-[72px] border-b border-[#0d5d3a]/10 dark:border-white/10`}>
        <img src={logo} alt="Logo" className="w-9 h-9 rounded-full object-cover shrink-0" />
        {(mobile || sidebarExpanded) && (
          <span className="font-bold text-lg tracking-wide overflow-hidden whitespace-nowrap text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
            Admin Panel
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <NavItem icon={Users} label="Members Directory" active={activeTab === 'users'} onClick={() => navTo('users')} expanded={mobile || sidebarExpanded} />
        <NavItem icon={Stethoscope} label="Therapists Directory" active={activeTab === 'therapists'} onClick={() => navTo('therapists')} expanded={mobile || sidebarExpanded} />
        <NavItem icon={FileText} label="Content Mgmt" active={activeTab === 'content'} onClick={() => navTo('content')} expanded={mobile || sidebarExpanded} />
        <NavItem icon={LifeBuoy} label="Support Tickets" active={activeTab === 'support'} onClick={() => navTo('support')} expanded={mobile || sidebarExpanded} />
        <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => navTo('settings')} expanded={mobile || sidebarExpanded} />
      </nav>
      <div className="p-3 border-t border-[#0d5d3a]/10 dark:border-white/10">
        <button onClick={onLogout} className={`w-full flex items-center ${(mobile || sidebarExpanded) ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors`}>
          <LogOut size={20} className="shrink-0" />
          {(mobile || sidebarExpanded) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#f7fbf8] dark:bg-[#050505] overflow-hidden text-[#0a2617] dark:text-gray-100 transition-colors duration-300">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 flex flex-col z-40 md:hidden">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
              <X size={18} />
            </button>
            <SidebarContent mobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: sidebarExpanded ? 260 : 72 }} transition={{ duration: 0.25 }}
        className="relative flex-shrink-0 bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 flex-col h-full z-20 hidden md:flex overflow-hidden">
        <button onClick={() => setSidebarExpanded(s => !s)}
          className="absolute -right-3.5 top-6 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 text-[#0a2617] dark:text-gray-300 p-1 rounded-full shadow-sm hover:bg-[#f0fbf4] dark:hover:bg-[#222222] hover:text-[#0d5d3a] dark:hover:text-white transition-colors z-30">
          {sidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-[72px] shrink-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-[#0d5d3a]/10 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300">
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
              {activeTab === 'users' ? 'Members Directory' : activeTab === 'therapists' ? 'Therapists Directory' : activeTab === 'content' ? 'Content Management' : activeTab === 'support' ? 'Support Tickets' : 'Admin Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#0d5d3a] dark:bg-[#1a8a5a] flex items-center justify-center text-white font-bold">
                <Shield size={18} />
              </div>
              <div className="hidden sm:block text-sm">
                <div className="font-bold text-[#0a2617] dark:text-gray-100">{adminUsername}</div>
                <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {activeTab === 'users' && <UsersManagement />}
            {activeTab === 'therapists' && <TherapistsManagement />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'support' && <SupportManagement />}
            {activeTab === 'settings' && <AdminSettings onUpdateName={setAdminUsername} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center ${expanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all duration-200 ${active ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
      title={!expanded ? label : undefined}>
      <Icon size={20} className="shrink-0" />
      {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  );
}

/* ── Custom Confirm Modal ── */
function ConfirmModal({ open, title, message, confirmLabel, danger, onConfirm, onCancel, busy }: {
  open: boolean; title: string; message: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-600' : 'text-amber-600'} />
          </div>
          <div>
            <h3 className="font-bold text-[#0a2617] text-lg">{title}</h3>
            <p className="text-sm text-[#4a7c5d] mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onCancel} disabled={busy}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy}
            className={`px-5 py-2.5 rounded-xl text-white font-bold transition disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminSettings({ onUpdateName }: { onUpdateName: (n: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try {
      const body: any = {};
      if (username.trim()) body.username = username.trim();
      if (password.trim()) body.password = password.trim();
      if (Object.keys(body).length === 0) { setMsg({ text: 'No changes made.', ok: false }); return; }
      await apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(body) });
      if (body.username) onUpdateName(body.username);
      setMsg({ text: 'Settings updated successfully.', ok: true });
      setUsername(''); setPassword('');
    } catch (err: any) { setMsg({ text: err.message || 'Failed to update', ok: false }); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Update Credentials</h2>
      <p className="text-[#4a7c5d] dark:text-gray-400 text-sm mb-8">Change your admin username or password. Leave a field blank to keep it unchanged.</p>
      <form onSubmit={handleUpdate} className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">New Username</span>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter new username"
            className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 transition-all text-sm shadow-sm text-[#0a2617] dark:text-white" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">New Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
            className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 transition-all text-sm shadow-sm text-[#0a2617] dark:text-white" />
        </label>
        {msg && (
          <div className={`flex items-center gap-2 text-sm font-semibold p-3 rounded-xl ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
            {msg.ok && <CheckCircle size={16} />}{msg.text}
          </div>
        )}
        <button type="submit" disabled={busy || (!username.trim() && !password.trim())}
          className="w-full py-3 mt-4 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-50 transition-all">
          {busy ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

type UserData = { _id: string; name: string; email: string; phone: string; age: number; gender: string; isSuspended: boolean; createdAt: string; };

function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ total: 0, suspended: 0, today: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [time, setTime] = useState(new Date());

  // Confirm modal state
  const [confirm, setConfirm] = useState<{
    open: boolean; type: 'suspend' | 'delete' | null;
    userId: string; userName: string; currentlySuspended: boolean; busy: boolean;
  }>({ open: false, type: null, userId: '', userName: '', currentlySuspended: false, busy: false });

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const res = await apiFetch<any>('/admin/users');
      setUsers(res.users); setStats(res.stats);
    } catch (e: any) { 
      console.error('Failed to load users', e); 
      setError(e.message || 'Failed to load directory');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const openSuspendConfirm = (u: UserData) =>
    setConfirm({ open: true, type: 'suspend', userId: u._id, userName: u.name, currentlySuspended: u.isSuspended, busy: false });

  const openDeleteConfirm = (u: UserData) =>
    setConfirm({ open: true, type: 'delete', userId: u._id, userName: u.name, currentlySuspended: u.isSuspended, busy: false });

  const closeConfirm = () => setConfirm(c => ({ ...c, open: false, busy: false }));

  const handleConfirmAction = async () => {
    setConfirm(c => ({ ...c, busy: true }));
    try {
      if (confirm.type === 'suspend') {
        const res = await apiFetch<any>(`/admin/users/${confirm.userId}/suspend`, { method: 'PUT' });
        setUsers(prev => prev.map(u => u._id === confirm.userId ? { ...u, isSuspended: res.isSuspended } : u));
        await loadUsers();
      } else if (confirm.type === 'delete') {
        await apiFetch(`/admin/users/${confirm.userId}`, { method: 'DELETE' });
        setUsers(prev => prev.filter(u => u._id !== confirm.userId));
        await loadUsers();
      }
      closeConfirm();
    } catch (e: any) {
      setConfirm(c => ({ ...c, busy: false }));
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchGender = genderFilter === 'all' || u.gender === genderFilter;
    let matchAge = true;
    if (ageFilter === 'under18') matchAge = u.age < 18;
    else if (ageFilter === '18-25') matchAge = u.age >= 18 && u.age <= 25;
    else if (ageFilter === 'over25') matchAge = u.age > 25;
    return matchSearch && matchGender && matchAge;
  });

  if (loading) return <div className="text-center py-20 text-[#4a7c5d] font-bold">Loading members directory...</div>;

  return (
    <>
      <ConfirmModal
        open={confirm.open}
        title={confirm.type === 'suspend' ? (confirm.currentlySuspended ? 'Activate User?' : 'Suspend User?') : 'Delete User?'}
        message={confirm.type === 'suspend'
          ? (confirm.currentlySuspended
              ? `This will restore ${confirm.userName}'s access to the platform.`
              : `${confirm.userName} will be blocked from logging in immediately.`)
          : `This will permanently delete ${confirm.userName}'s account. This cannot be undone.`}
        confirmLabel={confirm.type === 'suspend' ? (confirm.currentlySuspended ? 'Yes, Activate' : 'Yes, Suspend') : 'Yes, Delete'}
        danger={confirm.type === 'delete'}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirm}
        busy={confirm.busy}
      />

      <div className="flex flex-col gap-5">
        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 text-sm font-semibold">
            Error: {error}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2"><Users size={14} /> Total Members</div>
            <div className="text-3xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{stats.total}</div>
            <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold">{stats.active} active • {stats.suspended} suspended</div>
          </div>
          <div className="bg-[#0d5d3a] dark:bg-[#1a8a5a] rounded-3xl p-5 text-white shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Activity size={56} /></div>
            <div className="flex items-center gap-2 font-bold text-xs text-[#c8e6c9] dark:text-green-100 uppercase tracking-wider mb-2 relative z-10"><UserCheck size={14} /> Today's Members</div>
            <div className="text-3xl font-black relative z-10" style={{ fontFamily: 'Syne, sans-serif' }}>+{stats.today}</div>
            <div className="text-xs text-[#c8e6c9] dark:text-green-100 mt-1 font-semibold relative z-10">New signups today</div>
          </div>
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2"><Clock size={14} /> Real-Time Clock</div>
            <div className="text-2xl font-black text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{time.toLocaleTimeString()}</div>
            <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] mt-1 font-semibold">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#111111] p-4 rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />
            <input type="text" placeholder="Search name, email, or mobile..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white" />
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white cursor-pointer">
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 text-sm font-medium text-[#0a2617] dark:text-white cursor-pointer">
              <option value="all">All Ages</option>
              <option value="under18">Under 18</option>
              <option value="18-25">18 – 25</option>
              <option value="over25">Over 25</option>
            </select>
          </div>
        </div>

        {/* Directory */}
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-4">Member</div>
            <div className="hidden sm:block col-span-3">Demographics</div>
            <div className="col-span-3 sm:col-span-3 text-center sm:text-left">Status</div>
            <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
          </div>
          <div className="overflow-y-auto max-h-[480px] divide-y divide-[#0d5d3a]/5 dark:divide-white/5">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-[#4a7c5d] dark:text-gray-400 font-semibold">No members found matching your filters.</div>
            ) : filteredUsers.map(u => (
              <div key={u._id} className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors">
                <div className="col-span-6 sm:col-span-4 flex items-center gap-2 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-[#e8f3ec] dark:bg-[#10b981]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm flex-shrink-0">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{u.name}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{u.email}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{u.phone}</div>
                  </div>
                </div>
                <div className="hidden sm:flex col-span-3 flex-col justify-center">
                  <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm capitalize">{u.gender || 'Unknown'}</div>
                  <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Age: {u.age}</div>
                </div>
                <div className="col-span-3 flex justify-center sm:justify-start items-center">
                  {u.isSuspended ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
                      <UserX size={11} /> <span className="hidden sm:inline">Suspended</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                      <UserCheck size={11} /> <span className="hidden sm:inline">Active</span>
                    </span>
                  )}
                </div>
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button onClick={() => openSuspendConfirm(u)}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.isSuspended ? 'bg-[#0d5d3a]/10 text-[#0d5d3a] hover:bg-[#0d5d3a]/20' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                    {u.isSuspended ? 'Activate' : 'Suspend'}
                  </button>
                  <button onClick={() => openDeleteConfirm(u)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ContentManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'stories'>('stats');
  const [settings, setSettings] = useState({ activeUsers: '', satisfactionRate: '', therapistsCount: '', supportAvailable: '' });
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const loadData = async () => {
    try {
      const [setRes, stoRes] = await Promise.all([
        apiFetch<any>('/admin/settings/site'),
        apiFetch<any>('/admin/stories')
      ]);
      setSettings(setRes.settings || { activeUsers: '', satisfactionRate: '', therapistsCount: '', supportAvailable: '' });
      setStories(stoRes.stories || []);
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to load content', ok: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveSettings = async () => {
    try {
      setMsg(null);
      await apiFetch('/admin/settings/site', { method: 'PUT', body: JSON.stringify(settings) });
      setMsg({ text: 'Settings updated successfully.', ok: true });
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to update settings', ok: false });
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Delete this story?')) return;
    try {
      await apiFetch(`/admin/stories/${id}`, { method: 'DELETE' });
      setStories(stories.filter(s => s._id !== id));
      setMsg({ text: 'Story deleted.', ok: true });
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to delete story', ok: false });
    }
  };

  if (loading) return <div className="text-[#4a7c5d] font-bold">Loading content...</div>;

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {msg.text}
        </div>
      )}

      {/* Sub-header Navigation */}
      <div className="sticky top-0 z-20 flex gap-2 p-1 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl w-fit shadow-sm">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'stats' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
        >
          <div className="flex items-center gap-2"><Activity size={16} /> Global Statistics</div>
        </button>
        <button
          onClick={() => setActiveSubTab('stories')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'stories' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
        >
          <div className="flex items-center gap-2"><FileText size={16} /> Stories of Hope</div>
        </button>
      </div>

      {activeSubTab === 'stats' && (
        <section className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#0d5d3a] dark:text-[#10b981]" /> Global Statistics (Trusted by Thousands)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Active Users</span>
              <input type="text" value={settings.activeUsers} onChange={e => setSettings({ ...settings, activeUsers: e.target.value })} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0d5d3a] dark:focus:border-[#1a8a5a] text-[#0a2617] dark:text-white" placeholder="50000" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Satisfaction Rate</span>
              <input type="text" value={settings.satisfactionRate} onChange={e => setSettings({ ...settings, satisfactionRate: e.target.value })} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0d5d3a] dark:focus:border-[#1a8a5a] text-[#0a2617] dark:text-white" placeholder="98" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Therapists Count</span>
              <input type="text" value={settings.therapistsCount} onChange={e => setSettings({ ...settings, therapistsCount: e.target.value })} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0d5d3a] dark:focus:border-[#1a8a5a] text-[#0a2617] dark:text-white" placeholder="1000" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Support Available</span>
              <input type="text" value={settings.supportAvailable} onChange={e => setSettings({ ...settings, supportAvailable: e.target.value })} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0d5d3a] dark:focus:border-[#1a8a5a] text-[#0a2617] dark:text-white" placeholder="24" />
            </label>
          </div>
          <button onClick={saveSettings} className="mt-5 px-6 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition flex items-center gap-2">
            <Save size={18} /> Save Statistics
          </button>
        </section>
      )}

      {activeSubTab === 'stories' && (
        <section className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[calc(100vh-220px)]">
          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100 mb-6 flex items-center gap-2 shrink-0">
            <FileText size={20} className="text-[#0d5d3a] dark:text-[#10b981]" /> User Stories Management
          </h2>
          
          <div className="space-y-3 overflow-y-auto pr-2 flex-1">
            {stories.map(s => (
              <div key={s._id} className="p-4 border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl flex justify-between gap-4 bg-[#fbfdfb] dark:bg-[#1a1a1a]">
                <div>
                  <p className="text-sm text-[#0a2617] dark:text-gray-300 italic mb-2">"{s.story}"</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400">— {s.author}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">Rating: {s.rating}/5</span>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Unknown date'}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteStory(s._id)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg h-fit transition" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {stories.length === 0 && <p className="text-sm text-[#4a7c5d] dark:text-gray-400">No stories found.</p>}
          </div>
        </section>
      )}
    </div>
  );
}

type SupportTicketData = {
  _id: string;
  type: 'contact' | 'report';
  subject: string;
  body: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'resolved';
  createdAt: string;
};

function SupportManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'report'>('contact');
  const [tickets, setTickets] = useState<SupportTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [viewingTicket, setViewingTicket] = useState<SupportTicketData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/admin/support');
      setTickets(res.tickets || []);
      setSelectedIds(new Set());
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to load tickets', ok: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleStatus = async (id: string) => {
    try {
      await apiFetch(`/admin/support/${id}/resolve`, { method: 'PUT' });
      await loadData();
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to update ticket', ok: false });
    }
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmOpen(true);
  };

  const executeBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch('/admin/support/bulk-delete', { 
        method: 'POST', 
        body: JSON.stringify({ ids: Array.from(selectedIds) }) 
      });
      setMsg({ text: 'Tickets deleted successfully.', ok: true });
      await loadData();
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to delete tickets', ok: false });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const filtered = tickets.filter(t => t.type === activeSubTab);

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(t => t._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  if (loading) return <div className="text-[#4a7c5d] font-bold">Loading support tickets...</div>;

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
           {msg.text}
        </div>
      )}

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Delete Selected Tickets?"
        message={`Are you sure you want to delete ${selectedIds.size} selected ticket(s)? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        danger={true}
        onConfirm={executeBulkDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        busy={isDeleting}
      />

      {/* Sub-header Navigation */}
      <div className="sticky top-0 z-20 flex flex-wrap gap-2 justify-between items-center bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveSubTab('contact'); setSelectedIds(new Set()); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'contact' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
          >
            Contact Us Messages
          </button>
          <button
            onClick={() => { setActiveSubTab('report'); setSelectedIds(new Set()); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'report' ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/5 dark:hover:bg-white/5 hover:text-[#0d5d3a] dark:hover:text-gray-200'}`}
          >
            Reported Issues
          </button>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#4a7c5d] dark:text-gray-400">{selectedIds.size} selected</span>
            <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-200 dark:hover:bg-red-500/30 transition">
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[900px] flex-1 flex flex-col">
            <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider items-center shrink-0">
              <div className="col-span-1 flex items-center">
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-[#0d5d3a] focus:ring-[#0d5d3a]" />
              </div>
              <div className="col-span-3">User</div>
              <div className="col-span-4">Subject & Message</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#0d5d3a]/5 dark:divide-white/5">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-[#4a7c5d] dark:text-gray-400 font-semibold">No tickets found.</div>
              ) : filtered.map(t => (
                <div key={t._id} className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-4 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors ${selectedIds.has(t._id) ? 'bg-[#0d5d3a]/5 dark:bg-[#1a8a5a]/10' : ''}`}>
                  <div className="col-span-1">
                    <input type="checkbox" checked={selectedIds.has(t._id)} onChange={() => toggleSelect(t._id)} className="w-4 h-4 rounded border-gray-300 text-[#0d5d3a] focus:ring-[#0d5d3a]" />
                  </div>
                  <div className="col-span-3 overflow-hidden">
                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{t.name}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{t.email}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{t.phone}</div>
                  </div>
                  <div className="col-span-4 overflow-hidden pr-4">
                    <div className="font-bold text-[#0a2617] dark:text-gray-100 text-sm truncate">{t.subject}</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400 line-clamp-2 mt-1">{t.body}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {t.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                        <CheckCircle size={11} /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                        <Clock size={11} /> Pending
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 items-center">
                    <button onClick={() => setViewingTicket(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => toggleStatus(t._id)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-bold transition">
                      {t.status === 'pending' ? 'Mark Resolved' : 'Mark Pending'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {viewingTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Ticket Details
              </h3>
              <button onClick={() => setViewingTicket(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Name</p>
                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Email</p>
                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.email}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Phone</p>
                  <p className="text-[#0a2617] dark:text-white font-medium">{viewingTicket.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider">Date Submitted</p>
                  <p className="text-[#0a2617] dark:text-white font-medium">{new Date(viewingTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-1">Subject</p>
                <p className="text-[#0a2617] dark:text-white font-bold">{viewingTicket.subject}</p>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-1">Message</p>
                <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl text-[#0a2617] dark:text-gray-300 whitespace-pre-wrap text-sm border border-gray-100 dark:border-white/5">
                  {viewingTicket.body}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
