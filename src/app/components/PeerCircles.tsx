import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Send, ArrowLeft, UserCheck, UserPlus,
  Loader2, Shield, Eye, EyeOff, MessageSquare
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '../api/client';

/* ──────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────── */
interface Circle {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  memberCount: number;
  messageCount: number;
  isJoined: boolean;
  gradientFrom: string;
  gradientTo: string;
}

interface CircleMsg {
  _id: string;
  circleId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  userId?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/* ──────────────────────────────────────────────────────────────
   Circle Card (listing)
──────────────────────────────────────────────────────────────── */
function CircleCard({
  circle, onJoin, onOpen, joining,
}: {
  circle: Circle;
  onJoin: (id: string) => void;
  onOpen: (c: Circle) => void;
  joining: string | null;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#111111] rounded-3xl border border-white/0 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Gradient top strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}
      />

      <div className="p-4">
        {/* Icon + title */}
        <div className="flex items-start gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}
          >
            {circle.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#0a2617] dark:text-gray-100 leading-snug line-clamp-1"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {circle.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3" />{circle.memberCount} members
              </span>
              <span className="text-[10px] text-[#4a7c5d] dark:text-gray-400 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />{circle.messageCount} msgs
              </span>
            </div>
          </div>
          {circle.isJoined && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              <UserCheck className="w-3 h-3" /> Joined
            </span>
          )}
        </div>

        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
          {circle.description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onJoin(circle._id)}
            disabled={joining === circle._id}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              circle.isJoined
                ? 'bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#0d5d3a]/10'
                : 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white hover:bg-[#0a4a2e] shadow-md shadow-[#0d5d3a]/20'
            } disabled:opacity-50`}
          >
            {joining === circle._id
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : circle.isJoined
                ? <><UserCheck className="w-3 h-3" /> Joined</>
                : <><UserPlus className="w-3 h-3" /> Join</>}
          </button>
          <button
            onClick={() => onOpen(circle)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-[#0d5d3a]/15 dark:border-white/10 text-[#0d5d3a] dark:text-gray-300 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
          >
            <MessageSquare className="w-3 h-3" /> Open
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Chat Room View
──────────────────────────────────────────────────────────────── */
function CircleChatRoom({
  circle, currentUserId, onBack,
}: {
  circle: Circle;
  currentUserId: string;
  onBack: () => void;
}) {
  const [messages, setMessages]     = useState<CircleMsg[]>([]);
  const [loading, setLoading]       = useState(true);
  const [text, setText]             = useState('');
  const [isAnon, setIsAnon]         = useState(false);
  const [sending, setSending]       = useState(false);
  const socketRef                   = useRef<Socket | null>(null);
  const bottomRef                   = useRef<HTMLDivElement>(null);

  /* load history */
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>(`/circles/${circle._id}/messages?limit=50`);
      setMessages(res.messages || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [circle._id]);

  /* socket setup */
  useEffect(() => {
    loadMessages();

    const socket = io(BACKEND_URL, { withCredentials: true, transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join-circle', circle._id);

    socket.on('circle-new-message', (msg: CircleMsg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('circle-message-removed', (msgId: string) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    });

    return () => {
      socket.emit('leave-circle', circle._id);
      socket.disconnect();
    };
  }, [circle._id, loadMessages]);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await apiFetch<any>(`/circles/${circle._id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim(), isAnonymous: isAnon }),
      });
      // Emit via socket so all clients get it
      socketRef.current?.emit('circle-message', {
        circleId: circle._id,
        message: res.message,
      });
      setText('');
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const isOwnMsg = (msg: CircleMsg) => msg.userId === currentUserId;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-white/90 dark:bg-[#111111]/90 backdrop-blur">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-[#f0fbf4] dark:hover:bg-white/10 text-[#4a7c5d] dark:text-gray-400 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}
        >
          {circle.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-[#0a2617] dark:text-gray-100 truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            {circle.name}
          </div>
          <div className="text-[10px] text-[#4a7c5d] dark:text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" />{circle.memberCount} members
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 text-[#0d5d3a] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="w-8 h-8 text-[#0d5d3a]/30 mb-2" />
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400">No messages yet. Be the first to share! 💚</p>
          </div>
        ) : (
          messages.map(msg => {
            const own = isOwnMsg(msg);
            return (
              <div key={msg._id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${own ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!own && (
                    <div className="flex items-center gap-1.5 px-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ background: `linear-gradient(135deg, ${circle.gradientFrom}, ${circle.gradientTo})` }}
                      >
                        {msg.authorName[0]?.toUpperCase()}
                      </div>
                      <span className="text-[10px] font-semibold text-[#4a7c5d] dark:text-gray-400">
                        {msg.authorName}
                        {msg.isAnonymous && <Shield className="w-2.5 h-2.5 inline ml-1 text-[#0d5d3a]" />}
                      </span>
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    own
                      ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-br-sm'
                      : 'bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-gray-100 border border-[#0d5d3a]/10 dark:border-white/10 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-[#4a7c5d]/70 dark:text-gray-500 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-[#0d5d3a]/10 dark:border-white/10 bg-white/90 dark:bg-[#111111]/90 backdrop-blur px-4 py-3">
        {/* Anon toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setIsAnon(v => !v)}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
              isAnon
                ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white'
                : 'bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981]'
            }`}
          >
            {isAnon ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isAnon ? 'Anonymous' : 'Visible name'}
          </button>
          <span className="text-[10px] text-[#4a7c5d] dark:text-gray-500">
            {isAnon ? 'Your name is hidden' : 'Others can see your name'}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share how you feel… (Enter to send)"
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-[#0d5d3a]/12 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 dark:focus:ring-[#1a8a5a]/50 resize-none leading-relaxed placeholder-[#4a7c5d]/50 max-h-28 overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 112) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white flex items-center justify-center hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-40 transition shadow-md shadow-[#0d5d3a]/20"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main PeerCircles Component
──────────────────────────────────────────────────────────────── */
export default function PeerCircles({ userId }: { userId?: string }) {
  const [circles, setCircles]       = useState<Circle[]>([]);
  const [loading, setLoading]       = useState(true);
  const [joining, setJoining]       = useState<string | null>(null);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/circles');
      setCircles(res.circles || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async (id: string) => {
    setJoining(id);
    try {
      const res = await apiFetch<any>(`/circles/${id}/join`, { method: 'POST' });
      setCircles(prev => prev.map(c =>
        c._id === id
          ? { ...c, isJoined: res.joined, memberCount: c.memberCount + (res.joined ? 1 : -1) }
          : c
      ));
    } catch { /* silent */ }
    finally { setJoining(null); }
  };

  /* ── Chat room view ── */
  if (activeCircle) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <CircleChatRoom
          circle={activeCircle}
          currentUserId={userId || ''}
          onBack={() => setActiveCircle(null)}
        />
      </div>
    );
  }

  /* ── Circles listing ── */
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center shadow-lg shadow-[#0d5d3a]/20">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0a2617] dark:text-gray-100 leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
            Peer Support Circles
          </h2>
          <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-0.5">
            Real-time group spaces — join, share, and feel less alone
          </p>
        </div>
      </div>

      {/* Guideline banner */}
      <div className="mb-5 rounded-2xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 border border-[#0d5d3a]/15 dark:border-[#10b981]/20 px-4 py-3 flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#0d5d3a] dark:text-[#10b981] leading-relaxed font-medium">
          These are safe, moderated spaces. Be kind, be supportive, and never share personal contact details.
          You can post anonymously anytime. Messages are visible only to members.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 text-[#0d5d3a] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {circles.map(c => (
              <CircleCard
                key={c._id}
                circle={c}
                onJoin={handleJoin}
                onOpen={setActiveCircle}
                joining={joining}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
