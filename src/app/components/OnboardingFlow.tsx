import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, Brain, Users, BookOpen, Target, Flame, Star, Sparkles, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';

interface Props {
  userName: string;
  onComplete: () => void;
}

const GOALS = [
  { id: 'reduce_anxiety',   icon: '😌', label: 'Reduce Anxiety',        desc: 'Calm racing thoughts & worry' },
  { id: 'better_sleep',     icon: '😴', label: 'Sleep Better',           desc: 'Build a healthy sleep routine' },
  { id: 'boost_mood',       icon: '☀️', label: 'Improve My Mood',        desc: 'Feel more positive day-to-day' },
  { id: 'manage_stress',    icon: '🧘', label: 'Manage Stress',          desc: 'Handle pressure more calmly' },
  { id: 'build_confidence', icon: '💪', label: 'Build Confidence',       desc: 'Strengthen self-belief' },
  { id: 'therapy',          icon: '🩺', label: 'Talk to a Therapist',    desc: 'Professional 1-on-1 support' },
  { id: 'mindfulness',      icon: '🌿', label: 'Practice Mindfulness',   desc: 'Stay present & grounded' },
  { id: 'social',           icon: '🤝', label: 'Improve Relationships',  desc: 'Connect better with others' },
];

const MOODS = ['😞','😕','😐','😊','😄'];
const STRESS = ['Very Low','Low','Moderate','High','Very High'];

const FEATURES = [
  { icon: <Brain className="w-8 h-8"/>, color: '#7c3aed', title: 'Zeni AI Companion', desc: 'Your 24/7 AI wellness friend — talk, vent, or get guided exercises anytime.' },
  { icon: <Heart className="w-8 h-8"/>, color: '#be123c', title: 'Therapy Hub', desc: 'Browse verified therapists and book video sessions in minutes.' },
  { icon: <Target className="w-8 h-8"/>, color: '#ea580c', title: 'Wellness Goals', desc: 'Set daily goals and build powerful streaks that keep you motivated.' },
  { icon: <BookOpen className="w-8 h-8"/>, color: '#0369a1', title: 'Reading Lists', desc: 'Therapist-curated articles, books and guides tailored to your needs.' },
  { icon: <Users className="w-8 h-8"/>, color: '#0d5d3a', title: 'Peer Circles', desc: 'Safe, moderated group spaces to share experiences with others.' },
  { icon: <Flame className="w-8 h-8"/>, color: '#d97706', title: 'Wellness Programs', desc: 'Structured multi-day programs for mindfulness, sleep and more.' },
];

