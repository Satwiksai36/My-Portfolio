'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { usePortfolio } from '@/lib/PortfolioContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/lib/ThemeProvider';

const NAV_LINKS = [
  { label: 'About', href: '#about', chevron: false },
  { label: 'My Journey', href: '#education', chevron: false },
  { label: 'Skills', href: '#skills', chevron: false },
  { label: 'Projects', href: '#projects', chevron: false },
  { label: 'Credentials', href: '#credentials', chevron: false },
  { label: 'Contact', href: '#contact', chevron: false },
];

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.75 };

function NavLink({
  label,
  href,
  chevron,
  isActive,
  isDark
}: {
  label: string;
  href: string;
  chevron: boolean;
  isActive: boolean;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-1 px-1.5 lg:px-3 py-2 rounded-full text-[0.64rem] lg:text-[0.72rem] font-medium tracking-widest uppercase transition-all duration-200 whitespace-nowrap"
      style={{
        fontFamily: 'Satoshi, system-ui, sans-serif',
        backgroundColor: (hovered || isActive) ? (isDark ? '#ffffff' : '#0a0a0a') : 'transparent',
        color: (hovered || isActive) ? (isDark ? '#0a0a0a' : '#ffffff') : (isDark ? '#ffffff' : '#0a0a0a'),
      }}
    >
      {label}
      {chevron && (
        <ChevronDown
          size={8}
          strokeWidth={2.5}
          style={{ color: (hovered || isActive) ? (isDark ? '#0a0a0a' : '#ffffff') : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)') }}
          className="mt-px"
        />
      )}
    </a>
  );
}

function HireBtn({ isDark }: { isDark: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-center rounded-full overflow-hidden transition-all duration-200 shrink-0 cursor-pointer pl-3 lg:pl-3.5 pr-[3px] py-[3px]"
      style={{
        backgroundColor: hovered
          ? (isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 10, 10, 0.85)')
          : (isDark ? '#ffffff' : '#0a0a0a'),
      }}
    >
      <span
        className="text-[0.65rem] lg:text-[0.72rem] font-medium tracking-widest uppercase whitespace-nowrap"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          color: isDark ? '#0a0a0a' : '#ffffff'
        }}
      >
        Hire Me
      </span>
      <span
        className="w-5.5 h-5.5 lg:w-6.5 lg:h-6.5 flex items-center justify-center rounded-full transition-colors ml-2 lg:ml-2.5 shrink-0"
        style={{
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        <ArrowRight
          size={9}
          style={{ color: isDark ? '#0a0a0a' : '#ffffff' }}
          className="group-hover:translate-x-0.5 transition-transform duration-200"
        />
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ONE pill. Spring-animates its width between compact and expanded.
   No AnimatePresence. No fading. Just physical expansion.
   Glass contrast is HIGH at default (top), lighter when expanded (scrolled).
  ═══════════════════════════════════════════════════════════════════════════ */
export function Navbar() {
  const { portfolioData } = usePortfolio();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [expandedW, setExpandedW] = useState(920);
  const [compactW, setCompactW] = useState(820);
  const [showDesktopActions, setShowDesktopActions] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  /* Measure available width for the expanded state */
  useEffect(() => {
    const calc = () => {
      const padding = Math.min(Math.max(window.innerWidth * 0.04, 20), 80);
      setExpandedW(Math.min(window.innerWidth - padding * 2, 920));
      setCompactW(Math.min(window.innerWidth - 32, 820));
      setShowDesktopActions(window.innerWidth >= 1024);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Show navbar immediately when user is scrolling
      setVisible(true);

      // Clear the previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Keep navbar visible if we are at the very top of the page
      if (window.scrollY <= 10) {
        return;
      }

      // Hide navbar after 800ms of scroll inactivity
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 10) {
          setVisible(false);
        }
      }, 800);
    };

    // Initial check
    if (window.scrollY <= 10) {
      setVisible(true);
    } else {
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 10) {
          setVisible(false);
        }
      }, 800);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  const isNavbarVisible = visible || mobileOpen || hovered;

  /* Scroll Spy to track active section */
  useEffect(() => {
    const sectionIds = ['home', 'about', 'education', 'skills', 'services', 'projects', 'credentials', 'contact'];

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    elements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const targetW = scrolled ? expandedW : compactW;

  return (
    <>
      {/* ══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <div data-theme="dark" className="fixed top-0 left-0 right-0 z-50 hidden lg:block pointer-events-none">

        {/* Centering wrapper — flex so no transform conflicts with Framer Motion */}
        <div className="absolute top-4 inset-x-0 flex justify-center">

          {/* THE pill — springs its width, centered by parent flex */}
          <motion.div
            animate={{
              width: targetW,
              y: isNavbarVisible ? 0 : -100,
              opacity: isNavbarVisible ? 1 : 0
            }}
            transition={{
              width: SPRING,
              y: SPRING,
              opacity: { duration: 0.25 }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`flex items-center rounded-full py-2.5 pl-3.5 lg:pl-5 pr-3.5 lg:pr-5 ${isNavbarVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              /* Glass: contrast by default, lighter on expand */
              backdropFilter: scrolled ? 'blur(16px)' : 'blur(28px)',
              WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(28px)',
              backgroundColor: scrolled ? 'rgba(10,10,10,0.75)' : 'rgba(10,10,10,0.95)',
              border: scrolled ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: scrolled
                ? '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 8px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'background-color 0.45s ease, backdrop-filter 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
            }}
          >
            {/* Logo — always left */}
            <a href="#" className="flex items-center shrink-0 mr-1 lg:mr-2.5" aria-label={portfolioData.brandName}>
              <Image
                src={portfolioData.logoWhiteHorizontal || '/logo/weblogo-white.png'}
                alt={portfolioData.brandName}
                width={160}
                height={40}
                priority
                className="block object-contain h-[22px] lg:h-[30px]"
                style={{ width: 'auto' }}
              />
            </a>

            {/* Separator */}
            <div className="h-5 w-px bg-white/8 shrink-0 mr-1.5 lg:mr-3" />

            {/* Left Spacer */}
            <div className="flex-1" />

            {/* Nav links */}
            <div className="flex items-center gap-0.5 lg:gap-1.5 shrink-0">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.label}
                  {...l}
                  isActive={activeSection === l.href.substring(1)}
                  isDark={true}
                />
              ))}
            </div>

            {/* Right Spacer */}
            <div className="flex-1" />

            {/* Separator */}
            <div className="h-5 w-px bg-white/8 shrink-0 ml-1.5 lg:ml-2 mr-1.5 lg:mr-3" />

            {/* Actions: Resume & Theme — only visible when scrolled and on wider screens */}
            <AnimatePresence>
              {scrolled && showDesktopActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto', marginRight: 10 }}
                  exit={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5 shrink-0 overflow-hidden whitespace-nowrap"
                >
                  <ThemeToggle variant="navbar" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA — always right */}
            <HireBtn isDark={true} />
          </motion.div>
        </div> {/* end centering wrapper */}
      </div>

      {/* ══ MOBILE ═══════════════════════════════════════════════════════════ */}
      <div data-theme="dark" className="fixed top-0 left-0 right-0 z-50 lg:hidden pointer-events-none">
        <motion.div
          animate={{
            y: isNavbarVisible ? 0 : -100,
            opacity: isNavbarVisible ? 1 : 0
          }}
          transition={{
            y: SPRING,
            opacity: { duration: 0.25 }
          }}
          className={isNavbarVisible ? 'absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto' : 'absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none'}
        >

          {/* Logo pill */}
          <a
            href="#"
            className="flex items-center rounded-full px-3.5 py-2.5"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 6px 28px rgba(0,0,0,0.40)',
            }}
          >
            <Image
              src={portfolioData.logoWhiteHorizontal || '/logo/weblogo-white.png'}
              alt={portfolioData.brandName}
              width={140}
              height={36}
              priority
              className="block object-contain"
              style={{ height: 26, width: 'auto' }}
            />
          </a>

          {/* Menu pill */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-2 rounded-full px-3.5 py-2.5"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 6px 28px rgba(0,0,0,0.40)',
            }}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.25 w-3.75">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-px bg-white w-full origin-center"
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                transition={{ duration: 0.16 }}
                className="block h-px bg-white w-full"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-px bg-white w-full origin-center"
              />
            </div>
          </button>
        </motion.div>

        {/* Mobile drawer — clips down from top */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={{ clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 min-h-screen bg-black/95 backdrop-blur-2xl pt-24 px-6 pb-10 flex flex-col pointer-events-auto"
            >
              {/* Visible close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between border-b border-white/8 py-5"
                >
                  <span
                    className="font-black tracking-[-0.04em] text-white"
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 8vw, 2.8rem)' }}
                  >
                    {link.label}
                  </span>
                  <ArrowRight size={18} className="text-white/20" />
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="mt-auto pt-8"
              >
                {/* Theme toggle row */}
                <ThemeToggle variant="mobile" />

                <div className="mt-4 flex flex-col gap-3">
                  {/* Hire Me Button */}
                  <button
                    onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent('open-contact-modal')); }}
                    className="flex items-center justify-center gap-3 rounded-full py-3.5 w-full cursor-pointer"
                    style={{
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <span
                      className="text-[0.78rem] font-semibold tracking-[0.18em] uppercase"
                      style={{
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        color: '#0a0a0a'
                      }}
                    >
                      Hire Me
                    </span>
                    <span
                      className="w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <ArrowRight
                        size={11}
                        style={{ color: '#0a0a0a' }}
                      />
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
