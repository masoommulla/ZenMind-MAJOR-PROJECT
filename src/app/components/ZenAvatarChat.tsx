import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { apiFetch } from '../api/client';

type Message = { role: 'user' | 'assistant'; content: string; id: string };
let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SS = window.speechSynthesis;

/* ── SVG Avatar Face ─────────────────────────────────────────────────────── */
function AvatarFace({ state }: { state: 'idle' | 'listening' | 'thinking' | 'speaking' }) {
  const mouthOpen = state === 'speaking';
  const eyeScale  = state === 'thinking' ? 0.6 : 1;
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="faceGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1db975" />
          <stop offset="100%" stopColor="#0a3d22" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e8fff4" />
          <stop offset="100%" stopColor="#a8f0cc" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Face */}
      <circle cx="60" cy="60" r="55" fill="url(#faceGrad)" />
      {/* Highlight */}
      <ellipse cx="45" cy="38" rx="18" ry="10" fill="white" opacity="0.08" />
      {/* Left eye */}
      <g transform={`translate(38,48) scale(1,${eyeScale})`}>
        <ellipse cx="0" cy="0" rx="7" ry="7" fill="url(#eyeGrad)" filter="url(#glow)" />
        <circle cx="1" cy="-1" r="3.5" fill="#0a3d22" />
        <circle cx="2.5" cy="-2.5" r="1.2" fill="white" opacity="0.9" />
      </g>
      {/* Right eye */}
      <g transform={`translate(82,48) scale(1,${eyeScale})`}>
        <ellipse cx="0" cy="0" rx="7" ry="7" fill="url(#eyeGrad)" filter="url(#glow)" />
        <circle cx="1" cy="-1" r="3.5" fill="#0a3d22" />
        <circle cx="2.5" cy="-2.5" r="1.2" fill="white" opacity="0.9" />
      </g>
      {/* Eyebrows */}
      <path d="M31 39 Q38 35 45 39" stroke="#a8f0cc" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M75 39 Q82 35 89 39" stroke="#a8f0cc" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Mouth */}
      {mouthOpen ? (
        <ellipse cx="60" cy="82" rx="14" ry="9" fill="#0a3d22" opacity="0.85" />
      ) : (
        <path d="M46 82 Q60 90 74 82" stroke="#a8f0cc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* Listening dots */}
      {state === 'listening' && (
        <>
          <circle cx="46" cy="82" r="2.5" fill="#10b981" opacity="0.9" />
          <circle cx="60" cy="85" r="2.5" fill="#10b981" opacity="0.9" />
          <circle cx="74" cy="82" r="2.5" fill="#10b981" opacity="0.9" />
        </>
      )}
    </svg>
  );
}

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
    utt.onstart  = () => { setSpeaking(true); setAvatarState('speaking'); };
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
      const { reply } = await apiFetch<{ reply: string }>('/zen-chat', { method: 'POST', body: JSON.stringify({ messages: history }) });
      const botMsg: Message = { role: 'assistant', content: reply, id: uid() };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');
      if (voiceOn) speakText(botMsg);
    } catch (e: any) { setAvatarState('idle'); setError(e.message || 'Could not reach Zen.'); }
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

      {/* ── MOBILE: two mini floating boxes ────────────────────────────── */}
      <div className="flex lg:hidden gap-3 flex-shrink-0">
        {/* Mini avatar */}
        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a2617] to-[#1a8a5a] p-3 flex-shrink-0 shadow-xl relative">
          <AvatarFace state={avatarState} />
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <div className={`inline-block w-1.5 h-1.5 rounded-full ${avatarState === 'idle' ? 'bg-[#10b981]/50' : 'bg-[#10b981] animate-pulse'}`} />
          </div>
        </div>
        {/* Mini waveform */}
        <div className="flex-1 h-28 rounded-2xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-xl overflow-hidden flex flex-col">
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

        {/* Avatar top section */}
        <div className="relative flex-[3] rounded-3xl overflow-hidden bg-gradient-to-br from-[#071a0f] via-[#0d5d3a] to-[#0a3d22] flex flex-col items-center justify-center p-6 shadow-xl min-h-[220px]">
          {/* Glow */}
          <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${avatarState === 'speaking' ? 'opacity-100' : 'opacity-40'}`}>
            <div className="absolute inset-[20%] rounded-full bg-[#10b981]/15 blur-2xl" />
          </div>
          {/* Pulse rings when speaking/listening */}
          <AnimatePresence>
            {(avatarState === 'speaking' || avatarState === 'listening') && [1,2,3].map(i => (
              <motion.div key={i} className="absolute rounded-full border border-[#10b981]/25"
                style={{ inset: `${30 - i * 12}%` }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </AnimatePresence>
          {/* Avatar face */}
          <div className={`relative z-10 w-32 h-32 transition-transform duration-300 ${avatarState === 'speaking' ? 'scale-105' : 'scale-100'}`}>
            <AvatarFace state={avatarState} />
          </div>
          {/* Name + status */}
          <div className="relative z-10 text-center mt-3">
            <div className="text-white text-lg font-bold tracking-wide" style={{ fontFamily: 'Syne,sans-serif' }}>Zen</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${avatarState === 'speaking' ? 'bg-[#10b981] animate-pulse' : avatarState === 'listening' ? 'bg-yellow-400 animate-pulse' : avatarState === 'thinking' ? 'bg-blue-400 animate-pulse' : 'bg-[#10b981]/40'}`} />
              <span className="text-[#10b981]/70 text-xs capitalize">{avatarState === 'idle' ? 'Ready' : avatarState + '...'}</span>
            </div>
          </div>
        </div>

        {/* Waveform bottom section */}
        <div className="flex-[2] rounded-3xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[120px]">
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
