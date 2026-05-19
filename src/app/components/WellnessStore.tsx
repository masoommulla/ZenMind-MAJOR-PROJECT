import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Download, Lock, CheckCircle, Search, Filter,
  Tag, FileText, Sparkles, RefreshCw, X, IndianRupee, Package
} from 'lucide-react';
import { apiFetch } from '../api/client';

type StoreAsset = {
  _id: string;
  title: string;
  description: string;
  fileMime: string;
  fileName: string;
  price: number;
  category: string;
  downloads: number;
  hasFile: boolean;
  owned: boolean;
  createdAt: string;
};

type Tab = 'all' | 'mine';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Anxiety:     { bg: 'bg-violet-100 dark:bg-violet-500/20',  text: 'text-violet-700 dark:text-violet-300',  border: 'border-violet-200 dark:border-violet-500/30' },
  Sleep:       { bg: 'bg-indigo-100 dark:bg-indigo-500/20',  text: 'text-indigo-700 dark:text-indigo-300',  border: 'border-indigo-200 dark:border-indigo-500/30' },
  Mindfulness: { bg: 'bg-teal-100 dark:bg-teal-500/20',      text: 'text-teal-700 dark:text-teal-300',      border: 'border-teal-200 dark:border-teal-500/30' },
  'Self-Esteem': { bg: 'bg-pink-100 dark:bg-pink-500/20',    text: 'text-pink-700 dark:text-pink-300',      border: 'border-pink-200 dark:border-pink-500/30' },
  Stress:      { bg: 'bg-orange-100 dark:bg-orange-500/20',  text: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-500/30' },
  Wellness:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' },
};

