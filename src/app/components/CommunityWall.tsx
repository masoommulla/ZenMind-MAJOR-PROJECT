import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, X, ChevronDown, Loader2, Send, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/client';

type Story = {
  _id: string;
  story: string;
  author: string;
  category: string;
  likes: number;
  isAnonymous: boolean;
  createdAt: string;
  liked?: boolean; // client-side toggle state
};

const CATEGORIES = [
  { key: 'all',           label: 'All Stories',   emoji: '💫' },
  { key: 'anxiety',       label: 'Anxiety',       emoji: '😰' },
  { key: 'depression',    label: 'Depression',    emoji: '💙' },
  { key: 'stress',        label: 'Stress',        emoji: '😤' },
  { key: 'exam_pressure', label: 'Exam Pressure', emoji: '📚' },
  { key: 'bullying',      label: 'Bullying',      emoji: '🛡️' },
  { key: 'loneliness',    label: 'Loneliness',    emoji: '🌙' },
  { key: 'family_issues', label: 'Family',        emoji: '🏠' },
  { key: 'self_esteem',   label: 'Self-Esteem',   emoji: '💪' },
  { key: 'trauma',        label: 'Trauma',        emoji: '🌿' },
];

const CATEGORY_GRADIENT: Record<string, string> = {
  anxiety:       'from-amber-500/10 to-amber-600/05',
  depression:    'from-blue-500/10 to-blue-600/05',
  stress:        'from-orange-500/10 to-orange-600/05',
  exam_pressure: 'from-violet-500/10 to-violet-600/05',
  bullying:      'from-red-500/10 to-red-600/05',
  loneliness:    'from-sky-500/10 to-sky-600/05',
  family_issues: 'from-rose-500/10 to-rose-600/05',
  self_esteem:   'from-pink-500/10 to-pink-600/05',
  trauma:        'from-gray-500/10 to-gray-600/05',
  other:         'from-[#0d5d3a]/10 to-[#10b981]/05',
};

