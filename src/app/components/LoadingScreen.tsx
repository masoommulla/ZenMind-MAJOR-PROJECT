interface Props {
  apiReady: boolean;      // set true when backend responds
  onComplete: () => void; // called when bar reaches 100
}

import { useEffect, useRef, useState } from 'react';

const STAGES = [
  { at: 0,  text: 'CONNECTING TO SERVER' },
  { at: 22, text: 'ESTABLISHING SESSION' },
  { at: 48, text: 'LOADING RESOURCES' },
  { at: 72, text: 'PREPARING DASHBOARD' },
  { at: 91, text: 'ALMOST READY' },
];

export default function LoadingScreen({ apiReady, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  /* Dots animation */
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 700);
    return () => clearInterval(t);
  }, []);

  /* Progress tied to apiReady */
  useEffect(() => {
    const id = setInterval(() => {
      if (doneRef.current) return;
      let p = progressRef.current;

      if (apiReady) {
        // Backend responded — race to 100
        p = Math.min(100, p + 6);
      } else {
        // Crawl towards 88 — stop and wait
        const maxWait = 88;
        const inc = p < 25 ? 2.8 : p < 55 ? 1.8 : p < 78 ? 0.9 : 0.12;
        p = Math.min(maxWait, p + inc + Math.random() * 0.4);
      }

      progressRef.current = p;
      setProgress(Math.floor(p));

      if (p >= 100 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(id);
        setTimeout(onComplete, 350);
      }
    }, 180);
    return () => clearInterval(id);
  }, [apiReady, onComplete]);

  const stage = [...STAGES].reverse().find(s => progress >= s.at)?.text ?? STAGES[0].text;
  const dots = '.'.repeat((tick % 3) + 1).padEnd(3, '\u00a0');

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none"
      style={{ background: '#071a0e', fontFamily: 'Syne, monospace' }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, #0d5d3a 1px, transparent 1px)', backgroundSize: '38px 38px' }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-12 pt-8">
        <div>
          <div className="text-[#2d6b45] text-[9px] tracking-[0.4em] uppercase mb-1">ZenMind Platform</div>
          <div className="text-[#c8e6c9] text-lg font-bold tracking-widest">WELLNESS SYSTEM</div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[#2d6b45] text-[9px] tracking-widest uppercase">Status</div>
          <div className="text-[#1a8a5a] text-xs font-bold tracking-wider mt-0.5">● INITIALIZING</div>
        </div>
      </div>

      {/* Centre counter */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="text-[#2d6b45] text-[9px] tracking-[0.5em] uppercase mb-6">SYSTEM BOOT</div>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-64 h-64 rounded-full border border-[#0d5d3a]/15" />
          <div className="absolute w-52 h-52 rounded-full border border-[#0d5d3a]/08" />
          <div
            className="text-[#c8e6c9] font-black leading-none tabular-nums"
            style={{ fontSize: 'clamp(72px,15vw,150px)', textShadow: '0 0 80px #0d5d3a60' }}
          >
            {String(progress).padStart(2, '0')}
          </div>
        </div>
        <div className="mt-8 text-[#4a7c5d] text-[10px] tracking-[0.35em] uppercase min-h-[18px]">
          {stage}{dots}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-6 sm:px-12 pb-10">
        <div className="flex justify-between text-[#2d6b45] text-[9px] tracking-widest mb-2 px-px">
          <span>00</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
        <div className="relative w-full h-[2px] bg-[#0d5d3a]/20 rounded-full overflow-visible">
          <div
            className="absolute left-0 top-0 h-full bg-[#0d5d3a] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#22c55e] transition-all duration-200 ease-out"
            style={{ left: `calc(${progress}% - 5px)`, boxShadow: '0 0 10px #22c55e' }}
          />
          {[25, 50, 75].map(m => (
            <div key={m} className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-[#0d5d3a]/40" style={{ left: `${m}%` }} />
          ))}
        </div>
        <div className="mt-5 text-[#2d6b45] text-[9px] tracking-[0.3em] text-center uppercase">
          {apiReady ? 'SERVER ONLINE — LOADING DASHBOARD' : 'RENDER COLD START — SERVICE WAKING UP'}
        </div>
      </div>
    </div>
  );
}
