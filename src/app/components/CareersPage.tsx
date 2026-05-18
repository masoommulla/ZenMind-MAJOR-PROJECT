import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Briefcase, ChevronRight, Search, ArrowLeft, Star, Send, Upload, CheckCircle } from 'lucide-react';
import { apiFetch } from '../api/client';

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#0d5d3a', Design: '#7c3aed', Marketing: '#b45309',
  HR: '#0369a1', Operations: '#065f46', Finance: '#be123c', Default: '#374151',
};

function getColor(dept: string) { return DEPT_COLORS[dept] || DEPT_COLORS.Default; }

export default function CareersPage({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    apiFetch<any>('/jobs').then(r => setJobs(r.jobs || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const depts = ['All', ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))];
  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = !q || j.title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q);
    const matchF = filter === 'All' || j.department === filter;
    return matchQ && matchF;
  });
  const featured = filtered.filter(j => j.featured);
  const regular  = filtered.filter(j => !j.featured);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white dark:bg-[#050505] overflow-y-auto">
      {/* Floating close button */}
      <button onClick={onClose} className="fixed top-4 right-4 z-[210] w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-lg border border-[#0d5d3a]/20 dark:border-white/10 flex items-center justify-center text-[#0a2617] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        <X size={18} />
      </button>

      <AnimatePresence mode="wait">
        {selected ? (
          <JobDetail key="detail" job={selected} onBack={() => setSelected(null)} applying={applying} setApplying={setApplying} />
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#f8fdf9] via-[#e8f5e9] to-[#c8e6c9] dark:from-[#050505] dark:via-[#071d13] dark:to-[#0a2617] py-16 sm:py-24 text-center px-4">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-6">We're Hiring</span>
                <h1 className="text-4xl sm:text-6xl font-black text-[#0a2617] dark:text-white mb-5 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Build the future of<br />
                  <span className="bg-gradient-to-r from-[#0d5d3a] to-[#10b981] bg-clip-text text-transparent">mental healthcare</span>
                </h1>
                <p className="text-lg text-[#4a7c5d] dark:text-gray-400 max-w-xl mx-auto">Join our mission to make adolescent mental wellness accessible to every student in India.</p>
              </motion.div>
            </section>

            {/* Filters */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles, locations..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {depts.map(d => (
                    <button key={d} onClick={() => setFilter(d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === d ? 'bg-[#0d5d3a] text-white shadow-md' : 'bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 hover:border-[#0d5d3a]/40'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 text-[#4a7c5d] dark:text-gray-400 font-semibold">Loading positions...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4"></div>
                  <div className="text-xl font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No open positions</div>
                  <p className="text-[#4a7c5d] dark:text-gray-400">Check back soon — we're always growing!</p>
                </div>
              ) : (
                <>
                  {featured.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-black text-[#0a2617] dark:text-white uppercase tracking-wider">Featured Roles</span>
                      </div>
                      <div className="grid gap-4">
                        {featured.map((job, i) => <JobCard key={job._id} job={job} index={i} featured onClick={() => setSelected(job)} />)}
                      </div>
                    </div>
                  )}
                  {regular.length > 0 && (
                    <div>
                      {featured.length > 0 && <div className="text-sm font-black text-[#0a2617] dark:text-white uppercase tracking-wider mb-4">All Openings</div>}
                      <div className="grid gap-4">
                        {regular.map((job, i) => <JobCard key={job._id} job={job} index={i} onClick={() => setSelected(job)} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function JobCard({ job, index, featured, onClick }: { job: any; index: number; featured?: boolean; onClick: () => void }) {
  const color = getColor(job.department);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      onClick={onClick} whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(13,93,58,0.12)' }}
      className={`cursor-pointer bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl border-2 p-5 sm:p-6 transition-all ${featured ? 'border-amber-300 dark:border-amber-500/40' : 'border-[#0d5d3a] dark:border-[#10b981] hover:border-[#0d5d3a]/70'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {job.department && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white" style={{ background: color }}>{job.department}</span>
            )}
            {featured && <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"> Featured</span>}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
              {job.status === 'active' ? 'Open' : 'Closed'}
            </span>
          </div>
          <h3 className="text-lg font-black text-[#0d5d3a] dark:text-[#10b981] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{job.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-[#4a7c5d] dark:text-gray-400 font-semibold mb-3">
            {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
            {job.employmentType && <span className="flex items-center gap-1"><Briefcase size={11} />{job.employmentType}</span>}
            {job.experience && <span className="flex items-center gap-1"><Clock size={11} />{job.experience}</span>}
          </div>
          {job.shortDescription && <p className="text-sm text-[#4a7c5d] dark:text-gray-400 leading-relaxed line-clamp-2">{job.shortDescription}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {(job.skills || []).slice(0, 4).map((s: string) => (
              <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981]">{s}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981]">
          <ChevronRight size={18} />
        </div>
      </div>
    </motion.div>
  );
}

function JobDetail({ job, onBack, applying, setApplying }: { job: any; onBack: () => void; applying: boolean; setApplying: (v: boolean) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', portfolioUrl: '', coverLetter: '' });
  const [resumeB64, setResumeB64] = useState('');
  const [resumeMime, setResumeMime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setResumeB64(String(reader.result).split(',')[1]); setResumeMime(f.type); };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSubmitting(true);
    try {
      await apiFetch(`/jobs/${job._id}/apply`, { method: 'POST', body: JSON.stringify({ ...form, resumeBase64: resumeB64, resumeMime }) });
      setDone(true);
    } catch (e: any) { setErr(e.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const color = getColor(job.department);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:opacity-75 transition mb-6">
        <ArrowLeft size={16} /> All Positions
      </button>

      {/* Job Header */}
      <div className="rounded-3xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-end pr-8 leading-none"></div>
        <div className="relative z-10">
          {job.department && <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{job.department}</span>}
          <h1 className="text-2xl sm:text-3xl font-black mt-3 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-white/90">
            {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
            {job.employmentType && <span className="flex items-center gap-1"><Briefcase size={13} />{job.employmentType}</span>}
            {job.experience && <span className="flex items-center gap-1"><Clock size={13} />{job.experience}</span>}
            {job.salary && <span> {job.salary}</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {job.shortDescription && (
            <Section title="About this Role"><p className="text-[#4a7c5d] dark:text-gray-400 leading-relaxed text-sm">{job.shortDescription}</p></Section>
          )}
          {job.description && (
            <Section title="Full Description"><p className="text-[#4a7c5d] dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line">{job.description}</p></Section>
          )}
          {(job.responsibilities || []).length > 0 && (
            <Section title="Responsibilities"><ul className="space-y-2">{job.responsibilities.map((r: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm text-[#4a7c5d] dark:text-gray-400"><span className="text-[#0d5d3a] dark:text-[#10b981] mt-0.5">•</span>{r}</li>)}</ul></Section>
          )}
          {(job.requirements || []).length > 0 && (
            <Section title="Requirements"><ul className="space-y-2">{job.requirements.map((r: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm text-[#4a7c5d] dark:text-gray-400"><span className="text-[#0d5d3a] dark:text-[#10b981] mt-0.5">•</span>{r}</li>)}</ul></Section>
          )}
          {(job.benefits || []).length > 0 && (
            <Section title="Benefits"><ul className="space-y-2">{job.benefits.map((b: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm text-[#4a7c5d] dark:text-gray-400"><span className="text-green-500 mt-0.5"></span>{b}</li>)}</ul></Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skills */}
          {(job.skills || []).length > 0 && (
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 border border-[#0d5d3a]/10 dark:border-white/10">
              <h4 className="font-black text-[#0a2617] dark:text-white text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Skills Required</h4>
              <div className="flex flex-wrap gap-2">{job.skills.map((s: string) => <span key={s} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981]">{s}</span>)}</div>
            </div>
          )}

          {/* Apply box */}
          {job.applyUrl ? (
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white shadow-lg text-base transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              Apply Now <ChevronRight size={16} />
            </a>
          ) : (
            <button onClick={() => setApplying(!applying)}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg text-base transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              {applying ? 'Hide Application' : 'Apply Now'}
            </button>
          )}

          {/* Internal Apply Form */}
          {applying && !job.applyUrl && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#111111] rounded-2xl p-5 border border-[#0d5d3a]/15 dark:border-white/10">
              {done ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-[#0d5d3a] dark:text-[#10b981] mx-auto mb-3" />
                  <p className="font-black text-[#0a2617] dark:text-white text-base mb-1">Application Submitted!</p>
                  <p className="text-xs text-[#4a7c5d] dark:text-gray-400">We'll review your application and get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h4 className="font-black text-[#0a2617] dark:text-white text-sm mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Your Application</h4>
                  {err && <div className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">{err}</div>}
                  {[['Full Name*', 'name', 'text'], ['Email*', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Portfolio / LinkedIn', 'portfolioUrl', 'url']].map(([label, key, type]) => (
                    <label key={key} className="block">
                      <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">{label}</span>
                      <input type={type} required={label.includes('*')} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-[#f8fdf9] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30" />
                    </label>
                  ))}
                  <label className="block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Cover Letter</span>
                    <textarea rows={3} value={form.coverLetter} onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-[#f8fdf9] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 resize-none" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Resume (PDF/Doc)</span>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#0d5d3a]/30 dark:border-white/20 cursor-pointer hover:border-[#0d5d3a] transition">
                      <Upload size={14} className="text-[#0d5d3a] dark:text-[#10b981]" />
                      <span className="text-xs text-[#4a7c5d] dark:text-gray-400">{resumeB64 ? 'File attached ' : 'Upload resume'}</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResume} className="hidden" />
                    </div>
                  </label>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                    <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl p-5 sm:p-6 border border-[#0d5d3a]/10 dark:border-white/10">
      <h3 className="font-black text-[#0a2617] dark:text-white text-base mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
      {children}
    </div>
  );
}
