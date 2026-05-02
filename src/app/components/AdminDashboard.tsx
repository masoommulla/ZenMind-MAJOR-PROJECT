import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, Shield, CheckCircle, ChevronLeft, ChevronRight, Users, Search, Trash2, Clock, Activity, UserX, UserCheck } from 'lucide-react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [adminUsername, setAdminUsername] = useState('Admin');

  useEffect(() => {
    apiFetch('/admin/me')
      .then((res) => setAdminUsername(res.username))
      .catch(() => {}); // ignore
  }, []);

  return (
    <div className="flex h-screen bg-[#f7fbf8] overflow-hidden text-[#0a2617]">
      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarExpanded ? 280 : 80 }}
        className="relative flex-shrink-0 bg-white border-r border-[#0d5d3a]/10 flex flex-col h-full z-20 hidden md:flex"
      >
        <div className={`p-6 flex items-center ${sidebarExpanded ? 'gap-3' : 'justify-center'} h-[88px] border-b border-[#0d5d3a]/5`}>
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover shrink-0" />
          <AnimatePresence mode="popLayout">
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap font-bold text-lg tracking-wide"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Admin Panel
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setSidebarExpanded((s) => !s)}
          className="absolute -right-4 top-8 bg-white border border-[#0d5d3a]/15 text-[#0a2617] p-1.5 rounded-full shadow-sm hover:bg-[#f0fbf4] hover:text-[#0d5d3a] transition-colors z-30"
        >
          {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          <NavItem icon={Users} label="Members Directory" active={activeTab === 'users'} onClick={() => setActiveTab('users')} expanded={sidebarExpanded} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} expanded={sidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-[#0d5d3a]/5">
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors`}
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        <header className="h-[88px] shrink-0 bg-white/80 backdrop-blur-md border-b border-[#0d5d3a]/5 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0a2617]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {activeTab === 'users' ? 'Members Directory' : 'Admin Settings'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d5d3a] flex items-center justify-center text-white font-bold">
              <Shield size={20} />
            </div>
            <div className="hidden sm:block text-sm">
              <div className="font-bold text-[#0a2617]">{adminUsername}</div>
              <div className="text-xs text-[#4a7c5d]">Super Admin</div>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10 mx-auto w-full max-w-7xl">
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'settings' && <AdminSettings onUpdateName={setAdminUsername} />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${expanded ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all duration-200 ${
        active ? 'bg-[#0d5d3a] text-white shadow-md shadow-[#0d5d3a]/20' : 'text-[#4a7c5d] hover:bg-[#f0fbf4] hover:text-[#0d5d3a]'
      }`}
      title={!expanded ? label : undefined}
    >
      <Icon size={20} className="shrink-0" />
      {expanded && <span>{label}</span>}
    </button>
  );
}

