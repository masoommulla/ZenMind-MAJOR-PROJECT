import { useEffect, useState } from 'react';

const STAGES = [
  { at: 0,  text: 'CONNECTING TO SERVER' },
  { at: 25, text: 'ESTABLISHING SESSION' },
  { at: 55, text: 'LOADING RESOURCES' },
  { at: 80, text: 'PREPARING DASHBOARD' },
  { at: 93, text: 'ALMOST READY' },
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      const inc = p < 30 ? 2.8 : p < 65 ? 1.6 : p < 88 ? 0.7 : 0.15;
      p = Math.min(95, p + inc + Math.random() * inc * 0.5);
      setProgress(Math.floor(p));
    }, 220);
    return () => clearInterval(id);
  }, []);

  const stage = [...STAGES].reverse().find(s => progress >= s.at)?.text ?? STAGES[0].text;
  const dots = '.'.repeat((tick % 3) + 1).padEnd(3, '\u00a0');

  return (
    <div className="fixed inset-0 z-[9999] bg-[#071a0e] flex flex-col overflow-hidden select-none"
      style={{ fontFamily: 'Syne, monospace' }}>

      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #0d5d3a18 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8">
        <div>
          <div className="text-[#4a7c5d] text-[10px] tracking-[0.4em] uppercase mb-0.5">ZenMind System</div>
          <div className="text-[#c8e6c9] text-lg font-bold tracking-widest">WELLNESS PLATFORM</div>
        </div>
        <div className="text-right">
          <div className="text-[#4a7c5d] text-[10px] tracking-widest">STATUS</div>
          <div className="text-[#0d5d3a] text-xs font-bold tracking-wider mt-0.5">● STARTING UP</div>
        </div>
      </div>

      {/* Center — big counter */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="text-[#1a4d2e] text-[10px] tracking-[0.5em] uppercase mb-6">INITIALIZING</div>
        <div className="relative">
          {/* Faint ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border border-[#0d5d3a]/20" />
            <div className="absolute w-48 h-48 rounded-full border border-[#0d5d3a]/10" />
          </div>
          <div className="text-[#c8e6c9] font-black text-[clamp(80px,18vw,160px)] leading-none tabular-nums"
            style={{ textShadow: '0 0 60px #0d5d3a55' }}>
            {String(progress).padStart(2, '0')}
          </div>
        </div>
        <div className="mt-6 text-[#4a7c5d] text-[11px] tracking-[0.35em] uppercase min-h-[20px]">
          {stage}{dots}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="relative z-10 px-6 sm:px-10 pb-10">
        <div className="flex justify-between text-[#2d6b45] text-[10px] tracking-widest mb-2">
          <span>00</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
        {/* Track */}
        <div className="relative w-full h-[2px] bg-[#0d5d3a]/20">
          {/* Fill */}
          <div className="absolute left-0 top-0 h-full bg-[#0d5d3a] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }} />
          {/* Glow head */}
          <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#1a8a5a] shadow-[0_0_8px_#1a8a5a] transition-all duration-300"
            style={{ left: `calc(${progress}% - 4px)` }} />
          {/* Tick markers */}
          {[25, 50, 75].map(m => (
            <div key={m} className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-[#0d5d3a]/40"
              style={{ left: `${m}%` }} />
          ))}
        </div>
        <div className="mt-4 text-[#2d6b45] text-[10px] tracking-[0.3em] text-center">
          RENDER COLD START — SERVICE WAKING UP
        </div>
      </div>
    </div>
  );
}
