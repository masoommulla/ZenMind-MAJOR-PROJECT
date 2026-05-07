import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, Clock, X, ChevronRight } from 'lucide-react';
import LogoLoop from './LogoLoop';

import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const StoryCard = ({ item }: { item: any }) => (
  <article className="w-[280px] sm:w-[320px] h-[240px] sm:h-[250px] bg-gradient-to-br from-white to-[#f8fdf9] dark:from-[#111111] dark:to-[#1a1a1a] rounded-2xl p-5 sm:p-6 shadow-md border border-[#0d5d3a]/15 dark:border-white/10 ring-1 ring-inset ring-[#0d5d3a]/10 dark:ring-white/5 flex flex-col shrink-0 text-left">
    <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-[#0d5d3a] dark:text-[#10b981] opacity-20 mb-3 sm:mb-4 flex-shrink-0" />
    <p
      className="text-[#0a2617] dark:text-gray-100 text-sm sm:text-[15px] leading-relaxed mb-3 sm:mb-4 flex-1 overflow-hidden"
      style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
    >
      "{item.story}"
    </p>
    <div className="mt-auto">
      <div className="flex items-center justify-between pt-3 border-t border-[#0d5d3a]/10 dark:border-white/10 mb-2">
        <span className="text-[#4a7c5d] dark:text-gray-400 font-bold text-xs sm:text-sm">{item.author}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < (item.rating ?? 5) ? 'fill-[#0d5d3a] dark:fill-[#10b981] text-[#0d5d3a] dark:text-[#10b981]' : 'fill-transparent text-[#0d5d3a]/30 dark:text-white/20'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#0d5d3a]/60 dark:text-gray-500 font-semibold uppercase tracking-wider">
        <Clock size={12} />
        {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
      </div>
    </div>
  </article>
);

const ViewAllStoriesModal = ({ stories, onClose }: { stories: any[]; onClose: () => void }) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'recent' | 'old'>('all');
  
  const filtered = stories.filter(s => {
    if (filter === 'all') return true;
    const date = new Date(s.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (filter === 'today') return diffDays < 1;
    if (filter === 'recent') return diffDays >= 1 && diffDays <= 7;
    if (filter === 'old') return diffDays > 7;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <header className="flex items-center justify-between p-4 sm:p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm relative z-10">
        <h2 className="text-2xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>All Stories of Hope</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
          <X size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      </header>
      
      <div className="p-4 sm:p-6 flex gap-2 sm:gap-3 overflow-x-auto border-b border-[#0d5d3a]/5 dark:border-white/5 bg-[#fbfdfb] dark:bg-[#0a0a0a]">
        <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'all' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>All Stories</button>
        <button onClick={() => setFilter('today')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'today' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Today</button>
        <button onClick={() => setFilter('recent')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'recent' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Recent (7 Days)</button>
        <button onClick={() => setFilter('old')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'old' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Old</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto justify-items-center pb-20">
          {filtered.map(s => <div key={s._id} className="w-full max-w-[320px]"><StoryCard item={s} /></div>)}
          {filtered.length === 0 && <p className="col-span-full text-[#4a7c5d] dark:text-gray-500 font-bold py-16 text-lg">No stories match this filter.</p>}
        </div>
      </div>
    </div>
  );
};

const AddStoryForm = ({ onAdd }: { onAdd: (s: any) => void }) => {
  const [form, setForm] = useState({ author: '', story: '', rating: 5 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const res = await apiFetch<any>('/public/stories', { method: 'POST', body: JSON.stringify(form) });
      onAdd(res.story);
      setForm({ author: '', story: '', rating: 5 });
      setMsg('Thank you for sharing your story!');
      setTimeout(() => setMsg(''), 5000);
    } catch(err: any) {
      setMsg(err.message || 'Failed to submit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-20 max-w-2xl mx-auto bg-gradient-to-br from-white to-[#f8fdf9] dark:from-[#111111] dark:to-[#1a1a1a] rounded-[2rem] p-6 sm:p-10 border border-[#0d5d3a]/15 dark:border-white/10 shadow-xl shadow-[#0d5d3a]/5 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-10 pointer-events-none"><Quote size={120} /></div>
      <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2617] dark:text-white mb-3 relative z-10" style={{ fontFamily: 'Syne, sans-serif' }}>Share Your Journey</h3>
      <p className="text-[#4a7c5d] dark:text-gray-400 text-sm sm:text-base mb-8 relative z-10 max-w-md">Your story could be the light someone else needs right now. Share your experience with ZenMind.</p>
      
      <div className="space-y-5 relative z-10">
        <div className="flex gap-4 flex-wrap sm:flex-nowrap">
          <label className="flex-1 block">
            <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-2 block">First Name or Initial</span>
            <input required type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="e.g. Alex, 16" className="w-full bg-white dark:bg-[#222222] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-[#0a2617] dark:text-white transition-shadow" />
          </label>
          <label className="w-full sm:w-36 block">
            <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-2 block">Rating</span>
            <select value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})} className="w-full bg-white dark:bg-[#222222] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-[#0a2617] dark:text-white transition-shadow">
              <option value={5}>5 Stars</option><option value={4}>4 Stars</option><option value={3}>3 Stars</option><option value={2}>2 Stars</option><option value={1}>1 Star</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-2 block">Your Story</span>
          <textarea required value={form.story} onChange={e => setForm({...form, story: e.target.value})} placeholder="How has ZenMind helped you?" className="w-full min-h-[120px] resize-y bg-white dark:bg-[#222222] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-[#0a2617] dark:text-white transition-shadow" />
        </label>
        <button type="submit" disabled={busy} className="w-full py-3.5 mt-2 rounded-xl bg-[#0d5d3a] dark:bg-[#10b981] text-white font-black uppercase tracking-widest shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-70 hover:bg-[#0a4a2e] transition-all hover:-translate-y-0.5">
          {busy ? 'Submitting...' : 'Submit Story'}
        </button>
        {msg && <p className="text-center text-sm font-bold mt-4 text-[#0d5d3a] dark:text-[#10b981]">{msg}</p>}
      </div>
    </form>
  );
};

export default function StorySection() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    apiFetch<any[]>('/public/stories')
      .then(res => setStories(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Display recent 24 stories in the landing page loops
  const recent24 = stories.slice(0, 24);
  const half = Math.ceil(recent24.length / 2);
  const topRow = recent24.slice(0, half).map((item, index) => ({
    node: <StoryCard item={item} />,
    title: `story-top-${item._id || index}`,
  }));

  const bottomRow = recent24.slice(half).map((item, index) => ({
    node: <StoryCard item={item} />,
    title: `story-bottom-${item._id || index}`,
  }));

  return (
    <section id="stories" className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] dark:from-[#10b981] dark:to-[#059669] rounded-full blur-[120px] opacity-20 dark:opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-bold">Real Stories</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            Stories of{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
              Hope & Healing
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4 mb-8">
            Hear from adolescents who found their path to wellness through ZenMind.
          </p>
          
          <button 
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#0d5d3a]/20 text-[#0d5d3a] hover:bg-[#0d5d3a] hover:text-white font-bold transition-colors group"
          >
            View All Stories <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {!loading && recent24.length > 0 ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="relative overflow-hidden">
              <LogoLoop logos={topRow} speed={70} direction="left" gap={20} pauseOnHover ariaLabel="Stories row one" />
            </div>
            {bottomRow.length > 0 && (
              <div className="relative overflow-hidden">
                <LogoLoop logos={bottomRow} speed={70} direction="right" gap={20} pauseOnHover ariaLabel="Stories row two" />
              </div>
            )}
          </div>
        ) : !loading ? (
          <p className="text-center text-[#4a7c5d] font-bold py-10">No stories yet. Be the first to share yours!</p>
        ) : (
          <div className="h-[500px] flex items-center justify-center text-[#0d5d3a] font-bold">Loading stories...</div>
        )}

        <AddStoryForm onAdd={(s) => setStories([s, ...stories])} />
      </div>

      <AnimatePresence>
        {showAll && <ViewAllStoriesModal stories={stories} onClose={() => setShowAll(false)} />}
      </AnimatePresence>
    </section>
  );
}
