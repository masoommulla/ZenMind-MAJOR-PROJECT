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
import LoadingScreen from './components/LoadingScreen';
import { apiFetch } from './api/client';

gsap.registerPlugin(ScrollTrigger);

/* ── helpers ── */
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } },
  set: (k: string, v: boolean) => { try { v ? localStorage.setItem(k, '1') : localStorage.removeItem(k); } catch {} },
};

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  /* Read from localStorage immediately so UI is stable on refresh */
  const [authed, setAuthed]           = useState(() => ls.get('zm_authed'));
  const [adminAuthed, setAdminAuthed] = useState(() => ls.get('zm_admin'));
  const [showAuth, setShowAuth]       = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [checking, setChecking]       = useState(true); // show loader while verifying

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

    /* Verify session — if network fails keep cached state; only sign out on 401/403 */
    const verify = async (path: string): Promise<boolean | null> => {
      try {
        await apiFetch(path, { timeoutMs: 30_000 });
        return true;
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        if (msg.includes('unauthori') || msg.includes('forbidden') || msg.includes('401') || msg.includes('403')) {
          return false; // definitive — not authenticated
        }
        return null; // network / timeout — keep cached state
      }
    };

    Promise.all([verify('/me'), verify('/admin/me')]).then(([u, a]) => {
      if (!alive) return;
      if (u !== null) { setAuthed(!!u);      ls.set('zm_authed', !!u); }
      if (a !== null) { setAdminAuthed(!!a); ls.set('zm_admin', !!a); }
      setChecking(false);
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

  /* Show full loading screen on first visit / cold start */
  if (checking) return <LoadingScreen />;

  return (
    <div ref={mainRef} className="w-full overflow-x-hidden bg-background">
      {adminAuthed ? (
        <AdminDashboard onLogout={logoutAdmin} />
      ) : showAdminLogin ? (
        <AdminLogin
          onBackHome={() => setShowAdminLogin(false)}
          onAdminAuthSuccess={() => { setAdminAuthed(true); ls.set('zm_admin', true); setShowAdminLogin(false); }}
        />
      ) : authed ? (
        <Dashboard onLogout={logoutUser} />
      ) : showAuth ? (
        <AuthPage
          onBackHome={() => setShowAuth(false)}
          onAuthSuccess={() => { setAuthed(true); ls.set('zm_authed', true); setShowAuth(false); }}
        />
      ) : (
        <>
          <Navigation onGetStarted={() => setShowAuth(true)} onAdminLoginTrigger={() => setShowAdminLogin(true)} />
          <Hero onGetStarted={() => setShowAuth(true)} />
          <Features />
          <HowItWorks />
          <StorySection />
          <Statistics />
          <TherapySection />
          <CTASection onGetStarted={() => setShowAuth(true)} />
          <Footer />
        </>
      )}
    </div>
  );
}