const STEP_COUNT = 5;

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <motion.div key={i} animate={{ width: i === step ? 24 : 8, opacity: i <= step ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${i <= step ? 'bg-[#0d5d3a]' : 'bg-[#0d5d3a]/20'}`} />
      ))}
    </div>
  );
}

/* ── Step 0: Welcome ── */
function StepWelcome({ name, onNext }: { name: string; onNext: () => void }) {
  const first = name.split(' ')[0];
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 py-12 max-w-lg mx-auto">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center mb-8 shadow-xl shadow-[#0d5d3a]/30">
        <img src={logo} alt="ZenMind" className="w-16 h-16 rounded-2xl object-cover" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d5d3a]/10 border border-[#0d5d3a]/20 text-[#0d5d3a] text-sm font-bold mb-5">
          <Sparkles className="w-4 h-4" /> Welcome to ZenMind
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          Hi {first},<br />
          <span className="text-[#0d5d3a]">let's set you up.</span>
        </h1>
        <p className="text-base text-[#4a7c5d] leading-relaxed mb-10 max-w-sm mx-auto">
          This takes just 2 minutes. We'll personalise your ZenMind experience so every feature feels made for you.
        </p>
        <button onClick={onNext}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#0d5d3a] text-white font-black text-base hover:bg-[#0a4a2e] transition-all shadow-xl shadow-[#0d5d3a]/30 flex items-center justify-center gap-3 mx-auto">
          Get Started <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-[#4a7c5d]/70 mt-4">No pressure — you can skip anything</p>
      </motion.div>
    </div>
  );
}

/* ── Step 1: Goals ── */
function StepGoals({ selected, onToggle, onNext, onBack }: { selected: string[]; onToggle: (id: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#0a2617] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          What brings you here?
        </h2>
        <p className="text-sm text-[#4a7c5d]">Select all that resonate — we'll tailor your experience accordingly.</p>
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-y-auto pb-4">
        {GOALS.map((g, i) => {
          const active = selected.includes(g.id);
          return (
            <motion.button key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => onToggle(g.id)}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                active ? 'border-[#0d5d3a] bg-[#f0fbf4] shadow-md shadow-[#0d5d3a]/10' : 'border-[#0d5d3a]/10 bg-white hover:border-[#0d5d3a]/30'
              }`}>
              {active && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0d5d3a] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <span className="text-3xl mb-2">{g.icon}</span>
              <p className="text-xs font-bold text-[#0a2617] leading-tight">{g.label}</p>
              <p className="text-[10px] text-[#4a7c5d] mt-1 leading-tight hidden sm:block">{g.desc}</p>
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#0d5d3a]/10">
        <button onClick={onBack} className="text-sm font-semibold text-[#4a7c5d] hover:text-[#0d5d3a] transition">← Back</button>
        <button onClick={onNext}
          className="px-8 py-3 rounded-2xl bg-[#0d5d3a] text-white font-black text-sm hover:bg-[#0a4a2e] transition flex items-center gap-2 shadow-lg shadow-[#0d5d3a]/20">
          {selected.length === 0 ? 'Skip for now' : `Continue (${selected.length})`} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Mood + Stress ── */
function StepMood({ mood, stress, onMood, onStress, onNext, onBack }: {
  mood: number; stress: number; onMood: (v: number) => void; onStress: (v: number) => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-lg mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#0a2617] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          How are you feeling today?
        </h2>
        <p className="text-sm text-[#4a7c5d]">This helps us personalise your home screen right away.</p>
      </div>

      <div className="flex-1 space-y-10">
        {/* Mood */}
        <div>
          <p className="text-xs font-bold text-[#4a7c5d] uppercase tracking-widest mb-4">Current Mood</p>
          <div className="flex justify-between gap-2">
            {MOODS.map((emoji, i) => (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => onMood(i + 1)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  mood === i + 1 ? 'border-[#0d5d3a] bg-[#f0fbf4] shadow-md' : 'border-[#0d5d3a]/10 bg-white hover:border-[#0d5d3a]/25'
                }`}>
                <span className="text-3xl">{emoji}</span>
                <span className="text-[9px] font-bold text-[#4a7c5d] hidden sm:block">
                  {['Very Low','Low','Okay','Good','Great'][i]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stress */}
        <div>
          <p className="text-xs font-bold text-[#4a7c5d] uppercase tracking-widest mb-4">
            Stress Level — <span className="text-[#0d5d3a]">{STRESS[stress - 1] || 'Select'}</span>
          </p>
          <div className="relative pt-2">
            <div className="flex justify-between mb-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => onStress(v)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${
                    stress === v ? 'bg-[#0d5d3a] border-[#0d5d3a] text-white shadow-md' : 'border-[#0d5d3a]/15 text-[#4a7c5d] hover:border-[#0d5d3a]/30'
                  }`}>{v}</button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#4a7c5d]/60 px-1">
              <span>Very Low</span><span>Very High</span>
            </div>
          </div>
        </div>

        <div className="bg-[#f0fbf4] rounded-2xl p-4 border border-[#0d5d3a]/10">
          <p className="text-xs text-[#4a7c5d] leading-relaxed">
            🔒 <strong className="text-[#0a2617]">Private:</strong> This is only used to personalise your dashboard. It's never shared with anyone.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[#0d5d3a]/10">
        <button onClick={onBack} className="text-sm font-semibold text-[#4a7c5d] hover:text-[#0d5d3a] transition">← Back</button>
        <button onClick={onNext}
          className="px-8 py-3 rounded-2xl bg-[#0d5d3a] text-white font-black text-sm hover:bg-[#0a4a2e] transition flex items-center gap-2 shadow-lg shadow-[#0d5d3a]/20">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Features Tour ── */
function StepFeatures({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];
  return (
    <div className="flex flex-col h-full px-6 py-8 max-w-lg mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#0a2617] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Everything you need.
        </h2>
        <p className="text-sm text-[#4a7c5d]">A quick look at what ZenMind has in store for you.</p>
      </div>

      {/* Feature cards row */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {FEATURES.map((feat, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all w-20 ${
              active === i ? 'border-2 bg-white shadow-md' : 'border-transparent bg-[#f7fbf8] opacity-60 hover:opacity-80'
            }`} style={{ borderColor: active === i ? feat.color : 'transparent' }}>
            <span style={{ color: feat.color }}>{React.cloneElement(feat.icon, { className: 'w-5 h-5' })}</span>
            <span className="text-[9px] font-bold text-[#0a2617] text-center leading-tight">{feat.title.split(' ').slice(-1)[0]}</span>
          </button>
        ))}
      </div>

      {/* Active feature detail */}
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#0d5d3a]/10 shadow-sm p-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
            style={{ background: `${f.color}18`, color: f.color }}>
            {f.icon}
          </div>
          <h3 className="text-xl font-black text-[#0a2617] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
          <p className="text-sm text-[#4a7c5d] leading-relaxed max-w-xs">{f.desc}</p>
          <div className="flex gap-1.5 mt-6">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-[#0d5d3a]' : 'w-1.5 bg-[#0d5d3a]/20'}`} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-6 border-t border-[#0d5d3a]/10 mt-4">
        <button onClick={onBack} className="text-sm font-semibold text-[#4a7c5d] hover:text-[#0d5d3a] transition">← Back</button>
        <button onClick={onNext}
          className="px-8 py-3 rounded-2xl bg-[#0d5d3a] text-white font-black text-sm hover:bg-[#0a4a2e] transition flex items-center gap-2 shadow-lg shadow-[#0d5d3a]/20">
          Almost there <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: All Set ── */
function StepAllSet({ name, saving, onFinish }: { name: string; saving: boolean; onFinish: () => void }) {
  const first = name.split(' ')[0];
  const perks = [
    'AI Chat powered by Zeni — your 24/7 wellness companion',
    'Verified therapists available for same-day sessions',
    'Wellness goals, journals and streak tracking',
    'Private & secure — your data belongs to you',
  ];
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6 py-12 max-w-lg mx-auto">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center mb-8 shadow-2xl shadow-[#0d5d3a]/30">
        <Star className="w-14 h-14 text-white" fill="white" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          You're all set,<br /><span className="text-[#0d5d3a]">{first}!</span>
        </h1>
        <p className="text-base text-[#4a7c5d] mb-8">Your personalised ZenMind dashboard is ready.</p>
        <div className="text-left space-y-3 mb-10">
          {perks.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
              className="flex items-center gap-3 bg-[#f0fbf4] rounded-2xl px-4 py-3 border border-[#0d5d3a]/10">
              <div className="w-6 h-6 rounded-full bg-[#0d5d3a] flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-sm text-[#0a2617] font-semibold">{p}</p>
            </motion.div>
          ))}
        </div>
        <button onClick={onFinish} disabled={saving}
          className="w-full py-4 rounded-2xl bg-[#0d5d3a] text-white font-black text-base hover:bg-[#0a4a2e] transition-all shadow-xl shadow-[#0d5d3a]/30 flex items-center justify-center gap-3 disabled:opacity-60">
          {saving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : (
            <>Go to My Dashboard <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN ONBOARDING FLOW
══════════════════════════════════════════════════════ */
export default function OnboardingFlow({ userName, onComplete }: Props) {
  const [step, setStep]       = useState(0);
  const [goals, setGoals]     = useState<string[]>([]);
  const [mood, setMood]       = useState(3);
  const [stress, setStress]   = useState(3);
  const [saving, setSaving]   = useState(false);

  const toggleGoal = (id: string) =>
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const next = () => setStep(s => Math.min(STEP_COUNT - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const finish = async () => {
    setSaving(true);
    try {
      await apiFetch('/me/onboarding', {
        method: 'POST',
        body: JSON.stringify({ goals, currentMood: mood, stressLevel: stress }),
      });
    } catch { /* non-critical — still proceed */ }
    finally { setSaving(false); }
    onComplete();
  };

  const STEPS = [
    <StepWelcome name={userName} onNext={next} />,
    <StepGoals selected={goals} onToggle={toggleGoal} onNext={next} onBack={back} />,
    <StepMood mood={mood} stress={stress} onMood={setMood} onStress={setStress} onNext={next} onBack={back} />,
    <StepFeatures onNext={next} onBack={back} />,
    <StepAllSet name={userName} saving={saving} onFinish={finish} />,
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f7fbf8] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#0d5d3a]/08">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="ZenMind" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-black text-[#0a2617] text-base" style={{ fontFamily: 'Syne, sans-serif' }}>ZenMind</span>
        </div>
        <div className="flex items-center gap-4">
          <ProgressDots step={step} />
          <span className="text-xs font-semibold text-[#4a7c5d]">{step + 1} / {STEP_COUNT}</span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="h-full min-h-full">
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom skip — only steps 1-3 */}
      {step > 0 && step < 4 && (
        <div className="flex-shrink-0 px-6 pb-4 text-center">
          <button onClick={() => setStep(4)} className="text-xs font-semibold text-[#4a7c5d]/60 hover:text-[#4a7c5d] transition">
            Skip all → Go to dashboard
          </button>
        </div>
      )}
    </div>
  );
}
