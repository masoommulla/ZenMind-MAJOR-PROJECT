import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero';
import Navigation from './components/Navigation';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import StorySection from './components/StorySection';
import TherapySection from './components/TherapySection';
import Statistics from './components/Statistics';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TherapistLogin from './components/TherapistLogin';
import TherapistDashboard from './components/TherapistDashboard';
import LoadingScreen from './components/LoadingScreen';
import ProductPage from './components/ProductPage';
import { apiFetch } from './api/client';


gsap.registerPlugin(ScrollTrigger);

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } },
  set: (k: string, v: boolean) => { try { v ? localStorage.setItem(k, '1') : localStorage.removeItem(k); } catch {} },
};

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  const [authed, setAuthed]           = useState(() => ls.get('zm_authed'));
  const [adminAuthed, setAdminAuthed] = useState(() => ls.get('zm_admin'));
  const [therapistAuthed, setTherapistAuthed] = useState(() => ls.get('zm_therapist'));
  const [meData, setMeData] = useState<any>(null); // prefetched /me data passed to Dashboard

  const [showAuth, setShowAuth]       = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTherapistLogin, setShowTherapistLogin] = useState(false);
  // Track which dashboard tab to open immediately after login
  const [loginIntent, setLoginIntent] = useState<'progress' | 'aichat' | 'therapy'>('progress');

  const [activeFooterPage, setActiveFooterPage] = useState<string | null>(null);

  /* Loading screen state — only for very first render */
  const [checking, setChecking] = useState(true);   // show loader?
  const [apiReady, setApiReady] = useState(false);  // backend responded?
  const isDashboard = adminAuthed || therapistAuthed || authed || activeFooterPage !== null;

  useEffect(() => {
    if (!isDashboard) {
      document.documentElement.classList.remove('dark');
    } else {
      const theme = localStorage.getItem('theme');
      const isDarkMode = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [isDashboard]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fade-in-section',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2,
          scrollTrigger: { trigger: '.fade-in-section', start: 'top 80%', toggleActions: 'play none none none' } }
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let alive = true;

    // Fetch /me and return the data (not just a boolean) so Dashboard can use it directly
    const verifyMe = async (): Promise<{ ok: boolean; data: any }> => {
      try {
        const data = await apiFetch<any>('/me', { timeoutMs: 15_000 });
        return { ok: true, data };
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('unauthori') || msg.includes('forbidden')) {
          return { ok: false, data: null };
        }
        return { ok: ls.get('zm_authed'), data: null }; // network error — keep cached state
      }
    };

    const verifyOther = async (path: string): Promise<boolean | null> => {
      try {
        await apiFetch(path, { timeoutMs: 15_000 });
        return true;
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('unauthori') || msg.includes('forbidden')) return false;
        return null;
      }
    };

    Promise.all([verifyMe(), verifyOther('/admin/me'), verifyOther('/therapist/me')]).then(([u, a, t]) => {
      if (!alive) return;
      setAuthed(u.ok); ls.set('zm_authed', u.ok);
      if (u.data) setMeData(u.data); // store prefetched profile
      if (a !== null) { setAdminAuthed(!!a); ls.set('zm_admin', !!a); }
      if (t !== null) { setTherapistAuthed(!!t); ls.set('zm_therapist', !!t); }
      setApiReady(true);
    });

    return () => { alive = false; };
  }, []);

  const logoutUser = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    setAuthed(false); ls.set('zm_authed', false);
  };

  const logoutAdmin = async () => {
    try { await apiFetch('/admin/logout', { method: 'POST' }); } catch {}
    setAdminAuthed(false); ls.set('zm_admin', false);
    setShowAdminLogin(false);
  };

  const logoutTherapist = async () => {
    try { await apiFetch('/therapist/logout', { method: 'POST' }); } catch {}
    setTherapistAuthed(false); ls.set('zm_therapist', false);
    setShowTherapistLogin(false);
  };

  /* Show loading screen only during initial check */
  if (checking) {
    return (
      <LoadingScreen
        apiReady={apiReady}
        onComplete={() => setChecking(false)}
      />
    );
  }

  return (
    <div ref={mainRef} className="w-full overflow-x-hidden bg-background">
      {adminAuthed ? (
        <AdminDashboard onLogout={logoutAdmin} />
      ) : showAdminLogin ? (
        <AdminLogin
          onBackHome={() => setShowAdminLogin(false)}
          onAdminAuthSuccess={() => {
            setAdminAuthed(true); ls.set('zm_admin', true); setShowAdminLogin(false);
          }}
        />
      ) : therapistAuthed ? (
        <TherapistDashboard onLogout={logoutTherapist} />
      ) : showTherapistLogin ? (
        <TherapistLogin
          onBackHome={() => setShowTherapistLogin(false)}
          onAuthSuccess={() => {
            setTherapistAuthed(true); ls.set('zm_therapist', true); setShowTherapistLogin(false);
          }}
        />
      ) : authed ? (
        <Dashboard onLogout={logoutUser} prefetchedMe={meData} initialTab={loginIntent} />
      ) : showAuth ? (
        <AuthPage
          onBackHome={() => setShowAuth(false)}
          onAuthSuccess={() => { setAuthed(true); ls.set('zm_authed', true); setShowAuth(false); }}
        />
      ) : (
        <>
          <Navigation
            onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
            onAdminLoginTrigger={() => setShowAdminLogin(true)}
            onTherapistLoginTrigger={() => setShowTherapistLogin(true)}
          />
          <Hero onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }} />
          <Features />
          <HowItWorks />
          <StorySection />
          <Statistics />
          <TherapySection onBookSession={() => { setLoginIntent('therapy'); setShowAuth(true); }} />
          <CTASection
            onGetStarted={() => { setLoginIntent('progress'); setShowAuth(true); }}
            onScheduleDemo={() => { setLoginIntent('therapy'); setShowAuth(true); }}
          />
          <Footer 
            onTherapistLoginTrigger={() => setShowTherapistLogin(true)} 
            onProductLinkClick={setActiveFooterPage} 
            onSupportLinkClick={(link) => {
              if (link === 'Feedback') {
                const el = document.getElementById('stories');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveFooterPage(link);
              }
            }}
          />
          {activeFooterPage && <ProductPage page={activeFooterPage} onClose={() => setActiveFooterPage(null)} />}

          {/* ── Robot Widget — only on the landing page, hidden when ProductPage is open ── */}
          {!activeFooterPage && (
            <RobotWidget onOpen={() => { setLoginIntent('aichat'); setShowAuth(true); }} />
          )}
        </>
      )}
    </div>
  );
}