function AdminSettings({ onUpdateName }: { onUpdateName: (n: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body: any = {};
      if (username.trim()) body.username = username.trim();
      if (password.trim()) body.password = password.trim();

      if (Object.keys(body).length === 0) {
        setMsg({ text: 'No changes made.', ok: false });
        return;
      }

      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      if (body.username) onUpdateName(body.username);
      setMsg({ text: 'Settings updated successfully.', ok: true });
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to update', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold text-[#0a2617] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Update Credentials
      </h2>
      <p className="text-[#4a7c5d] text-sm mb-8">
        Change your admin username or password. Leave a field blank if you do not wish to change it.
      </p>

      <form onSubmit={handleUpdate} className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-[#0a2617] mb-1.5 block">New Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
            className="w-full bg-white border border-[#0d5d3a]/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 focus:border-[#0d5d3a] transition-all text-sm shadow-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#0a2617] mb-1.5 block">New Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full bg-white border border-[#0d5d3a]/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 focus:border-[#0d5d3a] transition-all text-sm shadow-sm"
          />
        </label>

        {msg && (
          <div className={`flex items-center gap-2 text-sm font-semibold p-3 rounded-xl ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {msg.ok && <CheckCircle size={16} />}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || (!username.trim() && !password.trim())}
          className="w-full py-3 mt-4 rounded-xl bg-[#0d5d3a] text-white font-bold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] disabled:opacity-50 transition-all"
        >
          {busy ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

type UserData = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  isSuspended: boolean;
  createdAt: string;
};

function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ total: 0, suspended: 0, today: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadUsers = async () => {
    try {
      const res = await apiFetch<any>('/admin/users');
      setUsers(res.users);
      setStats(res.stats);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSuspend = async (id: string, currentlySuspended: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentlySuspended ? 'unsuspend' : 'suspend'} this user?`)) return;
    try {
      const res = await apiFetch<any>(`/admin/users/${id}/suspend`, { method: 'PUT' });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isSuspended: res.isSuspended } : u));
      // Optionally reload stats
      loadUsers();
    } catch (e) {
      alert('Failed to suspend user');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`DANGER: Are you absolutely sure you want to permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u._id !== id));
      loadUsers();
    } catch (e) {
      alert('Failed to delete user');
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
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-[#0d5d3a]/10 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[#4a7c5d] font-bold text-sm uppercase tracking-wider mb-2">
            <Users size={16} /> Total Members
          </div>
          <div className="text-3xl font-black text-[#0a2617]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {stats.total}
          </div>
          <div className="text-xs text-[#0d5d3a] mt-1 font-semibold">{stats.active} active • {stats.suspended} suspended</div>
        </div>
        
        <div className="bg-[#0d5d3a] rounded-3xl p-6 text-white shadow-lg shadow-[#0d5d3a]/20 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={64} /></div>
          <div className="flex items-center gap-3 font-bold text-sm text-[#c8e6c9] uppercase tracking-wider mb-2 relative z-10">
            <UserCheck size={16} /> Today's Members
          </div>
          <div className="text-3xl font-black relative z-10" style={{ fontFamily: 'Syne, sans-serif' }}>
            +{stats.today}
          </div>
          <div className="text-xs text-[#c8e6c9] mt-1 font-semibold relative z-10">New signups today</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#0d5d3a]/10 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-[#4a7c5d] font-bold text-sm uppercase tracking-wider mb-2">
            <Clock size={16} /> Real-Time Clock
          </div>
          <div className="text-2xl font-black text-[#0a2617]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {time.toLocaleTimeString()}
          </div>
          <div className="text-xs text-[#0d5d3a] mt-1 font-semibold">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-[#0d5d3a]/10 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]" />
          <input
            type="text"
            placeholder="Search Name, Email, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fbfdfb] border border-[#0d5d3a]/15 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm font-medium"
          />
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <select 
            value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#fbfdfb] border border-[#0d5d3a]/15 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm font-medium cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select 
            value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#fbfdfb] border border-[#0d5d3a]/15 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm font-medium cursor-pointer"
          >
            <option value="all">All Ages</option>
            <option value="under18">Under 18</option>
            <option value="18-25">18 - 25</option>
            <option value="over25">Over 25</option>
          </select>
        </div>
      </div>

      {/* Directory Card */}
      <div className="bg-white rounded-3xl border border-[#0d5d3a]/10 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#0d5d3a]/10 bg-[#fbfdfb] text-xs font-bold text-[#4a7c5d] uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-4">Member Profile</div>
          <div className="hidden sm:block col-span-3">Demographics</div>
          <div className="col-span-4 sm:col-span-3 text-center sm:text-left">Status</div>
          <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 max-h-[500px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-[#4a7c5d] font-semibold">No members found matching your filters.</div>
          ) : (
            <div className="divide-y divide-[#0d5d3a]/5">
              {filteredUsers.map(u => (
                <div key={u._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#fbfdfb] transition-colors">
                  
                  {/* Profile */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-[#e8f3ec] flex items-center justify-center text-[#0d5d3a] font-bold flex-shrink-0">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[#0a2617] text-sm truncate">{u.name}</div>
                      <div className="text-xs text-[#4a7c5d] truncate">{u.email}</div>
                      <div className="text-xs text-[#4a7c5d] truncate mt-0.5">{u.phone}</div>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="hidden sm:flex col-span-3 flex-col justify-center">
                    <div className="font-bold text-[#0a2617] text-sm capitalize">{u.gender || 'Unknown'}</div>
                    <div className="text-xs text-[#4a7c5d]">Age: {u.age}</div>
                  </div>

                  {/* Status */}
                  <div className="col-span-4 sm:col-span-3 flex justify-center sm:justify-start items-center">
                    {u.isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
                        <UserX size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                        <UserCheck size={12} /> Verified
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleSuspend(u._id, u.isSuspended)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        u.isSuspended 
                          ? 'bg-[#0d5d3a]/10 text-[#0d5d3a] hover:bg-[#0d5d3a]/20' 
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                      title={u.isSuspended ? 'Activate User' : 'Suspend User'}
                    >
                      {u.isSuspended ? 'Activate' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
