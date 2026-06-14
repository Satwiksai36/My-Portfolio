'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, type Theme } from '@/lib/ThemeProvider';
import { usePortfolio } from '@/lib/PortfolioContext';

/* ── Icons ────────────────────────────────────────────────────────────────── */
function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  );
}

function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function MonitorIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

/* ── Options ──────────────────────────────────────────────────────────────── */
const OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: 'light',  label: 'LIGHT',  Icon: SunIcon },
  { value: 'dark',   label: 'DARK',   Icon: MoonIcon },
];

/* ── ThemeToggle ────────────────────────────────────────────────────────────
   variant="corner"  → large squircle fixed to top-right corner (main usage)
   variant="mobile"  → horizontal pill row inside mobile drawer
   variant="navbar"  → small inline button for inside the nav pill (fallback)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeToggle({ variant = 'corner' }: { variant?: 'corner' | 'navbar' | 'mobile' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { portfolioData } = usePortfolio();
  const ref = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === 'dark';

  /* ── Mobile variant ─────────────────────────────────────────────────────── */
  if (variant === 'mobile') {
    return (
      <div className="relative flex items-center p-1 bg-white/5 border border-white/8 rounded-2xl w-full mt-6">
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="relative flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[12px] z-10 transition-colors duration-200"
              style={{
                color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                border: 'none',
                outline: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {active && (
                <motion.div
                  layoutId="active-theme-slider-mobile"
                  className="absolute inset-0 rounded-[12px] bg-white/10 border border-white/5 -z-1"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <Icon size={16} />
              <span className="text-[0.48rem] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Corner variant — fixed segmented control top-right ────────────────── */
  if (variant === 'corner') {
    return (
      <div ref={ref} className="fixed z-60 hidden lg:flex items-center gap-3" style={{ top: 12, right: 12 }}>
        {/* Resume Download Link */}
        <motion.a
          href={portfolioData.resumeUrl}
          download={portfolioData.resumeFilename || 'Resume.pdf'}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{
            scale: 1.04,
            backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,10,0.9)',
          }}
          whileTap={{ scale: 0.96 }}
          style={{
            height: 52,
            borderRadius: 20,
            padding: '0 1.25rem',
            background: isDark ? '#FFFFFF' : '#000000',
            border: 'none',
            boxShadow: isDark
              ? '0 6px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 6px 28px rgba(0,0,0,0.2)',
            color: isDark ? '#000000' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            textDecoration: 'none',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transition: 'color 0.2s ease, transform 0.2s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Resume</span>
        </motion.a>

        {/* Segmented Theme Slider Dock */}
        <div
          style={{
            height: 52,
            borderRadius: 20,
            background: isDark ? 'rgba(15, 15, 15, 0.65)' : 'rgba(245, 245, 245, 0.65)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark
              ? '0 6px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 6px 28px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            gap: '3px',
            position: 'relative',
          }}
        >
          {OPTIONS.map(({ value, Icon, label }) => {
            const active = theme === value;
            return (
              <motion.button
                key={value}
                onClick={() => setTheme(value)}
                className="relative flex items-center justify-center rounded-[16px] transition-colors duration-200"
                style={{
                  width: 44,
                  height: 44,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: active
                    ? (isDark ? '#000000' : '#FFFFFF')
                    : (isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'),
                  zIndex: 2,
                }}
                whileHover="hover"
                title={label}
              >
                {/* Active slider background pill */}
                {active && (
                  <motion.div
                    layoutId="active-theme-slider-corner"
                    className="absolute inset-0 rounded-[16px] -z-1"
                    style={{
                      background: isDark ? '#FFFFFF' : '#000000',
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(255,255,255,0.25)' 
                        : '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                  />
                )}
                
                {/* Hover outline highlight */}
                <motion.div
                  className="absolute inset-0 rounded-[16px] opacity-0 -z-1"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  }}
                  variants={{
                    hover: { opacity: active ? 0 : 1 }
                  }}
                  transition={{ duration: 0.15 }}
                />

                {/* Animated Icon */}
                <motion.span
                  className="flex items-center justify-center"
                  variants={{
                    hover: { 
                      scale: 1.15,
                      rotate: value === 'light' ? 30 : value === 'dark' ? -15 : 0
                    }
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Icon size={16} />
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Navbar inline variant (small circle, kept for fallback) ────────────── */
  const cycleTheme = () => {
    const cycle: Record<Theme, Theme> = { light: 'dark', dark: 'light', system: 'light' };
    setTheme(cycle[theme]);
  };

  return (
    <div className="relative shrink-0">
      <button
        onClick={cycleTheme}
        aria-label="Toggle theme"
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: '#ffffff',
          border: 'none',
          color: '#0a0a0a',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {theme === 'light' ? (
              <SunIcon size={13} />
            ) : (
              <MoonIcon size={13} />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
