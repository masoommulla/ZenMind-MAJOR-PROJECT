import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { apiFetch } from '../api/client';
import ZenTalkingHead from './ZenTalkingHead';

type Message = { role: 'user' | 'assistant'; content: string; id: string };
let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SS = window.speechSynthesis;

/* AvatarFace SVG removed — replaced by ZenTalkingHead 3D component */

/* ── Waveform Visualizer ─────────────────────────────────────────────────── */
function WaveVisualizer({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <div className="flex items-center justify-center gap-[3px] w-full h-full px-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full flex-1"
          style={{ background: `linear-gradient(to top, #0d5d3a, #10b981)`, minWidth: 3, maxWidth: 8 }}
          animate={active
            ? { height: [`${10 + Math.sin(i) * 8}%`, `${30 + Math.random() * 50}%`, `${10 + Math.sin(i) * 8}%`], opacity: [0.5, 1, 0.5] }
            : { height: '15%', opacity: 0.25 }
          }
          transition={{ duration: active ? 0.35 + (i % 5) * 0.07 : 0.4, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === 'assistant';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${isBot ? 'bg-gradient-to-br from-[#0d5d3a] to-[#10b981] text-white' : 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white'}`}>
        {isBot ? 'Z' : 'U'}
      </div>
      <div className={`max-w-[72%] flex flex-col gap-1 ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`text-[11px] font-semibold ${isBot ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-[#4a7c5d] dark:text-gray-400'}`}>{isBot ? 'Zen' : 'You'}</div>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isBot ? 'bg-[#f7fbf8] dark:bg-[#1a1a1a] text-[#0a2617] dark:text-gray-100 border border-[#0d5d3a]/08 dark:border-white/08 rounded-tl-sm' : 'bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white rounded-tr-sm shadow-lg shadow-[#0d5d3a]/15'}`}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function ZenAvatarChat() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [voiceOn, setVoiceOn]       = useState(true);
  const [avatarState, setAvatarState] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle');
  const [lastBotText, setLastBotText] = useState('');     // drives ZenTalkingHead lip-sync
  const [error, setError]           = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef  = useRef('');
  const chatEndRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const g: Message = { role: 'assistant', id: uid(), content: "Hello! I'm Zen, your mental wellness companion. How are you feeling today?" };
    setMessages([g]);
    if (voiceOn) speakText(g);
  }, []);

  const speakText = useCallback((msg: Message) => {
    if (!SS || !voiceOn) return;
    SS.cancel();
    const utt = new SpeechSynthesisUtterance(msg.content);
    utt.rate = 0.9; utt.pitch = 1.05;
    const voices = SS.getVoices();
    const v = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Karen'));
    if (v) utt.voice = v;
    utt.onstart  = () => { setSpeaking(true); setAvatarState('speaking'); setLastBotText(msg.content); };
    utt.onend    = () => { setSpeaking(false); setAvatarState('idle'); };
    utt.onerror  = () => { setSpeaking(false); setAvatarState('idle'); };
    SS.speak(utt);
  }, [voiceOn]);

  const startListening = useCallback(() => {
    if (!SR) return;
    if (speaking) SS.cancel();
    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-IN';
    transcriptRef.current = '';
    rec.onstart  = () => { setListening(true); setAvatarState('listening'); setError(null); };
    rec.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; transcriptRef.current = t.trim(); setInput(t.trim()); };
    rec.onend    = () => { setListening(false); setAvatarState('idle'); if (transcriptRef.current) { handleSend(transcriptRef.current); transcriptRef.current = ''; } };
    rec.onerror  = (e: any) => { setListening(false); setAvatarState('idle'); if (e.error !== 'no-speech') setError('Mic error: ' + e.error); };
    rec.start();
  }, [speaking]);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); }, []);

  const handleSend = useCallback(async (text: string) => {
    const t = text.trim(); if (!t || loading) return;
    setInput(''); setError(null);
    const userMsg: Message = { role: 'user', content: t, id: uid() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true); setAvatarState('thinking');
    try {
      const history = [...messages, userMsg].slice(-12).map(({ role, content }) => ({ role, content }));
      const { reply } = await apiFetch<{ reply: string }>('/zen-chat', {
        method: 'POST',
        body: JSON.stringify({ messages: history }),
        timeoutMs: 28000, // backend has a 25s timeout — this gives it time to respond first
      });
      const botMsg: Message = { role: 'assistant', content: reply, id: uid() };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');
      if (voiceOn) speakText(botMsg);
    } catch (e: any) {
      setAvatarState('idle');
      // Show a clean message — not the raw "Request timed out after Nms" text
      const msg = e?.message || '';
      if (msg.includes('timed out') || msg.includes('took too long')) {
        setError('Zen is taking a moment to respond. Please try again.');
      } else if (msg.includes('fetch') || msg.includes('connect') || msg.includes('Failed')) {
        setError('Could not reach Zen. Please check your connection.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    }
    finally { setLoading(false); }
  }, [messages, loading, voiceOn, speakText]);

  const clearChat = () => {
    SS?.cancel(); setSpeaking(false); setAvatarState('idle'); setInput(''); setError(null);
    const g: Message = { role: 'assistant', id: uid(), content: "Hello! I'm Zen, your mental wellness companion. How are you feeling today?" };
    setMessages([g]); if (voiceOn) speakText(g);
  };

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-148px)] min-h-[560px]">

      {/* ── MOBILE: avatar strip ─────────────────────────────────────────── */}
      <div className="flex lg:hidden gap-3 flex-shrink-0">
        {/* 3D Avatar — taller on mobile for better view */}
        <div className="w-36 h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl relative">
          <ZenTalkingHead speaking={speaking} text={lastBotText} />
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <div className={`inline-block w-1.5 h-1.5 rounded-full ${avatarState === 'idle' ? 'bg-[#10b981]/50' : 'bg-[#10b981] animate-pulse'}`} />
          </div>
        </div>
        {/* Waveform + status */}
        <div className="flex-1 h-44 rounded-2xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-xl overflow-hidden flex flex-col">
          <div className="text-[10px] font-semibold text-[#4a7c5d] dark:text-gray-400 px-3 pt-2 capitalize">{avatarState === 'idle' ? 'Ready' : avatarState + '...'}</div>
          <div className="flex-1"><WaveVisualizer active={speaking || listening} /></div>
        </div>
        {/* Mobile controls */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={() => { if (voiceOn) SS?.cancel(); setVoiceOn(v => !v); }} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${voiceOn ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] border-[#0d5d3a]/15'}`}>{voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
          <button onClick={clearChat} className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#4a7c5d]"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── DESKTOP: left panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-shrink-0 w-72 xl:w-80 gap-3">

        {/* Avatar card — SAME 9:11 aspect ratio as mobile (w-36 h-44 = 144:176 = 9:11)
             xMidYMin slice fills the card and shows ONLY head+shoulders, same as mobile */}
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl flex-shrink-0"
          style={{ aspectRatio: '9 / 11' }}
        >
          <ZenTalkingHead speaking={speaking} text={lastBotText} />

          {/* Pulse rings when active */}
          <AnimatePresence>
            {(avatarState === 'speaking' || avatarState === 'listening') && [1, 2].map(i => (
              <motion.div key={i}
                className="absolute rounded-full border border-[#10b981]/20 pointer-events-none"
                style={{ inset: `${25 - i * 10}%` }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </AnimatePresence>

          {/* Name + status badge — pinned to bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
            <div className="text-white text-base font-bold tracking-wide" style={{ fontFamily: 'Syne,sans-serif' }}>Zen</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                avatarState === 'speaking' ? 'bg-[#10b981] animate-pulse' :
                avatarState === 'listening' ? 'bg-yellow-400 animate-pulse' :
                avatarState === 'thinking' ? 'bg-blue-400 animate-pulse' : 'bg-[#10b981]/40'
              }`} />
              <span className="text-white/70 text-xs capitalize">{avatarState === 'idle' ? 'Ready' : avatarState + '...'}</span>
            </div>
          </div>
        </div>

        {/* Waveform section */}
        <div className="flex-[1] rounded-3xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[100px]">
          <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider">Voice Activity</div>
          <div className="flex-1 pb-2"><WaveVisualizer active={speaking || listening} /></div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => { if (voiceOn) SS?.cancel(); setVoiceOn(v => !v); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${voiceOn ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white border-[#0d5d3a]' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] border-[#0d5d3a]/15 dark:border-white/10'}`}>
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceOn ? 'Voice On' : 'Voice Off'}
          </button>
          <button onClick={clearChat} title="New chat" className="px-3 py-2.5 rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] hover:bg-[#f0fbf4] transition">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── RIGHT: conversation ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm overflow-hidden">
        {/* Header — hidden on mobile to save space */}
        <div className="hidden sm:flex flex-shrink-0 px-5 py-3 border-b border-[#0d5d3a]/08 dark:border-white/08 items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white text-xs font-bold">Z</div>
          <div>
            <div className="text-sm font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Conversation with Zen</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Your private, safe space</div>
          </div>
          <div className="ml-auto text-xs text-[#4a7c5d] dark:text-gray-500 bg-[#f0fbf4] dark:bg-white/5 px-2 py-1 rounded-full">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white text-xs font-bold">Z</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/08">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0,1,2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981]" animate={{ scale: [1,1.4,1], opacity: [0.4,1,0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-[#0d5d3a]/08 dark:border-white/08 px-4 sm:px-5 py-4">
          <div className="flex gap-2 items-center">
            {SR && (
              <button id="zen-mic-btn" onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} disabled={loading}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 ${listening ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30' : 'bg-[#f0fbf4] dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/15 dark:border-white/10'}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <input id="zen-text-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }} disabled={loading}
              placeholder={listening ? 'Listening...' : 'Type a message or hold mic to speak...'}
              className="flex-1 bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/30 transition disabled:opacity-60" />
            <button id="zen-send-btn" onClick={() => handleSend(input)} disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white flex items-center justify-center shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#4a7c5d]/50 dark:text-gray-600 mt-2">
            Zen is an AI companion, not a substitute for professional therapy. In crisis? iCall: 9152987821
          </p>
        </div>
      </div>
    </motion.div>
  );
}