function StoryCard({ story, onLike }: { story: Story; onLike: (id: string) => void }) {
  const cat = CATEGORIES.find(c => c.key === story.category);
  const grad = CATEGORY_GRADIENT[story.category] || CATEGORY_GRADIENT.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08 bg-gradient-to-br ${grad} bg-white dark:bg-[#111111] p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Category badge */}
      {cat && cat.key !== 'all' && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-[#0d5d3a]/08 dark:border-white/10 text-xs font-semibold text-[#0d5d3a] dark:text-[#10b981] mb-3">
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </div>
      )}

      {/* Story text */}
      <p className="text-sm text-[#0a2617] dark:text-gray-200 leading-relaxed mb-4">
        "{story.story}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-500">
          — {story.isAnonymous ? 'Anonymous' : story.author}
        </div>
        <button
          onClick={() => onLike(story._id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            story.liked
              ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
              : 'bg-white dark:bg-white/10 text-[#4a7c5d] dark:text-gray-400 border border-[#0d5d3a]/08 dark:border-white/10 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${story.liked ? 'fill-white' : ''}`} />
          {story.likes}
        </button>
      </div>
    </motion.div>
  );
}

function SubmitModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [text, setText]         = useState('');
  const [category, setCategory] = useState('other');
  const [anon, setAnon]         = useState(false);
  const [busy, setBusy]         = useState(false);
  const [done, setDone]         = useState(false);
  const [err, setErr]           = useState('');

  const submit = async () => {
    if (text.trim().length < 30) { setErr('Please write at least 30 characters.'); return; }
    setBusy(true); setErr('');
    try {
      await apiFetch('/community-stories', {
        method: 'POST',
        body: JSON.stringify({ story: text.trim(), category, isAnonymous: anon }),
      });
      setDone(true);
      setTimeout(() => { onClose(); onSubmitted(); }, 2400);
    } catch (e: any) { setErr(e.message || 'Failed to submit'); }
    finally { setBusy(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-lg bg-white dark:bg-[#111111] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Share Your Story</div>
          <div className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>
            Your story could help someone else
          </div>
          <div className="text-sm text-white/70 mt-1">
            Stories go live after admin review. You remain safe and private. 💚
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-12 text-center px-6">
            <div className="text-5xl mb-4">🌿</div>
            <div className="text-lg font-bold text-[#0d5d3a] dark:text-[#10b981]">Thank you for sharing!</div>
            <div className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">
              Your story is under review and will appear once approved.
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Category picker */}
            <div>
              <label className="text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.key !== 'all').map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      category === c.key
                        ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]'
                        : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/12 dark:border-white/10 hover:border-[#0d5d3a]/40'
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Story text */}
            <div>
              <label className="text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-2 block">
                Your story ({text.length}/600)
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={600}
                rows={5}
                placeholder="Share what you went through and how you found your way... (min. 30 characters)"
                className="w-full bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/40 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0d5d3a]" />
                  <span className="text-xs text-[#4a7c5d] dark:text-gray-400">Post anonymously</span>
                </label>
                <span className={`text-[10px] font-semibold ${text.length < 30 ? 'text-red-400' : 'text-[#10b981]'}`}>
                  {text.length < 30 ? `${30 - text.length} more chars needed` : '✓ Ready'}
                </span>
              </div>
            </div>

            {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">{err}</div>}

            <button
              onClick={submit}
              disabled={busy || text.trim().length < 30}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white font-bold text-sm shadow-lg disabled:opacity-40 hover:from-[#0a4a2e] transition flex items-center justify-center gap-2"
            >
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit for Review</>}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CommunityWall() {
  const [stories, setStories]   = useState<Story[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const fetchStories = useCallback(async (cat: string, p: number, replace = false) => {
    setLoading(true);
    try {
      const qs = cat !== 'all' ? `&category=${cat}` : '';
      const data = await apiFetch<{ stories: Story[]; pages: number }>(`/community-stories?page=${p}&limit=9${qs}`);
      setStories(prev => replace ? data.stories : [...prev, ...data.stories]);
      setHasMore(p < data.pages);
      setPage(p);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStories(category, 1, true); }, [category, fetchStories]);

  const handleLike = async (id: string) => {
    try {
      const res = await apiFetch<{ likes: number; liked: boolean }>(`/community-stories/${id}/like`, { method: 'PATCH' });
      setStories(prev => prev.map(s =>
        s._id === id ? { ...s, likes: res.likes, liked: res.liked } : s
      ));
    } catch { /* silent */ }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#0a2617] dark:text-white flex items-center gap-2" style={{ fontFamily: 'Syne,sans-serif' }}>
            <Sparkles className="w-6 h-6 text-[#10b981]" /> Community Stories
          </h2>
          <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-0.5">
            Real stories from real teens — you are not alone 💚
          </p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white text-sm font-bold shadow-lg hover:from-[#0a4a2e] transition"
        >
          <Share2 className="w-4 h-4" /> Share My Story
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold border transition-all ${
              category === c.key
                ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md'
                : 'bg-white dark:bg-[#111111] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/10 dark:border-white/08 hover:border-[#0d5d3a]/40 hover:bg-[#f0fbf4] dark:hover:bg-white/5'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Stories grid */}
      {loading && stories.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#0d5d3a] animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4">🌿</div>
          <div className="text-lg font-bold text-[#0a2617] dark:text-white mb-1">No stories yet in this category</div>
          <div className="text-sm text-[#4a7c5d] dark:text-gray-400">Be the first to share yours!</div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stories.map(s => (
            <StoryCard key={s._id} story={s} onLike={handleLike} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchStories(category, page + 1)}
            disabled={loading}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-[#10b981] text-sm font-semibold hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            Load more stories
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSubmit && (
          <SubmitModal
            onClose={() => setShowSubmit(false)}
            onSubmitted={() => fetchStories(category, 1, true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
