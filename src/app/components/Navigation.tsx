import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import PillNav from './PillNav';
import logo from '../../../asset/logo.png';

type NavigationProps = {
  onGetStarted: () => void;
  onAdminLoginTrigger?: () => void;
};

export default function Navigation({ onGetStarted, onAdminLoginTrigger }: NavigationProps) {
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

  return (
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
            ? 'bg-white/95 backdrop-blur-lg shadow-md border border-[#0d5d3a]/10 rounded-2xl sm:rounded-3xl'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.a
            href="#"
            onDoubleClick={(e) => {
              e.preventDefault();
              onAdminLoginTrigger?.();
            }}
            className="flex items-center gap-2 text-xl sm:text-2xl text-[#0a2617] whitespace-nowrap cursor-pointer select-none"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="ZenMind Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover pointer-events-none" />
            ZenMind
          </motion.a>

          {/* Centre nav links — desktop only, hidden on mobile */}
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

          {/* Get Started — far right, desktop only */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(13,93,58,0.25)' }}
            whileTap={{ scale: 0.96 }}
            onClick={onGetStarted}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0d5d3a] text-white rounded-full font-semibold text-sm shadow-md whitespace-nowrap"
          >
            Get Started
          </motion.button>

          {/* Mobile: hamburger from PillNav (rendered inside PillNav itself) */}
          <div className="sm:hidden">
            <PillNav
              logo={logo}
              logoAlt="ZenMind Logo"
              items={[...navItems, { label: 'Get Started', href: '#cta', alwaysSolid: true }]}
              activeHref=""
              ease="power2.easeOut"
              baseColor="#0d5d3a"
              pillColor="#ffffff"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#0d5d3a"
              showLogo={false}
              onItemClick={(item, event) => {
                if (item.href === '#cta') {
                  event.preventDefault();
                  onGetStarted();
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
