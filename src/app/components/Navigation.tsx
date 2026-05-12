import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import PillNav from './PillNav';
import StaggeredMenu from './StaggeredMenu';
import logo from '../../../asset/logo.png';

type NavigationProps = {
  onGetStarted: () => void;
  onAdminLoginTrigger?: () => void;
  onTherapistLoginTrigger?: () => void;
};

export default function Navigation({ onGetStarted, onAdminLoginTrigger, onTherapistLoginTrigger }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features',     href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Therapy',      href: '#therapy' },
    { label: 'About',        href: '#about' },
  ];

  // StaggeredMenu items — use scrollIntoView for anchors, callbacks for actions
  const mobileMenuItems = [
    {
      key: 'features',
      label: 'Features',
      onClick: () => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'how-it-works',
      label: 'How It Works',
      onClick: () => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'therapy',
      label: 'Therapy',
      onClick: () => document.querySelector('#therapy')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'about',
      label: 'About',
      onClick: () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      key: 'therapist-login',
      label: 'Therapist Login',
      onClick: () => onTherapistLoginTrigger?.(),
    },
    {
      key: 'get-started',
      label: 'Get Started',
      onClick: () => onGetStarted(),
    },
  ];

  return (
    <>
      {/* ── Desktop nav pill (sm and above only — StaggeredMenu handles mobile) ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden sm:flex fixed top-0 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
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
            {/* Logo — always visible */}
            <motion.a
              href="#"
              onDoubleClick={(e) => { e.preventDefault(); onAdminLoginTrigger?.(); }}
              className="flex items-center gap-2 text-xl sm:text-2xl text-[#0a2617] dark:text-white whitespace-nowrap cursor-pointer select-none"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <img src={logo} alt="ZenMind Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover pointer-events-none" />
              <span className="hidden sm:inline">ZenMind</span>
            </motion.a>

            {/* Centre pill nav — desktop only */}
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
            <div className="hidden sm:flex items-center gap-3">
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

            {/* Mobile: invisible spacer so logo stays flush left;
                StaggeredMenu renders its own toggle button in top-right */}
            <div className="sm:hidden w-24" aria-hidden="true" />
          </div>
        </motion.div>
      </motion.nav>

      {/* ── StaggeredMenu — mobile only (CSS hides it at ≥ 768px) ── */}
      <StaggeredMenu
        items={mobileMenuItems}
        colors={['#0a2617', '#0d5d3a']}
        accentColor="#10b981"
        displayItemNumbering={true}
        displaySocials={false}
      />
    </>
  );
}
