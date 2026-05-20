import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/client';
import ZenTalkingHead from './ZenTalkingHead';
import ZenChatSidebar from './ZenChatSidebar';
import MoodCheckIn from './MoodCheckIn';

type MessageAction = 'STORY_BUTTONS' | 'POST_STORY' | 'THERAPY_BUTTON' | 'CRISIS' | null;
type Message = { role: 'user' | 'assistant'; content: string; id: string; action?: MessageAction };

let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SS = window.speechSynthesis;

const ACTION_RE = /\[ACTION:(STORY_BUTTONS|POST_STORY|THERAPY_BUTTON|CRISIS)\]/g;

function stripActionTags(text: string): string {
  return text.replace(ACTION_RE, '').replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n');
}

function detectAction(raw: string): MessageAction {
  const reset = new RegExp(ACTION_RE.source, 'g');
  const m = reset.exec(raw);
  return m ? (m[1] as MessageAction) : null;
}

function parseReply(raw: string): { text: string; action: MessageAction } {
  const action = detectAction(raw);
  const text = stripActionTags(raw);
  return { text, action };
}

const CRISIS_NUMBERS = [
  { name: 'iCall', number: '9152987821', tag: 'Mon–Sat, 8am–9pm' },
  { name: 'Vandrevala Foundation', number: '1860 2662 345', tag: '24/7 · Free' },
  { name: 'AASRA', number: '9820466627', tag: '24/7 · Confidential' },
  { name: 'Snehi', number: '044-24640050', tag: 'Mon–Sat, 8am–9pm' },
  { name: 'NIMHANS Helpline', number: '080-46110007', tag: 'Mon–Sat, 8am–8pm' },
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
function CrisisCard({ onGoToTherapy }: { onGoToTherapy?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mt-3 rounded-2xl overflow-hidden shadow-lg border border-rose-200/60 dark:border-rose-500/25"
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 flex items-center gap-2.5">
        <span className="text-xl"></span>
        <div>
          <p className="text-white font-bold text-sm leading-tight">You are not alone.</p>
          <p className="text-rose-100 text-xs">Real support is just one call away.</p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-rose-50 dark:bg-rose-950/40 px-4 py-3 flex flex-col gap-2">
        <p className="text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider mb-0.5">
          India Crisis Helplines — Available Now
        </p>

        {CRISIS_NUMBERS.map(({ name, number, tag }) => (
          <a
            key={name}
            href={`tel:${number.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-between bg-white dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3 py-2.5 hover:bg-rose-100 dark:hover:bg-rose-800/30 transition-colors group"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-rose-800 dark:text-rose-200 leading-tight truncate">{name}</span>
              {tag && <span className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">{tag}</span>}
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-300 group-hover:underline whitespace-nowrap ml-2">
              {number} <ExternalLink size={10} />
            </span>
          </a>
        ))}

        {/* Therapy Hub CTA */}
        {onGoToTherapy && (
          <button
            onClick={onGoToTherapy}
            className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white text-sm font-bold hover:from-[#0a4a2e] hover:to-[#0d5d3a] transition-all shadow-md shadow-[#0d5d3a]/20"
          >
             Talk to a Therapist Now
          </button>
        )}

        <p className="text-[10px] text-rose-500/70 dark:text-rose-400/50 text-center mt-0.5">
          Tap any number to call directly from your device
        </p>
      </div>
    </motion.div>
  );
}

/* ── Message bubble ────────────────────────────────────────── */
function MessageBubble({ msg, onStoryYes, onStoryNo, onFeelingGood, onConnectReal, onGoToTherapy }: {
  msg: Message;
  onStoryYes: () => void;
  onStoryNo: () => void;
  onFeelingGood: () => void;
  onConnectReal: () => void;
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
          {stripActionTags(msg.content)}
        </div>

        {/* Story Yes/No buttons — offer phase only */}
        {isBot && msg.action === 'STORY_BUTTONS' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-1">
            <button onClick={onStoryYes}
              className="px-5 py-2 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold rounded-xl hover:bg-[#0a4a2e] transition shadow-md">
              Yes, please 
            </button>
            <button onClick={onStoryNo}
              className="px-5 py-2 bg-white dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] text-sm font-bold rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition">
              Not right now
            </button>
          </motion.div>
        )}

        {/* Post-story check-in buttons */}
        {isBot && msg.action === 'POST_STORY' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-1 flex-wrap">
            <button onClick={onFeelingGood}
              className="px-5 py-2 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold rounded-xl hover:bg-[#0a4a2e] transition shadow-md">
              Feeling good 
            </button>
            <button onClick={onConnectReal}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition shadow-md">
              Connect to a real person
            </button>
          </motion.div>
        )}

        {/* Therapy Hub button */}
        {isBot && msg.action === 'THERAPY_BUTTON' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1">
            <button onClick={onGoToTherapy}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:from-[#0a4a2e] transition">
               Go to Therapy Hub
            </button>
          </motion.div>
        )}

        {/* Crisis numbers */}
        {isBot && msg.action === 'CRISIS' && <CrisisCard onGoToTherapy={onGoToTherapy} />}
      </div>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function ZenAvatarChat({ onNavigateToTherapy, me, onUpgradeClick }: { onNavigateToTherapy?: () => void, me?: any, onUpgradeClick?: () => void }) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [listening, setListening]     = useState(false);
  const [speaking, setSpeaking]       = useState(false);
  const [voiceOn, setVoiceOn]         = useState(true);
  const [avatarState, setAvatarState] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle');
  const [lastBotText, setLastBotText] = useState('');
  const [error, setError]             = useState<string | null>(null);
  
  const [localCredits, setLocalCredits] = useState(me?.aiCreditsRemaining ?? 0);
  useEffect(() => { setLocalCredits(me?.aiCreditsRemaining ?? 0); }, [me?.aiCreditsRemaining]);

  // Session persistence
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  // Mood check-in
  const [showMood, setShowMood]       = useState(false);
  const moodShownRef                  = useRef(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef  = useRef('');
  const chatEndRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Check if mood already logged today — show prompt after first message if not
  const checkMoodAndPrompt = useCallback(async () => {
    if (moodShownRef.current) return;
    try {
      const { checkedIn } = await apiFetch<{ checkedIn: boolean }>('/zen-progress/mood/today');
      if (!checkedIn) { setShowMood(true); moodShownRef.current = true; }
    } catch { /* silent */ }
  }, []);

  // Load messages for a past session
  const loadSession = useCallback(async (id: string) => {
    try {
      const data = await apiFetch<{ messages: any[]; sessionId: string; title: string }>(`/zen-sessions/${id}/messages`);
      const restored: Message[] = data.messages.map((m: any) => ({
        id: uid(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        action: m.action || null,
      }));
      SS?.cancel(); setSpeaking(false); setAvatarState('idle');
      setMessages(restored.length ? restored : [{ role: 'assistant', id: uid(), content: GREETING }]);
      setSessionId(id);
      setInput('');
      setError(null);
    } catch { /* silent */ }
  }, []);

  const GREETING = "Hey, I'm Zeni  I'm here for you — no judgment, just support. How are you feeling today?";

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
    
    // Check credits before sending
    if (me?.subscriptionTier !== 'platinum' && localCredits <= 0) {
      setError('You have run out of AI Chat credits. Please upgrade your plan to continue.');
      return;
    }

    setInput(''); setError(null);
    const userMsg: Message = { role: 'user', content: t, id: uid() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true); setAvatarState('thinking');
    try {
      const history = [...messages, userMsg].slice(-14).map(({ role, content }) => ({ role, content }));
      const body: any = { messages: history };
      if (sessionId) body.sessionId = sessionId;

      const res = await apiFetch<{ reply: string; sessionId: string; creditsLeft?: number }>('/zen-chat', {
        method: 'POST',
        body: JSON.stringify(body),
        timeoutMs: 28000,
      });
      const { reply, sessionId: newSessionId, creditsLeft } = res;
      
      if (creditsLeft !== undefined && creditsLeft !== null) {
        setLocalCredits(creditsLeft);
      }

      // Store the session ID from first message onward
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
        setSidebarRefresh(r => r + 1); // refresh sidebar list
      }

      const { text: cleanText, action } = parseReply(reply);
      const botMsg: Message = { role: 'assistant', content: cleanText, id: uid(), action };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');
      if (voiceOn) speakText(botMsg);

      // After first bot reply, check if user needs mood check-in
      checkMoodAndPrompt();
    } catch (e: any) {
      setAvatarState('idle');
      const msg = e?.message || '';
      if (msg.includes('timed out') || msg.includes('took too long')) setError('Zeni is taking a moment. Please try again.');
      else if (msg.includes('fetch') || msg.includes('connect') || msg.includes('Failed')) setError('Could not reach Zeni. Please check your connection.');
      else setError(msg || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }, [messages, loading, voiceOn, speakText, sessionId, checkMoodAndPrompt]);

  const handleStoryYes    = useCallback(() => handleSend("Yes, please tell me the story"), [handleSend]);
  const handleStoryNo     = useCallback(() => handleSend("Not right now, thanks"), [handleSend]);
  const handleFeelingGood = useCallback(async () => {
    // Passive mood capture: "Feeling good" = 8/10
    if (sessionId) {
      apiFetch(`/zen-sessions/${sessionId}/mood`, {
        method: 'PATCH',
        body: JSON.stringify({ score: 8 }),
      }).catch(() => {});
    }
    handleSend("Feeling good now, thank you ");
  }, [handleSend, sessionId]);
  const handleConnectReal = useCallback(() => handleSend("I'd like to connect to a real person"), [handleSend]);
  const handleGoToTherapy = useCallback(() => { if (onNavigateToTherapy) onNavigateToTherapy(); }, [onNavigateToTherapy]);

  const clearChat = () => {
    SS?.cancel(); setSpeaking(false); setAvatarState('idle'); setInput(''); setError(null);
    setSessionId(null); // reset session — next message starts a new one
    const g: Message = { role: 'assistant', id: uid(), content: GREETING };
    setMessages([g]); if (voiceOn) speakText(g);
    setSidebarRefresh(r => r + 1); // refresh sidebar to show new session count
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-[calc(100vh-148px)] min-h-[560px] relative overflow-hidden">

      {/* Mood check-in modal */}
      <AnimatePresence>
        {showMood && <MoodCheckIn onClose={() => setShowMood(false)} />}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="relative flex-shrink-0 h-full">
        <ZenChatSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          currentSessionId={sessionId}
          onSelectSession={loadSession}
          onNewChat={clearChat}
          refreshTrigger={sidebarRefresh}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-w-0 overflow-hidden">

      {/* MOBILE avatar strip */}
      <div className="flex lg:hidden gap-3 flex-shrink-0 items-center bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-3 shadow-sm">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-inner relative border-2 border-[#10b981]/30">
          <ZenTalkingHead speaking={speaking} text={lastBotText} />
        </div>
        <div className="flex-1 min-w-0">
           <div className="text-sm font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Zeni</div>
           <div className="text-xs text-[#4a7c5d] dark:text-gray-400 capitalize flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${avatarState === 'idle' ? 'bg-[#10b981]/50' : 'bg-[#10b981] animate-pulse'}`} />
             {avatarState === 'idle' ? 'Ready to listen' : avatarState + '...'}
           </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => { if (voiceOn) SS?.cancel(); setVoiceOn(v => !v); }} className={`w-10 h-10 rounded-full flex items-center justify-center border transition shadow-sm ${voiceOn ? 'bg-[#0d5d3a] text-white border-[#0d5d3a]' : 'bg-[#f0fbf4] dark:bg-[#1a1a1a] text-[#4a7c5d] border-[#0d5d3a]/15'}`}>{voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
          <button onClick={clearChat} className="w-10 h-10 rounded-full flex items-center justify-center border border-[#0d5d3a]/15 dark:border-white/10 bg-[#f0fbf4] dark:bg-[#1a1a1a] text-[#4a7c5d] shadow-sm"><RotateCcw className="w-4 h-4" /></button>
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
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Your private, safe space </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {me?.subscriptionTier !== 'platinum' && (
              <div className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#0d5d3a]/20">
                <Sparkles size={12} /> {localCredits} Credits Left
              </div>
            )}
            <div className="text-xs text-[#4a7c5d] dark:text-gray-500 bg-[#f0fbf4] dark:bg-white/5 px-2 py-1 rounded-full">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg}
              onStoryYes={handleStoryYes}
              onStoryNo={handleStoryNo}
              onFeelingGood={handleFeelingGood}
              onConnectReal={handleConnectReal}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 px-4 py-4 text-sm text-red-600 dark:text-red-400 flex flex-col items-center justify-center text-center gap-3">
                <div className="font-bold">{error}</div>
                {error.includes('credits') && onUpgradeClick && (
                  <button onClick={onUpgradeClick} className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                    <Sparkles size={16} /> Upgrade Plan
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="flex-shrink-0 px-4 sm:px-5 py-4">
          <div className="zen-chat-box">
            <div className="zen-chat-inner">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {SR && (
                  <button id="zen-mic-btn" onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} disabled={loading}
                    style={{ flexShrink: 0, marginLeft: 8, color: listening ? '#ff4444' : 'rgba(167,243,208,0.5)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.3s', display: 'flex' }}
                    title="Hold to speak"
                  >
                    {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <input id="zen-text-input" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
                  disabled={loading}
                  placeholder={listening ? 'Listening...' : 'Share how you\'re feeling... ˚'}
                  className="zen-chat-textarea"
                  style={{ height: 44, flex: 1 }}
                />
              </div>
              <div className="zen-chat-options">
                <div className="zen-chat-btns">
                  <button title="Attach" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" /></svg>
                  </button>
                  <button title="Language" type="button">
                    <svg viewBox="0 0 24 24" height={18} width={18} xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.01 8.01 0 0 0 5.648 6.667M10.03 13c.151 2.439.848 4.73 1.97 6.752A15.9 15.9 0 0 0 13.97 13zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.01 8.01 0 0 0 19.938 13M4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333A8.01 8.01 0 0 0 4.062 11m5.969 0h3.938A15.9 15.9 0 0 0 12 4.248A15.9 15.9 0 0 0 10.03 11m4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.01 8.01 0 0 0-5.648-6.667" fill="currentColor" /></svg>
                  </button>
                </div>
                <button id="zen-send-btn" className="zen-chat-submit" onClick={() => handleSend(input)} disabled={!input.trim() || loading} title="Send">
                  <i>
                    <svg viewBox="0 0 512 512" width={16} height={16}><path fill="currentColor" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" /></svg>
                  </i>
                </button>
              </div>
            </div>
          </div>
          <div className="zen-chat-tags">
            <span onClick={() => handleSend('How can I manage my anxiety?')}>Anxiety Help</span>
            <span onClick={() => handleSend('Tell me a story')}>Story Mode</span>
            <span onClick={() => handleSend('I want to talk to a therapist')}>Talk to Therapist</span>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-1">
            Zeni is an AI companion, not a substitute for professional therapy. In crisis? iCall: 9152987821
          </p>
        </div>
      </div>
      </div> {/* end main chat area wrapper */}
    </motion.div>
  );
}
