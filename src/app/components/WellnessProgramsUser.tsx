import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Play, CheckCircle, Clock, ChevronRight, X, Star, Zap, TrendingUp, Search, ArrowLeft, Check, Lock, Moon } from 'lucide-react';
import { apiFetch } from '../api/client';

/** Returns today's date string in IST as YYYY-MM-DD */
const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** Given a Date (when day was completed), returns whether the NEXT calendar day (IST midnight) has passed */
const nextDayUnlocked = (completedAt: Date | string | undefined): boolean => {
  if (!completedAt) return false;
  const completed = new Date(completedAt);
  // Get the IST date string of when day was completed
  const completedDateIST = completed.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  // Compare with today's IST date
  return todayIST() > completedDateIST;
};

/** Countdown to next midnight IST */
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Next midnight IST: get current IST time, find next midnight
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const istMidnight = new Date(Date.UTC(
        istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + 1, 0, 0, 0
      ) - istOffset);
      const diff = istMidnight.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  anxiety:     { label: 'Anxiety',     icon: '🧘', color: '#7c3aed' },
  stress:      { label: 'Stress',      icon: '💆', color: '#b45309' },
  sleep:       { label: 'Sleep',       icon: '🌙', color: '#1e40af' },
  self_esteem: { label: 'Self-Esteem', icon: '✨', color: '#be123c' },
  mindfulness: { label: 'Mindfulness', icon: '🍃', color: '#0d5d3a' },
  motivation:  { label: 'Motivation',  icon: '🚀', color: '#065f46' },
  other:       { label: 'Other',       icon: '💬', color: '#374151' },
};

const EXERCISE_ICONS: Record<string, string> = {
  breathing: '🌬️', journaling: '📝', meditation: '🧘', movement: '🏃',
  reading: '📖', reflection: '🪞', other: '⚡',
};

