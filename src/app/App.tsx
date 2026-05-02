import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
import { apiFetch } from './api/client';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  
  // User states
  const [showAuth, setShowAuth] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Admin states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.fade-in-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.fade-in-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let alive = true;
    setCheckingSession(true);

    // Check both user and admin sessions concurrently
    Promise.all([
      apiFetch('/me').then(() => true).catch(() => false),
      apiFetch('/admin/me').then(() => true).catch(() => false)
    ]).then(([userRes, adminRes]) => {
      if (!alive) return;
      setAuthed(userRes);
      setAdminAuthed(adminRes);
      setCheckingSession(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div ref={mainRef} className="w-full overflow-x-hidden bg-background">
      {adminAuthed ? (
        <AdminDashboard
          onLogout={async () => {
            try {
              await apiFetch('/admin/logout', { method: 'POST' });
            } finally {
              setAdminAuthed(false);
              setShowAdminLogin(false);
            }
          }}
        />
      ) : showAdminLogin ? (
        <AdminLogin
          onBackHome={() => setShowAdminLogin(false)}
          onAdminAuthSuccess={() => setAdminAuthed(true)}
        />
      ) : authed ? (
        <Dashboard
          onLogout={async () => {
            try {
              await apiFetch('/auth/logout', { method: 'POST' });
            } finally {
              setAuthed(false);
            }
          }}
        />
      ) : showAuth ? (
        <AuthPage
          onBackHome={() => setShowAuth(false)}
          onAuthSuccess={() => {
            setAuthed(true);
            setShowAuth(false);
          }}
        />
      ) : (
        <>
          <Navigation 
            onGetStarted={() => setShowAuth(true)} 
            onAdminLoginTrigger={() => setShowAdminLogin(true)} 
          />
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

      {checkingSession && !showAuth && !authed && !adminAuthed && !showAdminLogin ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-white/90 backdrop-blur border border-[#0d5d3a]/15 px-4 py-2 text-xs text-[#4a7c5d] shadow-lg">
          Checking session…
        </div>
      ) : null}
    </div>
  );
}
