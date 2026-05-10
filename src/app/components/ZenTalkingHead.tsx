/**
 * ZenTalkingHead — Pure React animated doctor avatar.
 * No GLB, no Three.js, no external libraries.
 * Uses CSS keyframe animations + React state for lip-sync and idle behaviour.
 */

import { useEffect, useRef, useState } from 'react';

interface ZenTalkingHeadProps {
  speaking: boolean;
  text: string;
  onReady?: () => void;
}

/* ── Tiny seeded random for deterministic animations ── */
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/* ── Mouth shape for a character in speech ── */
function getMouthShape(char: string): { w: number; h: number } {
  const vowels: Record<string, { w: number; h: number }> = {
    a: { w: 22, h: 14 }, e: { w: 20, h: 10 }, i: { w: 14, h: 8 },
    o: { w: 18, h: 16 }, u: { w: 16, h: 12 },
  };
  const c = char.toLowerCase();
  if (vowels[c]) return vowels[c];
  if ('bmp'.includes(c)) return { w: 14, h: 2 };
  if ('sz'.includes(c)) return { w: 18, h: 5 };
  return { w: 16, h: 7 };
}

export default function ZenTalkingHead({ speaking, text, onReady }: ZenTalkingHeadProps) {
  const [blink, setBlink]             = useState(false);
  const [mouthW, setMouthW]           = useState(16);
  const [mouthH, setMouthH]           = useState(4);
  const [headTilt, setHeadTilt]       = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [eyeGaze, setEyeGaze]         = useState({ x: 0, y: 0 });
  const [lipIndex, setLipIndex]       = useState(0);

  const prevTextRef    = useRef('');
  const lipTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── onReady fires immediately — no loading needed ── */
  useEffect(() => { onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Blinking ── */
  useEffect(() => {
    const rng = seeded(42);
    function schedBlink() {
      const delay = 2500 + rng() * 3500;
      blinkTimerRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedBlink(); }, 130);
      }, delay);
    }
    schedBlink();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, []);

  /* ── Idle head bob + gaze ── */
  useEffect(() => {
    const rng = seeded(77);
    function schedIdle() {
      const delay = 2000 + rng() * 3000;
      idleTimerRef.current = setTimeout(() => {
        if (!speaking) {
          setHeadTilt((rng() - 0.5) * 6);
          setEyeGaze({ x: (rng() - 0.5) * 3, y: (rng() - 0.5) * 2 });
        }
        schedIdle();
      }, delay);
    }
    schedIdle();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [speaking]);

  /* ── Breathing animation ── */
  useEffect(() => {
    let up = true;
    breathTimerRef.current = setInterval(() => {
      setBreathScale(s => {
        const next = up ? s + 0.003 : s - 0.003;
        if (next >= 1.012) up = false;
        if (next <= 0.988) up = true;
        return next;
      });
    }, 60);
    return () => { if (breathTimerRef.current) clearInterval(breathTimerRef.current); };
  }, []);

  /* ── Lip-sync when speaking ── */
  useEffect(() => {
    if (lipTimerRef.current) clearInterval(lipTimerRef.current);

    if (!speaking || !text) {
      // Mouth closed
      setMouthW(16); setMouthH(3);
      return;
    }

    // Build sequence from text
    const chars = (text !== prevTextRef.current ? text : text + ' ').split('');
    prevTextRef.current = text;
    let idx = 0;
    setLipIndex(0);

    lipTimerRef.current = setInterval(() => {
      if (idx >= chars.length) {
        idx = 0; // loop
      }
      const shape = getMouthShape(chars[idx] || ' ');
      setMouthW(shape.w);
      setMouthH(shape.h);
      idx++;
    }, 80);

    return () => { if (lipTimerRef.current) clearInterval(lipTimerRef.current); };
  }, [speaking, text]);

  /* ── Reset mouth when not speaking ── */
  useEffect(() => {
    if (!speaking) {
      if (lipTimerRef.current) clearInterval(lipTimerRef.current);
      setMouthW(16); setMouthH(3);
    }
  }, [speaking]);

  const eyeScaleY = blink ? 0.08 : 1;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #071a0f 0%, #0c4a2a 55%, #0a3520 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,0.12) 0%, transparent 70%)',
      }} />

      {/* Particle dots */}
      <Particles />

      {/* ── Doctor figure ── */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '8%',
          transform: `translateX(-50%) rotate(${headTilt}deg) scale(${breathScale})`,
          transformOrigin: 'center bottom',
          transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
          width: 'clamp(140px, 60%, 220px)',
          aspectRatio: '1 / 1.5',
        }}
      >
        <svg
          viewBox="0 0 220 320"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Skin gradient */}
            <radialGradient id="skin" cx="45%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#f4c896" />
              <stop offset="100%" stopColor="#d4956a" />
            </radialGradient>
            {/* Coat gradient */}
            <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0f8f2" />
              <stop offset="100%" stopColor="#d8eede" />
            </linearGradient>
            {/* Hair */}
            <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d1a0a" />
              <stop offset="100%" stopColor="#1a0a00" />
            </linearGradient>
            {/* Eye */}
            <radialGradient id="iris" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4a9e70" />
              <stop offset="60%" stopColor="#1a6a40" />
              <stop offset="100%" stopColor="#0a3a20" />
            </radialGradient>
            {/* Stethoscope */}
            <linearGradient id="steth" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c0c0c0" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── White coat body ── */}
          <path
            d="M40 220 Q30 240 25 320 H195 Q190 240 180 220 Q160 210 110 210 Q60 210 40 220Z"
            fill="url(#coat)"
            stroke="#c8e4d0"
            strokeWidth="1"
          />
          {/* Coat lapels */}
          <path d="M110 210 L90 250 L80 320 H100 L110 260 L120 260 H140 L130 320 H110Z" fill="white" opacity="0.6" />
          <path d="M110 210 L130 250 L140 320 H120 L110 260Z" fill="white" opacity="0.4" />
          {/* Coat pocket */}
          <rect x="55" y="255" width="28" height="20" rx="3" fill="white" opacity="0.4" stroke="#b8d8c0" strokeWidth="0.5" />
          {/* Pen in pocket */}
          <rect x="66" y="250" width="4" height="22" rx="2" fill="#0d5d3a" />

          {/* ── Scrubs / shirt under coat ── */}
          <path
            d="M80 215 Q70 220 65 240 Q100 248 110 248 Q120 248 155 240 Q150 220 140 215Z"
            fill="#10b981"
            opacity="0.85"
          />

          {/* ── Neck ── */}
          <rect x="95" y="185" width="30" height="30" rx="8" fill="url(#skin)" />

          {/* ── Head ── */}
          <ellipse cx="110" cy="130" rx="62" ry="68" fill="url(#skin)" />
          {/* Jaw / chin shape */}
          <ellipse cx="110" cy="178" rx="42" ry="22" fill="url(#skin)" />

          {/* ── Hair ── */}
          <path
            d="M50 115 Q52 62 110 58 Q168 62 170 115 Q165 90 155 78 Q140 65 110 63 Q80 65 65 78 Q55 90 50 115Z"
            fill="url(#hair)"
          />
          {/* Side hair */}
          <path d="M50 115 Q44 130 46 148 Q52 135 56 120Z" fill="url(#hair)" />
          <path d="M170 115 Q176 130 174 148 Q168 135 164 120Z" fill="url(#hair)" />

          {/* ── Ears ── */}
          <ellipse cx="48" cy="135" rx="9" ry="13" fill="url(#skin)" />
          <ellipse cx="172" cy="135" rx="9" ry="13" fill="url(#skin)" />
          <ellipse cx="48" cy="135" rx="5" ry="8" fill="#e8a878" opacity="0.5" />
          <ellipse cx="172" cy="135" rx="5" ry="8" fill="#e8a878" opacity="0.5" />

          {/* ── Eyebrows ── */}
          <path d="M76 105 Q88 99 100 104" stroke="#4a2800" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M120 104 Q132 99 144 105" stroke="#4a2800" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* ── Eyes ── */}
          <g transform={`translate(88, 124)`}>
            <ellipse rx="12" ry="10" fill="white" />
            <ellipse
              rx="12" ry="10"
              fill="white"
              style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: 'center', transition: 'transform 0.08s' }}
            />
            <ellipse
              cx={eyeGaze.x} cy={eyeGaze.y}
              rx="7" ry="7"
              fill="url(#iris)"
              style={{ transition: 'cx 0.4s, cy 0.4s' }}
            />
            <ellipse cx={eyeGaze.x} cy={eyeGaze.y} rx="4" ry="4" fill="#0a1a10" />
            <ellipse cx={eyeGaze.x + 2} cy={eyeGaze.y - 2} rx="1.5" ry="1.5" fill="white" opacity="0.9" />
            {/* Eyelid */}
            <ellipse
              rx="12" ry="10"
              fill="#d4956a"
              opacity={blink ? 1 : 0}
              style={{ transition: 'opacity 0.06s' }}
            />
          </g>
          <g transform={`translate(132, 124)`}>
            <ellipse rx="12" ry="10" fill="white" />
            <ellipse
              rx="12" ry="10"
              fill="white"
              style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: 'center', transition: 'transform 0.08s' }}
            />
            <ellipse
              cx={eyeGaze.x} cy={eyeGaze.y}
              rx="7" ry="7"
              fill="url(#iris)"
              style={{ transition: 'cx 0.4s, cy 0.4s' }}
            />
            <ellipse cx={eyeGaze.x} cy={eyeGaze.y} rx="4" ry="4" fill="#0a1a10" />
            <ellipse cx={eyeGaze.x + 2} cy={eyeGaze.y - 2} rx="1.5" ry="1.5" fill="white" opacity="0.9" />
            <ellipse
              rx="12" ry="10"
              fill="#d4956a"
              opacity={blink ? 1 : 0}
              style={{ transition: 'opacity 0.06s' }}
            />
          </g>

          {/* ── Nose ── */}
          <path d="M104 142 Q110 155 116 142" stroke="#c08060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="103" cy="154" rx="5" ry="3.5" fill="#c9906a" opacity="0.5" />
          <ellipse cx="117" cy="154" rx="5" ry="3.5" fill="#c9906a" opacity="0.5" />

          {/* ── Mouth ── */}
          <g transform="translate(110, 170)">
            {/* Upper lip */}
            <path
              d={`M ${-mouthW / 2} 0 Q ${-mouthW / 4} ${-3} 0 ${-2} Q ${mouthW / 4} ${-3} ${mouthW / 2} 0`}
              fill="#b06040"
              style={{ transition: 'd 0.07s' }}
            />
            {/* Lower lip */}
            <ellipse
              rx={mouthW / 2}
              ry={mouthH / 2 + 1}
              cy={mouthH / 2}
              fill="#c07050"
              style={{ transition: 'rx 0.07s, ry 0.07s' }}
            />
            {/* Mouth opening / teeth */}
            {mouthH > 5 && (
              <>
                <ellipse rx={mouthW / 2 - 2} ry={mouthH / 2 - 1} cy={mouthH / 2} fill="#1a0808" />
                <rect
                  x={-(mouthW / 2 - 3)}
                  y={1}
                  width={mouthW - 6}
                  height={Math.min(mouthH / 2, 5)}
                  rx="2"
                  fill="white"
                  opacity="0.9"
                />
              </>
            )}
            {/* Smile lines */}
            <path
              d={`M ${-mouthW / 2} 0 Q ${-mouthW / 2 - 5} ${mouthH / 2} ${-mouthW / 2 + 2} ${mouthH + 2}`}
              stroke="#b06040" strokeWidth="1" fill="none" opacity="0.5"
            />
            <path
              d={`M ${mouthW / 2} 0 Q ${mouthW / 2 + 5} ${mouthH / 2} ${mouthW / 2 - 2} ${mouthH + 2}`}
              stroke="#b06040" strokeWidth="1" fill="none" opacity="0.5"
            />
          </g>

          {/* ── Stethoscope ── */}
          <path
            d="M88 198 Q75 205 72 220 Q68 238 76 244 Q84 250 90 244 Q96 238 92 222 Q108 218 128 222 Q124 238 130 244 Q136 250 144 244 Q152 238 148 220 Q145 205 132 198"
            fill="none"
            stroke="url(#steth)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="90" cy="245" r="5" fill="#888" />
          <circle cx="130" cy="245" r="5" fill="#888" />
          {/* Chest piece */}
          <circle cx="110" cy="220" r="8" fill="none" stroke="#aaa" strokeWidth="2.5" />
          <circle cx="110" cy="220" r="4" fill="#999" />

          {/* Listening pulse indicator */}
          {speaking && (
            <>
              <circle cx="110" cy="220" r="12" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="10;18;10" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </div>

      {/* ── Status badge ── */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm border transition-all duration-500 ${
          speaking
            ? 'bg-[#10b981]/20 border-[#10b981]/30 text-[#10b981]'
            : 'bg-white/5 border-white/10 text-white/40'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${speaking ? 'bg-[#10b981] animate-pulse' : 'bg-white/30'}`} />
          {speaking ? 'Speaking' : 'Ready'}
        </div>
      </div>
    </div>
  );
}

/* ── Floating particles for ambience ── */
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const rng = seeded(i * 17 + 3);
    return {
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * 2,
      duration: 3 + rng() * 4,
      delay: rng() * 3,
      opacity: 0.1 + rng() * 0.2,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#10b981]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float-${p.id % 3} ${p.duration}s ${p.delay}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0px) translateX(0)} 50%{transform:translateY(-6px) translateX(4px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0px) translateX(0)} 50%{transform:translateY(-10px) translateX(-3px)} }
      `}</style>
    </div>
  );
}