export default function WellnessProgramsUser() {
  const [programs, setPrograms]         = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<'browse' | 'my'>('browse');
  const countdown = useCountdown();
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState('all');
  const [diffFilter, setDiffFilter]     = useState('all');
  const [selected, setSelected]         = useState<any | null>(null);
  const [enrolling, setEnrolling]       = useState(false);
  const [completingDay, setCompletingDay] = useState<number | null>(null);
  const [msg, setMsg]                   = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        apiFetch<any>('/wellness-programs'),
        apiFetch<any>('/wellness-programs/user/my-programs'),
      ]);
      setPrograms(pRes.programs || []);
      setMyEnrollments(eRes.enrollments || []);
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to load programs', ok: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Default to 'my' tab if user has active enrollments
  useEffect(() => {
    if (myEnrollments.some((e: any) => !e.isCompleted)) setTab('my');
  }, [myEnrollments]);

  const filtered = useMemo(() => {
    return programs.filter(p => {
      const q = search.toLowerCase();
      const matchS = !search || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchC = catFilter === 'all' || p.category === catFilter;
      const matchD = diffFilter === 'all' || p.difficulty === diffFilter;
      return matchS && matchC && matchD;
    });
  }, [programs, search, catFilter, diffFilter]);

  const handleEnroll = async (programId: string) => {
    setEnrolling(true);
    try {
      await apiFetch(`/wellness-programs/${programId}/enroll`, { method: 'POST' });
      await load();
      // Refresh selected with enrollment info
      const detail = await apiFetch<any>(`/wellness-programs/${programId}`);
      setSelected({ ...detail.program, enrollment: detail.enrollment });
      setMsg({ text: '🎉 Enrolled successfully! Your journey begins today.', ok: true });
      setTimeout(() => setMsg(null), 3000);
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to enroll', ok: false });
    } finally {
      setEnrolling(false);
    }
  };

  const handleCompleteDay = async (programId: string, dayNumber: number) => {
    setCompletingDay(dayNumber);
    try {
      const res = await apiFetch<any>(`/wellness-programs/${programId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ dayNumber }),
      });
      await load();
      setSelected((prev: any) => prev ? { ...prev, enrollment: res.enrollment } : prev);
      if (res.enrollment.isCompleted) {
        setMsg({ text: '🏆 Congratulations! You completed the program!', ok: true });
      } else {
        setMsg({ text: `✅ Day ${dayNumber} complete! Keep going!`, ok: true });
      }
      setTimeout(() => setMsg(null), 3000);
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to update progress', ok: false });
    } finally {
      setCompletingDay(null);
    }
  };

  const openProgram = async (p: any) => {
    try {
      const res = await apiFetch<any>(`/wellness-programs/${p._id}`);
      setSelected({ ...res.program, enrollment: res.enrollment });
    } catch {
      setSelected(p);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4a7c5d] dark:text-gray-400 font-semibold">Loading programs...</p>
        </div>
      </div>
    );
  }

  /* ── DETAIL VIEW ── */
  if (selected) {
    const enr = selected.enrollment;
    const completedSet = new Set<number>(enr?.completedDays || []);
    const pct = enr ? Math.round((completedSet.size / selected.durationDays) * 100) : 0;
    const meta = CATEGORY_META[selected.category] || CATEGORY_META.other;

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto pb-20">
        {msg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-2xl font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
            {msg.ok ? <CheckCircle size={16} /> : null} {msg.text}
          </motion.div>
        )}

        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:opacity-75 transition mb-6">
          <ArrowLeft size={16} /> Back to Programs
        </button>

        {/* Header card */}
        <div className="rounded-3xl p-8 text-white mb-6 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${selected.coverGradientFrom}, ${selected.coverGradientTo})` }}>
          <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-8">
            <span className="text-[120px]">{meta.icon}</span>
          </div>
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              {meta.label} · {selected.difficulty}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{selected.title}</h1>
            <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-lg">{selected.description}</p>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-white/90">
              <span className="flex items-center gap-1"><Clock size={14} /> {selected.durationDays} days</span>
              <span className="flex items-center gap-1"><Star size={14} /> {selected.enrollmentCount || 0} enrolled</span>
            </div>
          </div>
        </div>

        {/* Progress bar (if enrolled) */}
        {enr && (
          <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 mb-6 border border-[#0d5d3a]/10 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#0a2617] dark:text-white text-sm">Your Progress</span>
              <span className="text-[#0d5d3a] dark:text-[#10b981] font-black text-sm">{pct}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${selected.coverGradientFrom}, ${selected.coverGradientTo})` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{completedSet.size} of {selected.durationDays} days complete</span>
              {enr.isCompleted && <span className="text-[#0d5d3a] dark:text-[#10b981] font-bold">🏆 Completed!</span>}
            </div>
          </div>
        )}

        {/* Enroll button */}
        {!enr && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => handleEnroll(selected._id)} disabled={enrolling}
            className="w-full py-4 rounded-2xl font-black text-white text-lg mb-6 shadow-xl disabled:opacity-60 transition"
            style={{ background: `linear-gradient(135deg, ${selected.coverGradientFrom}, ${selected.coverGradientTo})` }}>
            {enrolling ? 'Enrolling...' : '🚀 Start This Program — Free'}
          </motion.button>
        )}

        {/* Day steps */}
        <div className="space-y-3">
          <h3 className="font-bold text-[#0a2617] dark:text-white text-lg flex items-center gap-2">
            <BookOpen size={18} className="text-[#0d5d3a] dark:text-[#10b981]" /> Daily Plan
          </h3>
          {(selected.steps || []).map((step: any) => {
            const done = completedSet.has(step.dayNumber);
            const isCurrent = enr && !enr.isCompleted && step.dayNumber === enr.currentDay;
            const locked = !enr || (step.dayNumber > enr.currentDay && !done);

            // Day-gating: has prev day been completed today? If so, this day is waiting for midnight
            const prevDayCompletedDate = enr?.dayCompletedDates?.[String(step.dayNumber - 1)];
            const waitingForMidnight = isCurrent && step.dayNumber > 1 && prevDayCompletedDate && !nextDayUnlocked(prevDayCompletedDate);

            return (
              <motion.div key={step.dayNumber} layout
                className={`rounded-2xl border-2 p-5 transition-all ${
                  done ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/5'
                  : isCurrent && !waitingForMidnight ? 'bg-white dark:bg-[#111111]'
                  : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#111111] opacity-50'
                }`}
                style={isCurrent && !waitingForMidnight ? { borderColor: selected.coverGradientFrom } : {}}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                    done ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                    : waitingForMidnight ? 'bg-gray-100 dark:bg-white/10 text-gray-400'
                    : isCurrent ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                  }`}>
                    {done ? <Check size={18} /> : waitingForMidnight || locked ? <Lock size={14} /> : step.dayNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-[#0a2617] dark:text-white text-sm">{step.title}</span>
                      <span className="text-xs">{EXERCISE_ICONS[step.exerciseType] || '⚡'}</span>
                      {isCurrent && !waitingForMidnight && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: selected.coverGradientFrom }}>Today</span>
                      )}
                    </div>
                    {(isCurrent || done) && !waitingForMidnight && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mt-1">{step.content}</p>
                    )}
                    {waitingForMidnight && (
                      <div className="mt-2 flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2">
                        <Moon size={13} className="text-amber-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Come back tomorrow 🌙</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-500">Unlocks in {countdown} (at midnight)</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {step.durationMinutes} min</span>
                      {isCurrent && !done && !waitingForMidnight && (
                        <button onClick={() => handleCompleteDay(selected._id, step.dayNumber)} disabled={completingDay === step.dayNumber}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition disabled:opacity-50"
                          style={{ background: selected.coverGradientFrom }}>
                          {completingDay === step.dayNumber ? 'Saving...' : '✓ Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  /* ── LIST VIEW ── */
  const activeEnrollments = myEnrollments.filter(e => !e.isCompleted);
  const doneEnrollments = myEnrollments.filter(e => e.isCompleted);

  return (
    <div className="flex flex-col h-full">
      {msg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`mx-4 sm:mx-6 mt-4 p-3 rounded-2xl font-semibold flex items-center gap-2 text-sm ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {msg.ok ? <CheckCircle size={15} /> : null} {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={13} /></button>
        </motion.div>
      )}

      {/* ── STICKY CONTROLS ── */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-[#f7fbf8] dark:bg-[#050505] border-b border-[#0d5d3a]/8 dark:border-white/5 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white dark:bg-[#111111] rounded-xl border border-[#0d5d3a]/10 dark:border-white/10">
            {(['browse', 'my'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:text-[#0a2617] dark:hover:text-white'}`}>
                {t === 'browse' ? <><Search size={12}/> Browse All</> : <><BookOpen size={12}/> My Programs ({myEnrollments.length})</>}
              </button>
            ))}
          </div>
          {/* Stats badges */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
              <Zap size={13} className="text-[#0d5d3a] dark:text-[#10b981]" />
              <span className="text-xs font-bold text-[#0a2617] dark:text-white">{programs.length}</span>
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
              <TrendingUp size={13} className="text-[#10b981]" />
              <span className="text-xs font-bold text-[#0a2617] dark:text-white">{myEnrollments.length}</span>
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400">Enrolled</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-20">
      {tab === 'browse' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-sm text-[#0a2617] dark:text-white" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none text-sm font-semibold text-[#0a2617] dark:text-white cursor-pointer">
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl outline-none text-sm font-semibold text-[#0a2617] dark:text-white cursor-pointer">
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(p => {
              const meta = CATEGORY_META[p.category] || CATEGORY_META.other;
              const enr = p.enrollment;
              const pct = enr ? Math.round(((enr.completedDays?.length || 0) / p.durationDays) * 100) : 0;
              return (
                <motion.div key={p._id} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
                  onClick={() => openProgram(p)}
                  className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm cursor-pointer overflow-hidden transition-all">
                  {/* Gradient top strip */}
                  <div className="h-2" style={{ background: `linear-gradient(90deg, ${p.coverGradientFrom}, ${p.coverGradientTo})` }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{meta.icon}</div>
                      {enr && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${enr.isCompleted ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                          {enr.isCompleted ? '🏆 Done' : 'In Progress'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-[#0a2617] dark:text-white text-base leading-snug mb-1">{p.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{p.description}</p>

                    {enr && (
                      <div className="mb-4">
                        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${p.coverGradientFrom}, ${p.coverGradientTo})` }} />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{pct}% complete</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {p.durationDays}d</span>
                        <span className="capitalize">{p.difficulty}</span>
                        <span>{p.enrollmentCount || 0} enrolled</span>
                      </div>
                      <ChevronRight size={16} className="text-[#0d5d3a] dark:text-[#10b981]" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-bold text-[#4a7c5d] dark:text-gray-400">No programs match your filters.</div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'my' && (
        <div className="space-y-6">
          {myEnrollments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/5">
              <div className="text-5xl mb-4">🌱</div>
              <div className="font-bold text-[#0a2617] dark:text-white mb-2">No programs started yet</div>
              <div className="text-sm text-[#4a7c5d] dark:text-gray-400 mb-4">Browse our library and start your wellness journey today.</div>
              <button onClick={() => setTab('browse')} className="px-6 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold text-sm hover:bg-[#0a4a2e] transition">
                Browse Programs
              </button>
            </div>
          ) : (
            <>
              {activeEnrollments.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#0a2617] dark:text-white mb-3 flex items-center gap-2"><Play size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Active Programs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeEnrollments.map(e => {
                      const prog = e.programId;
                      const pct = Math.round(((e.completedDays?.length || 0) / (prog?.durationDays || 1)) * 100);
                      const meta = CATEGORY_META[prog?.category] || CATEGORY_META.other;
                      return (
                        <div key={e._id} onClick={() => prog && openProgram(prog)}
                          className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/5 p-5 cursor-pointer hover:shadow-md transition">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{meta.icon}</span>
                            <div>
                              <div className="font-bold text-[#0a2617] dark:text-white text-sm">{prog?.title || 'Program'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Day {e.currentDay} of {prog?.durationDays}</div>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${prog?.coverGradientFrom || '#0d5d3a'}, ${prog?.coverGradientTo || '#10b981'})` }} />
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">{pct}% complete</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {doneEnrollments.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#0a2617] dark:text-white mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> Completed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doneEnrollments.map(e => {
                      const prog = e.programId;
                      const meta = CATEGORY_META[prog?.category] || CATEGORY_META.other;
                      return (
                        <div key={e._id} className="bg-green-50 dark:bg-green-500/5 rounded-2xl border border-green-200 dark:border-green-500/20 p-5 flex items-center gap-3">
                          <span className="text-2xl">{meta.icon}</span>
                          <div>
                            <div className="font-bold text-[#0a2617] dark:text-white text-sm">{prog?.title}</div>
                            <div className="text-xs text-green-700 dark:text-green-400 font-semibold">🏆 Completed {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
