import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Bookmark, BookmarkCheck, Search, X, ExternalLink, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';

const CATEGORIES = ['all','general','anxiety','depression','trauma','relationships','teen','stress','sleep','self-esteem','mindfulness'];
const TYPE_EMOJI: Record<string,string> = { book:'📖', article:'📄', video:'🎬', podcast:'🎧', tool:'🛠️' };

export default function ReadingListsUser() {
  const [lists, setLists]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState('all');
  const [search, setSearch]     = useState('');
  const [detail, setDetail]     = useState<any|null>(null);
  const [tab, setTab]           = useState<'browse'|'saved'>('browse');

  const load = async (saved=false) => {
    setLoading(true);
    try {
      const url = saved ? '/reading-lists/user/saved' : `/reading-lists?category=${cat}&search=${encodeURIComponent(search)}`;
      const r = await apiFetch<any>(url);
      setLists(r.lists || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab==='saved'); }, [cat, tab]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(false); };

  const toggleSave = async (id: string) => {
    try {
      const r = await apiFetch<any>(`/reading-lists/${id}/save`, { method: 'POST' });
      setLists(p => p.map(l => l._id===id ? { ...l, isSaved: r.isSaved, saveCount: r.saveCount } : l));
      if (detail?._id===id) setDetail((d:any) => ({ ...d, isSaved: r.isSaved }));
      if (tab==='saved' && !r.isSaved) setLists(p => p.filter(l => l._id!==id));
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>📚 Therapist Reading Lists</h2>
          <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-0.5">Curated books, articles & resources by our therapists</p>
        </div>
        <div className="flex gap-2">
          {(['browse','saved'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab===t ? 'bg-[#0d5d3a] text-white' : 'bg-[#0d5d3a]/8 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#0d5d3a]/15'}`}>
              {t==='browse' ? '🔍 Browse' : '🔖 Saved'}
            </button>
          ))}
        </div>
      </div>

      {tab==='browse' && (
        <>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lists, therapists, topics…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>
            </div>
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#0d5d3a] text-white text-sm font-bold hover:bg-[#0a4a2e] transition">Search</button>
          </form>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition border ${cat===c ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'border-[#0d5d3a]/20 text-[#4a7c5d] dark:text-gray-400 hover:border-[#0d5d3a]/50'}`}>
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#4a7c5d] font-bold">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">
          <div className="text-5xl mb-3">📚</div>
          <div className="font-bold text-[#0a2617] dark:text-white">{tab==='saved' ? 'No saved lists yet' : 'No lists found'}</div>
          <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">{tab==='saved' ? 'Browse and save lists you love.' : 'Try a different category or search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {lists.map(list => (
            <motion.div key={list._id} whileHover={{y:-3}} transition={{duration:0.2}}
              className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 p-5 flex flex-col gap-3 shadow-sm cursor-pointer"
              onClick={() => setDetail(list)}>
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                  {list.coverEmoji || '📚'}
                </div>
                <button onClick={e => { e.stopPropagation(); toggleSave(list._id); }}
                  className={`p-2 rounded-xl transition ${list.isSaved ? 'text-[#0d5d3a] bg-[#e6f4ea] dark:bg-[#0d5d3a]/20' : 'text-gray-400 hover:text-[#0d5d3a] hover:bg-[#e6f4ea]'}`}>
                  {list.isSaved ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
                </button>
              </div>
              <div>
                <h3 className="font-black text-[#0a2617] dark:text-white text-sm leading-snug">{list.title}</h3>
                <p className="text-[11px] text-[#10b981] font-semibold mt-0.5">by {list.therapistName}</p>
              </div>
              {list.description && <p className="text-xs text-[#4a7c5d] dark:text-gray-400 line-clamp-2">{list.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-1">
                <div className="flex gap-1 flex-wrap">
                  {(list.tags||[]).slice(0,2).map((t:string) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-[#e6f4ea] dark:bg-[#0d5d3a]/15 text-[#0d5d3a] dark:text-[#10b981] text-[10px] font-bold">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <BookOpen size={10}/> {list.items?.length || 0} items · {list.saveCount || 0} saves
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetail(null)}>
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}}
              onClick={e=>e.stopPropagation()}
              className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-3xl shadow-md shrink-0">{detail.coverEmoji||'📚'}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-[#0a2617] dark:text-white text-lg leading-tight" style={{fontFamily:'Syne,sans-serif'}}>{detail.title}</h2>
                    <p className="text-sm text-[#10b981] font-semibold">by {detail.therapistName}</p>
                    {detail.description && <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">{detail.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => toggleSave(detail._id)}
                      className={`p-2.5 rounded-xl transition ${detail.isSaved ? 'bg-[#0d5d3a] text-white' : 'border border-[#0d5d3a]/20 text-[#0d5d3a] hover:bg-[#e6f4ea]'}`}>
                      {detail.isSaved ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
                    </button>
                    <button onClick={()=>setDetail(null)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500"><X size={18}/></button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {(detail.tags||[]).map((t:string) => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-[11px] font-bold">{t}</span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 text-[11px] font-semibold capitalize">{detail.category}</span>
                </div>
              </div>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <p className="text-xs font-bold text-[#4a7c5d] uppercase tracking-widest">{detail.items?.length || 0} Resources in this list</p>
                {(detail.items||[]).map((item:any, i:number) => (
                  <div key={item._id||i} className="flex gap-3 p-4 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/8 dark:border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 flex items-center justify-center text-xl shrink-0">{TYPE_EMOJI[item.type]||'📖'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0a2617] dark:text-white">{item.title}</div>
                      {item.author && <div className="text-[11px] text-[#4a7c5d] dark:text-gray-400 font-medium">{item.author}</div>}
                      {item.description && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-relaxed">{item.description}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0d5d3a] dark:text-[#10b981] hover:underline">
                          <ExternalLink size={11}/> Open link
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 capitalize shrink-0">{item.type}</span>
                  </div>
                ))}
                {(!detail.items||detail.items.length===0) && (
                  <div className="text-center py-10 text-gray-400">No items in this list yet.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