const getCategoryStyle = (cat: string) =>
  CATEGORY_COLORS[cat] ?? { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-500/30' };

// ── decorative gradient backgrounds per category ──
const CARD_GRADIENTS: Record<string, string> = {
  Anxiety:     'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10',
  Sleep:       'from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10',
  Mindfulness: 'from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10',
  'Self-Esteem': 'from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10',
  Stress:      'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10',
  Wellness:    'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
};

const getCardGradient = (cat: string) =>
  CARD_GRADIENTS[cat] ?? 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10';

export default function WellnessStore() {
  const [assets, setAssets]         = useState<StoreAsset[]>([]);
  const [myAssets, setMyAssets]     = useState<StoreAsset[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>('all');
  const [search, setSearch]         = useState('');
  const [categoryFilter, setCat]    = useState('All');
  const [downloading, setDL]        = useState<string | null>(null);
  const [paying, setPaying]         = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storeRes, dlRes] = await Promise.all([
        apiFetch<{ assets: StoreAsset[] }>('/store'),
        apiFetch<{ assets: StoreAsset[] }>('/store/my-downloads'),
      ]);
      setAssets(storeRes.assets);
      setMyAssets(dlRes.assets);
    } catch (e: any) {
      showToast(e.message || 'Failed to load store', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (asset: StoreAsset) => {
    if (downloading) return;
    setDL(asset._id);
    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1] ?? '';
      const res = await fetch(`/api/store/${asset._id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(err.error);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = asset.fileName || `${asset.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Refresh to reflect updated owned state
      load();
      showToast(`"${asset.title}" downloaded!`);
    } catch (e: any) {
      showToast(e.message || 'Download failed', false);
    } finally {
      setDL(null);
    }
  };

  const handleRazorpayPurchase = async (asset: StoreAsset) => {
    if (paying) return;
    setPaying(asset._id);
    try {
      const orderRes = await apiFetch<any>(`/store/${asset._id}/purchase`, { method: 'POST', body: '{}' });

      if (!(window as any).Razorpay) {
        // Lazy-load Razorpay SDK if not already present
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay({
        key:         orderRes.keyId,
        amount:      orderRes.order.amount,
        currency:    orderRes.order.currency,
        order_id:    orderRes.order.id,
        name:        'ZenMind Wellness Store',
        description: asset.title,
        theme:       { color: '#0d5d3a' },
        handler: async (response: any) => {
          try {
            await apiFetch(`/store/${asset._id}/verify`, {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            showToast(`"${asset.title}" unlocked!`);
            load();
          } catch (e: any) {
            showToast(e.message || 'Payment verification failed', false);
          } finally {
            setPaying(null);
          }
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rzp.open();
    } catch (e: any) {
      showToast(e.message || 'Payment failed', false);
      setPaying(null);
    }
  };

  // Derive category list from all assets
  const categories = ['All', ...Array.from(new Set(assets.map(a => a.category)))];

  const displayed = (tab === 'mine' ? myAssets : assets).filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    const matchCat    = categoryFilter === 'All' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.ok
                ? 'bg-[#0d5d3a] text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center shadow-lg shadow-[#0d5d3a]/20">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Wellness Store
            </h2>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 font-medium">
              Downloadable resources to support your mental wellness journey
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#f0fbf4] dark:bg-white/5 p-1 rounded-2xl w-fit mb-4 border border-[#0d5d3a]/10 dark:border-white/10">
          {([['all', 'All Items', ShoppingBag], ['mine', 'My Downloads', Download]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === key
                  ? 'bg-[#0d5d3a] text-white shadow-md'
                  : 'text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {key === 'mine' && myAssets.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === 'mine' ? 'bg-white/20' : 'bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981]'}`}>
                  {myAssets.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Category filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a7c5d] dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search resources…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/40 text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a7c5d] dark:text-gray-400" />
            <select
              value={categoryFilter}
              onChange={e => setCat(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white cursor-pointer appearance-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-[#4a7c5d] font-bold">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading store…
          </div>
        ) : displayed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-48 gap-3"
          >
            <Package className="w-10 h-10 text-[#4a7c5d]/40" />
            <p className="text-[#4a7c5d] dark:text-gray-400 font-semibold text-sm">
              {tab === 'mine' ? 'No downloads yet. Grab a free resource below!' : 'No items match your search.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayed.map((asset, idx) => (
                <StoreCard
                  key={asset._id}
                  asset={asset}
                  index={idx}
                  downloading={downloading === asset._id}
                  paying={paying === asset._id}
                  onDownload={() => handleDownload(asset)}
                  onPurchase={() => handleRazorpayPurchase(asset)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Individual Store Card ── */
function StoreCard({
  asset, index, downloading, paying, onDownload, onPurchase
}: {
  asset: StoreAsset;
  index: number;
  downloading: boolean;
  paying: boolean;
  onDownload: () => void;
  onPurchase: () => void;
}) {
  const catStyle = getCategoryStyle(asset.category);
  const gradient = getCardGradient(asset.category);
  const isFree   = asset.price === 0;
  const isOwned  = asset.owned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={`group relative flex flex-col rounded-3xl border bg-gradient-to-br ${gradient} overflow-hidden
        border-[#0d5d3a]/10 dark:border-white/8 hover:border-[#0d5d3a]/30 dark:hover:border-white/15
        shadow-sm hover:shadow-md transition-all duration-300`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0d5d3a] to-[#10b981] opacity-60" />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Category + Price */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {asset.category}
          </span>
          {isFree ? (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/20">
              Free
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs font-black text-[#0a2617] dark:text-white bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 px-2.5 py-1 rounded-full shadow-sm">
              <IndianRupee className="w-3 h-3" />{asset.price}
            </span>
          )}
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/8 flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-[#0d5d3a] dark:text-[#10b981]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-[#0a2617] dark:text-white leading-snug" style={{ fontFamily: 'Syne, sans-serif' }}>
              {asset.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
          {asset.description}
        </p>

        {/* Download count */}
        {asset.downloads > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-[#4a7c5d] dark:text-gray-500 font-semibold">
            <Download className="w-3 h-3" />
            {asset.downloads} download{asset.downloads !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        {isOwned ? (
          <button
            onClick={onDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#0d5d3a] hover:bg-[#0a4a2e] text-white text-sm font-bold transition-all shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60"
          >
            {downloading
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Downloading…</>
              : <><Download className="w-3.5 h-3.5" /> Download</>}
          </button>
        ) : isFree ? (
          <button
            onClick={onDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] hover:from-[#0a4a2e] text-white text-sm font-bold transition-all shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60"
          >
            {downloading
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Downloading…</>
              : <><Download className="w-3.5 h-3.5" /> Download Free</>}
          </button>
        ) : (
          <button
            onClick={onPurchase}
            disabled={paying}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60"
          >
            {paying
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing…</>
              : <><Lock className="w-3.5 h-3.5" /> Unlock for ₹{asset.price}</>}
          </button>
        )}
      </div>

      {/* Owned badge */}
      {isOwned && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-[#0d5d3a] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-md">
            <CheckCircle className="w-2.5 h-2.5" /> Owned
          </div>
        </div>
      )}
    </motion.div>
  );
}
