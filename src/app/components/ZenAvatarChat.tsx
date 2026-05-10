import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw, ExternalLink } from 'lucide-react';
import { apiFetch } from '../api/client';
import ZenTalkingHead from './ZenTalkingHead';

type MessageAction = 'STORY_BUTTONS' | 'THERAPY_BUTTON' | 'CRISIS' | null;
type Message = { role: 'user' | 'assistant'; content: string; id: string; action?: MessageAction };

let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SS = window.speechSynthesis;

const ACTION_RE = /\[ACTION:(STORY_BUTTONS|THERAPY_BUTTON|CRISIS)\]/;

function parseReply(raw: string): { text: string; action: MessageAction } {
  const m = raw.match(ACTION_RE);
  if (!m) return { text: raw.trim(), action: null };
  return { text: raw.replace(m[0], '').trim(), action: m[1] as MessageAction };
}

const CRISIS_NUMBERS = [
  { name: 'iCall', number: '9152987821' },
  { name: 'Vandrevala Foundation', number: '18602662345' },
  { name: 'AASRA', number: '9820466627' },
  { name: 'Snehi', number: '044-24640050' },
];

/* ── Waveform ─────────────────────────────────────────────── */
function WaveVisualizer({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] w-full h-full px-4">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div key={i} className="rounded-full flex-1"
          style={{ background: 'linear-gradient(to top,#0d5d3a,#10b981)', minWidth: 3, maxWidth: 8 }}
          animate={active
            ? { height: [`${10 + Math.sin(i) * 8}%`, `${30 + Math.random() * 50}%`, `${10 + Math.sin(i) * 8}%`], opacity: [0.5, 1, 0.5] }
            : { height: '15%', opacity: 0.25 }}
          transition={{ duration: active ? 0.35 + (i % 5) * 0.07 : 0.4, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ── Crisis card ───────────────────────────────────────────── */
function CrisisCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-2xl p-4">
      <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3 uppercase tracking-wide">🆘 Immediate Support — India</p>
      <div className="flex flex-col gap-2">
        {CRISIS_NUMBERS.map(({ name, number }) => (
          <a key={name} href={`tel:${number}`}
            className="flex items-center justify-between bg-white dark:bg-red-900/30 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2 hover:bg-red-100 dark:hover:bg-red-800/30 transition group">
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">{name}</span>
            <span className="flex items-center gap-1 text-sm font-bold text-red-600 dark:text-red-400 group-hover:underline">
              {number.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')} <ExternalLink size={11} />
            </span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-red-600/70 dark:text-red-400/60 mt-2 text-center">Tap a number to call directly from your phone</p>
    </motion.div>
  );
}

/* ── Message bubble ────────────────────────────────────────── */
function MessageBubble({ msg, onStoryYes, onStoryNo, onGoToTherapy }: {
  msg: Message;
  onStoryYes: () => void;
  onStoryNo: () => void;
  onGoToTherapy: () => void;
}) {
  const isBot = msg.role === 'assistant';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${isBot ? 'bg-gradient-to-br from-[#0d5d3a] to-[#10b981] text-white' : 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white'}`}>
        {isBot ? 'Zi' : 'U'}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`text-[11px] font-semibold ${isBot ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-[#4a7c5d] dark:text-gray-400'}`}>
          {isBot ? 'Zeni' : 'You'}
        </div>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isBot
          ? 'bg-[#f7fbf8] dark:bg-[#1a1a1a] text-[#0a2617] dark:text-gray-100 border border-[#0d5d3a]/08 dark:border-white/08 rounded-tl-sm'
          : 'bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white rounded-tr-sm shadow-lg shadow-[#0d5d3a]/15'}`}>
          {msg.content}
        </div>

        {/* Story Yes/No buttons */}
        {isBot && msg.action === 'STORY_BUTTONS' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-1">
            <button onClick={onStoryYes}
              className="px-5 py-2 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold rounded-xl hover:bg-[#0a4a2e] transition shadow-md">
              Yes, please 💚
            </button>
            <button onClick={onStoryNo}
              className="px-5 py-2 bg-white dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] text-sm font-bold rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition">
              Not right now
            </button>
          </motion.div>
        )}

        {/* Therapy Hub button */}
        {isBot && msg.action === 'THERAPY_BUTTON' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1">
            <button onClick={onGoToTherapy}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:from-[#0a4a2e] transition">
              🌿 Go to Therapy Hub
            </button>
          </motion.div>
        )}

        {/* Crisis numbers */}
        {isBot && msg.action === 'CRISIS' && <CrisisCard />}
      </div>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function ZenAvatarChat({ onNavigateToTherapy }: { onNavigateToTherapy?: () => void }) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [listening, setListening]     = useState(false);
  const [speaking, setSpeaking]       = useState(false);
  const [voiceOn, setVoiceOn]         = useState(true);
  const [avatarState, setAvatarState] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle');
  const [lastBotText, setLastBotText] = useState('');
  const [error, setError]             = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef  = useRef('');
  const chatEndRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const GREETING = "Hey, I'm Zeni 💚 I'm here for you — no judgment, just support. How are you feeling today?";

  useEffect(() => {
    const g: Message = { role: 'assistant', id: uid(), content: GREETING };
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
    utt.onstart = () => { setSpeaking(true); setAvatarState('speaking'); setLastBotText(msg.content); };
    utt.onend   = () => { setSpeaking(false); setAvatarState('idle'); };
    utt.onerror = () => { setSpeaking(false); setAvatarState('idle'); };
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
      const history = [...messages, userMsg].slice(-14).map(({ role, content }) => ({ role, content }));
      const { reply } = await apiFetch<{ reply: string }>('/zen-chat', {
        method: 'POST',
        body: JSON.stringify({ messages: history }),
        timeoutMs: 28000,
      });
      const { text: cleanText, action } = parseReply(reply);
      const botMsg: Message = { role: 'assistant', content: cleanText, id: uid(), action };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');
      if (voiceOn) speakText(botMsg);
    } catch (e: any) {
      setAvatarState('idle');
      const msg = e?.message || '';
      if (msg.includes('timed out') || msg.includes('took too long')) setError('Zeni is taking a moment. Please try again.');
      else if (msg.includes('fetch') || msg.includes('connect') || msg.includes('Failed')) setError('Could not reach Zeni. Please check your connection.');
      else setError(msg || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }, [messages, loading, voiceOn, speakText]);

  const handleStoryYes = useCallback(() => handleSend("Yes, please tell me the story"), [handleSend]);
  const handleStoryNo  = useCallback(() => handleSend("Not right now, thanks"), [handleSend]);
  const handleGoToTherapy = useCallback(() => { if (onNavigateToTherapy) onNavigateToTherapy(); }, [onNavigateToTherapy]);

  const clearChat = () => {
    SS?.cancel(); setSpeaking(false); setAvatarState('idle'); setInput(''); setError(null);
    const g: Message = { role: 'assistant', id: uid(), content: GREETING };
    setMessages([g]); if (voiceOn) speakText(g);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-148px)] min-h-[560px]">

      {/* MOBILE avatar strip */}
      <div className="flex lg:hidden gap-3 flex-shrink-0">
        <div className="w-36 h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl relative">
          <ZenTalkingHead speaking={speaking} text={lastBotText} />
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <div className={`inline-block w-1.5 h-1.5 rounded-full ${avatarState === 'idle' ? 'bg-[#10b981]/50' : 'bg-[#10b981] animate-pulse'}`} />
          </div>
        </div>
        <div className="flex-1 h-44 rounded-2xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-xl overflow-hidden flex flex-col">
          <div className="text-[10px] font-semibold text-[#4a7c5d] dark:text-gray-400 px-3 pt-2 capitalize">{avatarState === 'idle' ? 'Ready' : avatarState + '...'}</div>
          <div className="flex-1"><WaveVisualizer active={speaking || listening} /></div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={() => { if (voiceOn) SS?.cancel(); setVoiceOn(v => !v); }} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${voiceOn ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] border-[#0d5d3a]/15'}`}>{voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
          <button onClick={clearChat} className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#4a7c5d]"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* DESKTOP left panel */}
      <div className="hidden lg:flex flex-col flex-shrink-0 w-72 xl:w-80 gap-3">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl flex-shrink-0" style={{ aspectRatio: '3 / 4' }}>
          <ZenTalkingHead speaking={speaking} text={lastBotText} />
          <AnimatePresence>
            {(avatarState === 'speaking' || avatarState === 'listening') && [1, 2].map(i => (
              <motion.div key={i} className="absolute rounded-full border border-[#10b981]/20 pointer-events-none"
                style={{ inset: `${25 - i * 10}%` }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }} />
            ))}
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
            <div className="text-white text-base font-bold tracking-wide" style={{ fontFamily: 'Syne,sans-serif' }}>Zeni</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${avatarState === 'speaking' ? 'bg-[#10b981] animate-pulse' : avatarState === 'listening' ? 'bg-yellow-400 animate-pulse' : avatarState === 'thinking' ? 'bg-blue-400 animate-pulse' : 'bg-[#10b981]/40'}`} />
              <span className="text-white/70 text-xs capitalize">{avatarState === 'idle' ? 'Ready' : avatarState + '...'}</span>
            </div>
          </div>
        </div>

        <div className="flex-[1] rounded-3xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[100px]">
          <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider">Voice Activity</div>
          <div className="flex-1 pb-2"><WaveVisualizer active={speaking || listening} /></div>
        </div>

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

      {/* RIGHT: conversation */}
      <div className="flex-1 flex flex-col min-w-0 rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm overflow-hidden">
        <div className="hidden sm:flex flex-shrink-0 px-5 py-3 border-b border-[#0d5d3a]/08 dark:border-white/08 items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white text-xs font-bold">Zi</div>
          <div>
            <div className="text-sm font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Conversation with Zeni</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Your private, safe space 💚</div>
          </div>
          <div className="ml-auto text-xs text-[#4a7c5d] dark:text-gray-500 bg-[#f0fbf4] dark:bg-white/5 px-2 py-1 rounded-full">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg}
              onStoryYes={handleStoryYes}
              onStoryNo={handleStoryNo}
              onGoToTherapy={handleGoToTherapy}
            />
          ))}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white text-xs font-bold">Zi</div>
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

        <div className="flex-shrink-0 border-t border-[#0d5d3a]/08 dark:border-white/08 px-4 sm:px-5 py-4">
          <div className="flex gap-2 items-center">
            {SR && (
              <button id="zen-mic-btn" onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} disabled={loading}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 ${listening ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30' : 'bg-[#f0fbf4] dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/15 dark:border-white/10'}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <input id="zen-text-input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              disabled={loading}
              placeholder={listening ? 'Listening...' : 'Talk to Zeni...'}
              className="flex-1 bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/30 transition disabled:opacity-60" />
            <button id="zen-send-btn" onClick={() => handleSend(input)} disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white flex items-center justify-center shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#4a7c5d]/50 dark:text-gray-600 mt-2">
            Zeni is an AI companion, not a substitute for professional therapy. In crisis? iCall: 9152987821
          </p>
        </div>
      </div>
    </motion.div>
  );
}
