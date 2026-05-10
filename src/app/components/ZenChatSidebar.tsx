import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquarePlus, Trash2, ChevronLeft, ChevronRight,
  MessageCircle, Clock, Tag, Search, X
} from 'lucide-react';
import { apiFetch } from '../api/client';

type ZenSession = {
  _id: string;
  title: string;
  category: string;
  messageCount: number;
  moodScore: number | null;
  createdAt: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  anxiety:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  depression:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  stress:        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exam_pressure: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  bullying:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  loneliness:    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  family_issues: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  self_esteem:   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  trauma:        'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  other:         'bg-[#e8f5ee] text-[#0d5d3a] dark:bg-[#0d5d3a]/20 dark:text-[#10b981]',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

type Props = {
  open: boolean;
  onToggle: () => void;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number; // increment this from parent to force a refresh
};

export default function ZenChatSidebar({
  open, onToggle, currentSessionId, onSelectSession, onNewChat, refreshTrigger = 0
}: Props) {
  const [sessions, setSessions]   = useState<ZenSession[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { sessions: s } = await apiFetch<{ sessions: ZenSession[] }>('/zen-sessions');
      setSessions(s || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm !== id) { setDeleteConfirm(id); return; }
    try {
      await apiFetch(`/zen-sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s._id !== id));
      if (currentSessionId === id) onNewChat();
    } catch { /* silent */ }
    setDeleteConfirm(null);
  };

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const groups: { label: string; items: ZenSession[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const todayItems     = filtered.filter(s => new Date(s.createdAt).toDateString() === today);
  const yestItems      = filtered.filter(s => new Date(s.createdAt).toDateString() === yesterday);
  const olderItems     = filtered.filter(s => {
    const d = new Date(s.createdAt).toDateString();
    return d !== today && d !== yesterday;
  });
  if (todayItems.length)     groups.push({ label: 'Today',     items: todayItems });
  if (yestItems.length)      groups.push({ label: 'Yesterday', items: yestItems });
  if (olderItems.length)     groups.push({ label: 'Earlier',   items: olderItems });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.div
        initial={false}
        animate={{ width: open ? 260 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex-shrink-0 h-full overflow-hidden z-40"
        style={{ minWidth: 0 }}
      >
        <div className="h-full w-[260px] flex flex-col bg-white dark:bg-[#0e0e0e] border-r border-[#0d5d3a]/10 dark:border-white/08">

          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-[#0d5d3a]/08 dark:border-white/08 flex-shrink-0">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white text-sm font-bold hover:from-[#0a4a2e] transition shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4" />
              New Chat
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#0d5d3a]/12 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="flex items-center gap-2 bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/08 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-[#4a7c5d] dark:text-gray-500 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-xs text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-3 h-3 text-[#4a7c5d]" />
                </button>
              )}
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {loading && sessions.length === 0 && (
              <div className="text-center text-xs text-[#4a7c5d]/60 mt-8">Loading...</div>
            )}
            {!loading && sessions.length === 0 && (
              <div className="text-center px-4 mt-10">
                <MessageCircle className="w-8 h-8 text-[#0d5d3a]/20 dark:text-white/10 mx-auto mb-2" />
                <div className="text-xs text-[#4a7c5d]/60 dark:text-gray-600">No chats yet.<br/>Start a conversation with Zeni!</div>
              </div>
            )}
            {groups.map(group => (
              <div key={group.label}>
                <div className="text-[10px] font-bold text-[#4a7c5d]/60 dark:text-gray-600 uppercase tracking-widest px-2 py-1.5 mt-2">
                  {group.label}
                </div>
                {group.items.map(session => (
                  <motion.button
                    key={session._id}
                    onClick={() => onSelectSession(session._id)}
                    layout
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 group transition-all relative ${
                      currentSessionId === session._id
                        ? 'bg-[#0d5d3a] text-white'
                        : 'hover:bg-[#f3fbf6] dark:hover:bg-white/5 text-[#0a2617] dark:text-gray-200'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate pr-6 leading-snug">
                      {session.title}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 ${currentSessionId === session._id ? 'text-white/70' : 'text-[#4a7c5d] dark:text-gray-500'}`}>
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{timeAgo(session.createdAt)}</span>
                      {session.category && session.category !== 'other' && (
                        <>
                          <span className="text-[10px]">·</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            currentSessionId === session._id
                              ? 'bg-white/20 text-white'
                              : CATEGORY_COLORS[session.category] || CATEGORY_COLORS.other
                          }`}>
                            {session.category.replace('_', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={e => handleDelete(session._id, e)}
                      className={`absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg transition ${
                        deleteConfirm === session._id
                          ? 'bg-red-500 text-white opacity-100'
                          : currentSessionId === session._id
                            ? 'bg-white/20 text-white'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                      }`}
                      title={deleteConfirm === session._id ? 'Click again to confirm' : 'Delete chat'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer stats */}
          {sessions.length > 0 && (
            <div className="border-t border-[#0d5d3a]/08 dark:border-white/08 px-3 py-2 flex-shrink-0">
              <div className="text-[10px] text-[#4a7c5d]/60 dark:text-gray-600">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} saved
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Collapsed toggle button (when sidebar is closed) */}
      {!open && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={onToggle}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-14 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 border-l-0 rounded-r-xl flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] shadow-md hover:bg-[#f0fbf4] dark:hover:bg-[#222222] transition"
          title="Show chat history"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </>
  );
}
