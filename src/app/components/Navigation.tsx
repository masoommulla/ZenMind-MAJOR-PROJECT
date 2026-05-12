import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';
import PillNav from './PillNav';
import logo from '../../../asset/logo.png';

type NavigationProps = {
  onGetStarted: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
};

export default function Navigation({ onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileOpen) {
      const close = () => setMobileOpen(false);
      window.addEventListener('scroll', close, { once: true });
      return () => window.removeEventListener('scroll', close);
    }
  }, [mobileOpen]);

  const navItems = [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapy',      href: '#therapy' },
    { label: 'About',        href: '#about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none"
      >
        <motion.div
          animate={{
            width: isScrolled ? 'min(94vw, 940px)' : 'min(96vw, 1280px)',
            marginTop: isScrolled ? '8px' : '0px',
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`pointer-events-auto px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 dark:bg-[#050505]/95 backdrop-blur-lg shadow-md border border-[#0d5d3a]/10 dark:border-white/10 rounded-2xl sm:rounded-3xl'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <motion.a
              href="#"
              onDoubleClick={(e) => { e.preventDefault(); onAdminLoginTrigger?.(); }}
              className="flex items-center gap-2 text-xl sm:text-2xl text-[#0a2617] dark:text-white whitespace-nowrap cursor-pointer select-none flex-shrink-0"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <img src={logo} alt="ZenMind Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover pointer-events-none" />
              ZenMind
            </motion.a>

            {/* Centre nav links — desktop only */}
            <div className="hidden sm:flex flex-1 justify-center">
              <PillNav
                logo={logo}
                logoAlt="ZenMind Logo"
                items={navItems}
                activeHref=""
                ease="power2.easeOut"
                baseColor="#0d5d3a"
                pillColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                pillTextColor="#0d5d3a"
                initialLoadAnimation
                showLogo={false}
              />
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onTherapistLoginTrigger}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#0d5d3a] dark:border-[#10b981] text-[#0d5d3a] dark:text-[#10b981] rounded-full font-semibold text-sm whitespace-nowrap hover:bg-[#0d5d3a]/5 transition-colors"
              >
                Therapist Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(13,93,58,0.25)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onGetStarted}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0d5d3a] dark:bg-[#10b981] text-white dark:text-[#050505] rounded-full font-semibold text-sm shadow-md whitespace-nowrap"
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-[#0d5d3a]/20 bg-white/80 dark:bg-white/10 text-[#0d5d3a] dark:text-white backdrop-blur transition hover:bg-[#f0fbf4] dark:hover:bg-white/20"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* ── Mobile full-screen sheet ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Sheet panel */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 z-50 sm:hidden bg-white/98 dark:bg-[#0a1f12]/98 backdrop-blur-xl shadow-2xl border-b border-[#0d5d3a]/12 dark:border-white/10 rounded-b-3xl overflow-hidden"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#0d5d3a]/08 dark:border-white/08">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="ZenMind" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-lg font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ZenMind
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#f0fbf4] dark:bg-white/10 flex items-center justify-center text-[#0d5d3a] dark:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.2 }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#0a2617] dark:text-gray-100 font-semibold text-base hover:bg-[#f0fbf4] dark:hover:bg-white/8 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981] flex-shrink-0" />
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {/* CTA buttons */}
              <div className="px-4 pb-5 pt-2 flex flex-col gap-2.5">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMobileOpen(false); onTherapistLoginTrigger?.(); }}
                  className="w-full py-3 rounded-2xl border border-[#0d5d3a] dark:border-[#10b981] text-[#0d5d3a] dark:text-[#10b981] font-semibold text-sm bg-transparent hover:bg-[#0d5d3a]/5 transition"
                >
                  Therapist Login
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMobileOpen(false); onGetStarted(); }}
                  className="w-full py-3 rounded-2xl bg-[#0d5d3a] text-white font-semibold text-sm shadow-lg shadow-[#0d5d3a]/25 hover:bg-[#0a4a2e] transition"
                >
                  Get Started — It's Free
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
