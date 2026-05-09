import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/client';

type Message = { role: 'user' | 'assistant'; content: string; id: string };

// ── Unique ID helper ──────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `m_${Date.now()}_${_id++}`;

// ── Checks if browser supports Speech Recognition ────────────────────────────
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const SS = window.speechSynthesis;

export default function ZenAvatarChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef  = useRef('');
  const chatEndRef     = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting: Message = {
      role: 'assistant',
      id: uid(),
      content: "Hey, I'm Zen 🌿 Your mental wellness companion. How are you feeling today?",
    };
    setMessages([greeting]);
    if (voiceEnabled) speakText(greeting.content);
  }, []);

  // ── Text-to-Speech ──────────────────────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (!SS || !voiceEnabled) return;
    SS.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    // Pick a soft voice if available
    const voices = SS.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google UK English Female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Moira')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setSpeaking(true); setAvatarState('speaking'); };
    utterance.onend   = () => { setSpeaking(false); setAvatarState('idle'); };
    utterance.onerror = () => { setSpeaking(false); setAvatarState('idle'); };
    SS.speak(utterance);
  }, [voiceEnabled]);

  // ── Speech Recognition ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SR) return;
    if (speaking) { SS.cancel(); setSpeaking(false); }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    transcriptRef.current = '';

    recognition.onstart = () => { setListening(true); setAvatarState('listening'); setError(null); };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      transcriptRef.current = (final || interim).trim();
      setInput(transcriptRef.current);
    };

    recognition.onend = () => {
      setListening(false);
      setAvatarState('idle');
      if (transcriptRef.current.trim()) {
        handleSend(transcriptRef.current.trim());
        transcriptRef.current = '';
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      setAvatarState('idle');
      if (event.error !== 'no-speech') setError('Microphone error: ' + event.error);
    };

    recognition.start();
  }, [speaking]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // ── Send message to backend ──────────────────────────────────────────────────
  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(null);

    const userMsg: Message = { role: 'user', content: trimmed, id: uid() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setAvatarState('thinking');

    try {
      const history = [...messages, userMsg]
        .slice(-12) // last 12 messages for context
        .map(({ role, content }) => ({ role, content }));

      const { reply } = await apiFetch<{ reply: string }>('/zen-chat', {
        method: 'POST',
        body: JSON.stringify({ messages: history }),
      });

      const botMsg: Message = { role: 'assistant', content: reply, id: uid() };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');

      if (voiceEnabled) speakText(reply);
    } catch (err: any) {
      setAvatarState('idle');
      setError(err.message || 'Could not reach Zen right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, voiceEnabled, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  const clearChat = () => {
    SS?.cancel();
    setSpeaking(false);
    setAvatarState('idle');
    setInput('');
    setError(null);
    const greeting: Message = {
      role: 'assistant', id: uid(),
      content: "Hey, I'm Zen 🌿 Your mental wellness companion. How are you feeling today?",
    };
    setMessages([greeting]);
    if (voiceEnabled) speakText(greeting.content);
  };

  const toggleVoice = () => {
    if (voiceEnabled) { SS?.cancel(); setSpeaking(false); setAvatarState('idle'); }
    setVoiceEnabled(v => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[600px]"
    >
      {/* ── LEFT — Avatar Panel ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 lg:w-72 xl:w-80 flex flex-col gap-3">

        {/* Avatar card */}
        <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a2617] via-[#0d5d3a] to-[#1a8a5a] flex flex-col items-center justify-center p-6 shadow-xl min-h-[260px] lg:min-h-0">

          {/* Ambient glow rings */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 rounded-full m-auto w-48 h-48 bg-[#10b981]/10 blur-3xl transition-all duration-700 ${avatarState === 'speaking' ? 'scale-125 opacity-100' : avatarState === 'listening' ? 'scale-110 opacity-80' : 'scale-100 opacity-40'}`} />
          </div>

          {/* Avatar circle */}
          <div className="relative z-10 mb-4">
            <div className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-[#10b981] to-[#0d5d3a] flex items-center justify-center shadow-2xl transition-all duration-500 ${avatarState === 'speaking' ? 'scale-105' : 'scale-100'}`}>
              {/* Face */}
              <div className="text-5xl lg:text-6xl select-none">🧘</div>

              {/* Speaking pulse rings */}
              <AnimatePresence>
                {(avatarState === 'speaking' || avatarState === 'listening') && (
                  <>
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-[#10b981]/40"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1 + i * 0.35, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Name & status */}
          <div className="relative z-10 text-center">
            <div className="text-white text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Zen</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                avatarState === 'speaking' ? 'bg-[#10b981] animate-pulse' :
                avatarState === 'listening' ? 'bg-yellow-400 animate-pulse' :
                avatarState === 'thinking' ? 'bg-blue-400 animate-pulse' :
                'bg-[#10b981]/50'
              }`} />
              <span className="text-[#10b981]/80 text-xs font-medium capitalize">
                {avatarState === 'idle' ? 'ready' :
                 avatarState === 'listening' ? 'listening...' :
                 avatarState === 'thinking' ? 'thinking...' :
                 'speaking...'}
              </span>
            </div>
          </div>

          {/* Waveform bars — shown while speaking/listening */}
          <AnimatePresence>
            {(avatarState === 'speaking' || avatarState === 'listening') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="relative z-10 flex items-end gap-0.5 mt-4 h-8"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-[#10b981]/70"
                    animate={{ height: ['4px', `${8 + Math.random() * 20}px`, '4px'] }}
                    transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls row */}
        <div className="flex gap-2">
          <button
            id="zen-voice-toggle"
            onClick={toggleVoice}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
              voiceEnabled
                ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white border-[#0d5d3a] dark:border-[#1a8a5a]'
                : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 dark:border-white/10'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button
            id="zen-clear-chat"
            onClick={clearChat}
            title="Start fresh"
            className="px-3 py-2.5 rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Tip card */}
        <div className="rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 bg-[#f7fbf8] dark:bg-[#111111] p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed">
              {!SR
                ? 'Type your message below — Zen will respond in text and voice.'
                : 'Hold the mic button to speak, or type your message below.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Conversation Panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm overflow-hidden">

        {/* Conversation header */}
        <div className="flex-shrink-0 px-5 py-3.5 border-b border-[#0d5d3a]/08 dark:border-white/08 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-sm">🧘</div>
          <div>
            <div className="text-sm font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Conversation with Zen</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Your private, safe space</div>
          </div>
          <div className="ml-auto text-xs text-[#4a7c5d] dark:text-gray-500 bg-[#f0fbf4] dark:bg-white/5 px-2 py-1 rounded-full">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar dot */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white'
                  : 'bg-gradient-to-br from-[#0d5d3a] to-[#10b981] text-white'
              }`}>
                {msg.role === 'user' ? 'U' : '🧘'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] sm:max-w-[65%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`text-xs font-semibold ${msg.role === 'user' ? 'text-right text-[#4a7c5d] dark:text-gray-400' : 'text-[#0d5d3a] dark:text-[#10b981]'}`}>
                  {msg.role === 'user' ? 'You' : 'Zen'}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white rounded-tr-sm shadow-lg shadow-[#0d5d3a]/15'
                    : 'bg-[#f7fbf8] dark:bg-[#1a1a1a] text-[#0a2617] dark:text-gray-100 border border-[#0d5d3a]/08 dark:border-white/08 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-xs">🧘</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/08 dark:border-white/08">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981]"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* ── Input bar ──────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-[#0d5d3a]/08 dark:border-white/08 px-4 sm:px-5 py-4">
          <div className="flex gap-2 items-center">

            {/* Mic button */}
            {SR && (
              <button
                id="zen-mic-btn"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                disabled={loading}
                title={listening ? 'Release to send' : 'Hold to speak'}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 ${
                  listening
                    ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30'
                    : 'bg-[#f0fbf4] dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/15 dark:border-white/10 hover:bg-[#e6f7ed] dark:hover:bg-white/5'
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Text input */}
            <input
              id="zen-text-input"
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? 'Listening...' : 'Type your message or hold mic to speak...'}
              disabled={loading}
              className="flex-1 bg-[#f7fbf8] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/30 transition disabled:opacity-60"
            />

            {/* Send button */}
            <button
              id="zen-send-btn"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] text-white flex items-center justify-center shadow-lg shadow-[#0d5d3a]/20 hover:shadow-[#0d5d3a]/30 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-[#4a7c5d]/60 dark:text-gray-600 mt-2.5">
            Zen is an AI companion, not a substitute for professional therapy. In crisis? Call iCall: 9152987821
          </p>
        </div>
      </div>
    </motion.div>
  );
}
