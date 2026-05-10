import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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

// Code-split Spline so it never blocks initial page render
const Spline = lazy(() => import('@splinetool/react-spline'));

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
        <Dashboard onLogout={logoutUser} prefetchedMe={meData} />
      ) : showAuth ? (
        <AuthPage
          onBackHome={() => setShowAuth(false)}
          onAuthSuccess={() => { setAuthed(true); ls.set('zm_authed', true); setShowAuth(false); }}
        />
      ) : (
        <>
          <Navigation onGetStarted={() => setShowAuth(true)} onAdminLoginTrigger={() => setShowAdminLogin(true)} onTherapistLoginTrigger={() => setShowTherapistLogin(true)} />
          <Hero onGetStarted={() => setShowAuth(true)} />
          <Features />
          <HowItWorks />
          <StorySection />
          <Statistics />
          <TherapySection />
          <CTASection onGetStarted={() => setShowAuth(true)} />
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

          {/* ── 3D Robot Widget (fixed bottom-right, lazy-loaded) ── */}
          <RobotWidget onOpen={() => setShowAuth(true)} />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RobotWidget
   - Uses @splinetool/react-spline (no iframe, cursor-aware)
   - Injected only after requestIdleCallback → zero render lag
   - Watermark overlay covers "Built with Spline" badge
───────────────────────────────────────────────────────── */
function RobotWidget({ onOpen }: { onOpen: () => void }) {
  const [ready, setReady]     = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Wait until browser is fully idle, then mount the heavy 3D scene
    const cb = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(cb, { timeout: 4000 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(cb, 3500);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '0px',
        right: '0px',
        width: '120px',
        height: '140px',
        zIndex: 9999,
        cursor: 'pointer',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Clickable invisible overlay on top so cursor interaction still works below */}
      <div
        onClick={onOpen}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          cursor: 'pointer',
          // Let mouse events pass through to Spline canvas for cursor tracking
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip on hover */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '105%',
          right: '4px',
          background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          padding: '6px 11px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 14px rgba(13,93,58,0.4)',
          fontFamily: 'Inter,sans-serif',
          zIndex: 10,
          animation: 'fadeInUp 0.18s ease',
        }}>
          👋 Let&apos;s get started!
          <span style={{
            position: 'absolute', bottom: '-6px', right: '12px',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1a8a5a',
          }} />
        </div>
      )}

      {ready ? (
        /* Spline scene — cursor tracking works natively on the canvas */
        <div
          onClick={onOpen}
          style={{ width: '240px', height: '260px', marginLeft: '-60px', marginTop: '-60px', position: 'relative' }}
        >
          <Suspense fallback={null}>
            <Spline
              scene="https://prod.spline.design/genkubgreetingrobot-CyA4TkBNYMI56xiY5EZhAr2D/scene.splinecode"
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>

          {/* ── Hide "Built with Spline" watermark (bottom-left of canvas) ── */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '120px',
            height: '28px',
            background: 'transparent',
            zIndex: 5,
            pointerEvents: 'none',
          }} />
        </div>
      ) : (
        /* Placeholder — pulsing robot emoji while idle callback fires */
        <div
          onClick={onOpen}
          style={{
            width: '64px',
            height: '64px',
            margin: '38px auto 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            animation: 'robotDotPulse 1.5s ease-in-out infinite',
            cursor: 'pointer',
          }}
        >🤖</div>
      )}

      <style>{`
        @keyframes robotDotPulse {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.12); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