/* ── Pure CSS Robot Widget — zero dependencies, zero lag ── */
function RobotWidget({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', bottom: '18px', right: '18px',
        zIndex: 9999, cursor: 'pointer',
        width: '72px', height: '90px',
        animation: 'robotFloat 3s ease-in-out infinite',
        filter: hovered ? 'drop-shadow(0 8px 24px rgba(13,93,58,0.55))' : 'drop-shadow(0 4px 12px rgba(13,93,58,0.3))',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.25s ease, filter 0.25s ease',
      }}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '105%', right: 0,
          background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)',
          color: '#fff', fontSize: '11px', fontWeight: 700,
          padding: '6px 12px', borderRadius: '10px', whiteSpace: 'nowrap',
          pointerEvents: 'none', boxShadow: '0 4px 14px rgba(13,93,58,0.4)',
          fontFamily: 'Inter,sans-serif', animation: 'fadeInUp 0.18s ease',
        }}>
          👋 Let&apos;s get started!
          <span style={{
            position: 'absolute', bottom: '-6px', right: '12px',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid #1a8a5a',
          }} />
        </div>
      )}

      {/* SVG Robot */}
      <svg viewBox="0 0 72 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Antenna */}
        <line x1="36" y1="8" x2="36" y2="18" stroke="#0d5d3a" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="36" cy="6" r="4" fill="#10b981" style={{ animation: 'antennaPulse 1.8s ease-in-out infinite' }}/>

        {/* Head */}
        <rect x="14" y="18" width="44" height="32" rx="10" fill="url(#headGrad)" />
        <rect x="14" y="18" width="44" height="32" rx="10" fill="none" stroke="#0d5d3a" strokeWidth="1.5"/>

        {/* Eyes */}
        <ellipse cx="26" cy="32" rx="6" ry="6" fill="#fff"/>
        <ellipse cx="46" cy="32" rx="6" ry="6" fill="#fff"/>
        <circle cx="27" cy="32" r="3.5" fill="#10b981" style={{ animation: 'eyeGlow 2s ease-in-out infinite' }}/>
        <circle cx="47" cy="32" r="3.5" fill="#10b981" style={{ animation: 'eyeGlow 2s ease-in-out infinite 0.1s' }}/>
        <circle cx="28" cy="31" r="1.2" fill="#fff"/>
        <circle cx="48" cy="31" r="1.2" fill="#fff"/>

        {/* Mouth */}
        <rect x="24" y="42" width="24" height="4" rx="2" fill="#0d5d3a" opacity="0.7"/>
        <rect x="27" y="42" width="5" height="4" rx="1" fill="#10b981" opacity="0.9"/>
        <rect x="34" y="42" width="5" height="4" rx="1" fill="#10b981" opacity="0.9"/>

        {/* Body */}
        <rect x="18" y="52" width="36" height="28" rx="8" fill="url(#bodyGrad)"/>
        <rect x="18" y="52" width="36" height="28" rx="8" fill="none" stroke="#0d5d3a" strokeWidth="1.5"/>

        {/* Chest panel */}
        <rect x="26" y="58" width="20" height="14" rx="4" fill="#0d5d3a" opacity="0.25"/>
        <circle cx="31" cy="65" r="3" fill="#10b981" opacity="0.9" style={{ animation: 'eyeGlow 1.6s ease-in-out infinite 0.3s' }}/>
        <circle cx="41" cy="65" r="3" fill="#10b981" opacity="0.5"/>
        <rect x="34" y="62" width="2" height="6" rx="1" fill="#10b981" opacity="0.7"/>

        {/* Left arm */}
        <rect x="6" y="54" width="10" height="22" rx="5" fill="url(#headGrad)" stroke="#0d5d3a" strokeWidth="1.5"
          style={{ transformOrigin:'8px 54px', animation: 'waveArm 2.5s ease-in-out infinite' }}/>

        {/* Right arm */}
        <rect x="56" y="54" width="10" height="22" rx="5" fill="url(#headGrad)" stroke="#0d5d3a" strokeWidth="1.5"/>

        {/* Legs */}
        <rect x="23" y="80" width="10" height="10" rx="4" fill="url(#headGrad)" stroke="#0d5d3a" strokeWidth="1.5"/>
        <rect x="39" y="80" width="10" height="10" rx="4" fill="url(#headGrad)" stroke="#0d5d3a" strokeWidth="1.5"/>

        <defs>
          <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6f4ea"/>
            <stop offset="100%" stopColor="#c8e6c9"/>
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4edda"/>
            <stop offset="100%" stopColor="#b2dfdb"/>
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        @keyframes robotFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes antennaPulse {
          0%,100% { r: 4; opacity:1; }
          50%      { r: 5.5; opacity:0.7; }
        }
        @keyframes eyeGlow {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        @keyframes waveArm {
          0%,100% { transform: rotate(0deg); }
          30%      { transform: rotate(-22deg); }
          60%      { transform: rotate(8deg); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
