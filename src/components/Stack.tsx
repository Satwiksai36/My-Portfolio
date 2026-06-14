'use client';

import { useEffect, useRef, useMemo, useState, Fragment } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTheme } from '@/lib/ThemeProvider';
import { usePortfolio } from '@/lib/PortfolioContext';
import { getAutoLogoUrl, normalizeIconUrl } from '@/lib/data';

// ─── Floating vocabulary ───────────────────────────────────────────────────────
const WORDS = [
  'Go', 'Python', 'TypeScript', 'JavaScript', 'SQL',
  'Next.js', 'React', 'Django', 'Node.js', 'Express',
  'TailwindCSS', 'GSAP', 'PostgreSQL', 'Redis', 'AWS',
  'Docker', 'Nginx', 'MongoDB', 'Microservices', 'REST APIs',
  'WebSockets', 'CI/CD Pipelines', 'System Design'
];

const LINE1 = 'Built to Scale.';
const LINE2 = 'Engineered.';



export const TECH_LOGOS: Record<string, (size?: number) => React.ReactNode> = {
  'Go': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#00ADD8">
      <path d="M14.153 11.455c.036-.308.056-.632.056-.968 0-4.66-3.87-8.438-8.608-8.438-2.617 0-4.945 1.153-6.52 2.98l.006.012c1.784-.716 3.864-.816 5.83-.243 4.29 1.252 6.64 5.626 5.253 9.774-.47 1.408-1.343 2.597-2.455 3.46 2.766-.566 5.093-2.614 6.438-6.577zm-9.066 3.018c.036-.307.056-.632.056-.968 0-4.66-3.87-8.438-8.608-8.438-2.618 0-4.946 1.153-6.52 2.98l.006.013c1.783-.717 3.864-.817 5.83-.244 4.29 1.253 6.64 5.627 5.253 9.775-.47 1.407-1.343 2.596-2.455 3.458 2.766-.565 5.093-2.613 6.438-6.576z" />
    </svg>
  ),
  'Python': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M11.895 2.012c-.672.003-1.32.054-1.905.152-1.636.275-2.072.846-2.072 2.112v1.547h4.085v.568H6.035c-1.343 0-2.368.74-2.657 2.09-.328 1.528-.317 2.553-.004 4.093.256 1.257 1.054 2.018 2.397 2.018h1.498v-2.109c0-1.579 1.222-2.825 2.775-2.825h4.047c1.332 0 2.21-.774 2.453-2.115.3-.654.3-3.13 0-4.084-.253-1.002-.942-1.442-2.148-1.442h-2.502v.002zm-1.893 1.17a.64.64 0 1 1 0 1.28.64.64 0 0 1 0-1.28z" fill="#3776AB" />
      <path d="M12.137 21.988c.672-.003 1.32-.054 1.905-.152 1.636-.275 2.072-.846 2.072-2.112v-1.547h-4.085v-.568h5.968c1.343 0 2.368-.74 2.657-2.09.328-1.528.317-2.553.004-4.093-.256-1.257-1.054-2.018-2.397-2.018H16.76v2.109c0 1.579-1.222 2.825-2.775 2.825h-4.047c-1.332 0-2.21.774-2.453 2.115-.3.654-.3 3.13 0 4.084.253 1.002.942 1.442 2.148 1.442h2.502v-.002zm1.893-1.17a.64.64 0 1 1 0-1.28.64.64 0 0 1 0 1.28z" fill="#FFE054" />
    </svg>
  ),
  'TypeScript': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#3178C6" rx="15" />
      <text x="22" y="72" fill="#FFF" fontSize="52" fontWeight="bold" fontFamily="sans-serif">TS</text>
    </svg>
  ),
  'JavaScript': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#F7DF1E" rx="15" />
      <text x="25" y="72" fill="#000" fontSize="52" fontWeight="bold" fontFamily="sans-serif">JS</text>
    </svg>
  ),
  'SQL': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E389B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  'Next.js': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.216 17.584l-5.632-7.262v7.262h-1.637v-9.584h1.564l5.352 6.892v-6.892h1.638v9.584h-1.285z" />
    </svg>
  ),
  'React': (size = 14) => (
    <svg width={size} height={size} viewBox="-11.5 -10.23 23 20.46" fill="none" stroke="#61DAFB" strokeWidth="1.5">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      <circle r="2" fill="#61DAFB" />
    </svg>
  ),
  'Django': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#092E20">
      <rect width="24" height="24" fill="#092E20" rx="3" />
      <text x="3.5" y="17" fill="#FFF" fontSize="13" fontWeight="bold" fontFamily="Georgia, serif">dj</text>
    </svg>
  ),
  'Node.js': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#339933">
      <path d="M12 1L3 6v12l9 5 9-5V6L12 1zm-1 16.5v-9L5.5 11 11 17.5zm2 0L18.5 11 13 8.5v9z" />
    </svg>
  ),
  'Express': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <text x="1.5" y="16" fontSize="11" fontWeight="bold" fontFamily="sans-serif">ex.</text>
    </svg>
  ),
  'TailwindCSS': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#06B6D4">
      <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.335,6.182,14.975,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.335,13.382,8.975,12,6.001,12z" />
    </svg>
  ),
  'GSAP': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#88CE02">
      <circle cx="12" cy="12" r="10" fill="#88CE02" />
      <text x="5" y="16.5" fill="#000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">G</text>
    </svg>
  ),
  'PostgreSQL': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#336791" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  'Redis': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#D82C20">
      <path d="M12 2L2 7l10 5 10-5-10-5zm0 15L3.5 12.75l1.5-1.5L12 15l7-3.75 1.5 1.5L12 17zm0 5L3.5 17.75l1.5-1.5L12 20l7-3.75 1.5 1.5L12 22z" />
    </svg>
  ),
  'AWS': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  'Docker': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2496ED">
      <path d="M13.9 8.2h2.2v2.2h-2.2zm2.6 0h2.2v2.2h-2.2zm-5.2 0h2.2v2.2h-2.2zm2.6-2.6h2.2v2.2h-2.2zm-5.2 0h2.2v2.2h-2.2zm-2.6 2.6h2.2v2.2H6.1zm2.6 0h2.2v2.2H8.7zm-5.2 0h2.2v2.2H3.5zm2.6 2.6H21c0-5.5-4.5-10-10-10S1 4.5 1 10h2.6v.8H1v1.6h5.2v-1.6H3.5V10.8z" />
    </svg>
  ),
  'Nginx': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#009639">
      <rect width="24" height="24" fill="#009639" rx="3" />
      <text x="6" y="16.5" fill="#FFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">N</text>
    </svg>
  ),
  'MongoDB': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#47A248">
      <path d="M12 1.5C9 4 7.5 8 7.5 11c0 3.5 2.25 7 4.5 9 2.25-2 4.5-5.5 4.5-9 0-3-1.5-7-4.5-9.5z" />
    </svg>
  ),
  'Microservices': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M12 7.5L5.5 15.5M12 7.5l6.5 8M5 18h14" />
    </svg>
  ),
  'REST APIs': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  ),
  'WebSockets': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />
    </svg>
  ),
  'CI/CD Pipelines': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 12h16M4 6h16M4 18h16" />
    </svg>
  ),
  'System Design': (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
};



interface FloatWord {
  id: number; word: string;
  x: number; y: number;
  rot: number; size: number;
  delay: number; dur: number;
  opacity: number;
}

const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;



const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({ target, suffix = '+', duration = 1600 }: { target: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setDisplay(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

export function Stack() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [words, setWords] = useState<FloatWord[]>([]);
  const { portfolioData } = usePortfolio();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const fg = isDark ? 'rgba(240,240,240,' : 'rgba(10,10,10,';
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Dynamic categories and words memoization based on context data
  const dynamicCategories = useMemo(() => {
    if (portfolioData.skills && portfolioData.skills.length > 0) {
      const grouped: Record<string, typeof portfolioData.skills> = {};
      portfolioData.skills.forEach((s) => {
        const cat = s.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      });
      return Object.entries(grouped).map(([title, skills], idx) => ({
        title,
        num: String(idx + 1).padStart(2, '0'),
        skills,
      }));
    }
    return [];
  }, [portfolioData.skills]);

  const dynamicWords = useMemo(() => {
    // Priority 1: explicit floatingWords set by admin
    if (portfolioData.floatingWords && portfolioData.floatingWords.length > 0) {
      return portfolioData.floatingWords;
    }
    // Priority 2: derive from skill names
    if (portfolioData.skills && portfolioData.skills.length > 0) {
      return portfolioData.skills.map((s) => s.name);
    }
    // Priority 3: hardcoded fallback
    return WORDS;
  }, [portfolioData.floatingWords, portfolioData.skills]);

  // Mouse-repulsion on title chars
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const RADIUS = 90;

    const onMove = (e: MouseEvent) => {
      charRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS && dist > 0) {
          const p = (RADIUS - dist) / RADIUS;
          const mx = (dx / dist) * p * -24;
          const my = (dy / dist) * p * -24;
          el.style.transform = `translate(${mx}px,${my}px) scale(${1 + p * 0.06})`;
          el.style.opacity = String(1 - p * 0.45);
        } else {
          el.style.transform = '';
          el.style.opacity = '';
        }
      });
    };

    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  // Calculate non-colliding positions for floating vocabulary items
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const generatePositions = () => {
      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.width === 0 || sectionRect.height === 0) return;

      // Find all elements we want to avoid
      const avoidElements = section.querySelectorAll('.avoid-float');
      const avoidRects = Array.from(avoidElements).map((el) => {
        const rect = el.getBoundingClientRect();
        // Add a safety buffer around the element
        const padding = 32;
        return {
          left: rect.left - sectionRect.left - padding,
          top: rect.top - sectionRect.top - padding,
          right: rect.right - sectionRect.left + padding,
          bottom: rect.bottom - sectionRect.top + padding,
        };
      });

      const placedWords: FloatWord[] = [];
      const MAX_WORDS = 12; // Extremely spacious and premium look

      for (let i = 0; i < MAX_WORDS; i++) {
        const wordText = dynamicWords[i % dynamicWords.length];

        // Randomize word properties
        const size = 1.0 + Math.random() * 0.95; // 1.0rem to 1.95rem
        const rot = (Math.random() - 0.5) * 14;
        const delay = Math.random() * 2.5;
        const dur = 6 + Math.random() * 5;
        const opacity = 0.45 + Math.random() * 0.35;

        // Estimate dimensions of the word on screen (size in rem, approx 16px base)
        const wordHeight = size * 16 * 1.25;
        const wordWidth = wordText.length * size * 16 * 0.65;

        let bestX = 0;
        let bestY = 0;
        let found = false;

        // Attempt to find a collision-free spot (up to 80 tries)
        for (let attempt = 0; attempt < 80; attempt++) {
          const pctX = 6 + Math.random() * 88;
          const pctY = 6 + Math.random() * 88;

          const pxX = (pctX / 100) * sectionRect.width;
          const pxY = (pctY / 100) * sectionRect.height;

          const candidateRect = {
            left: pxX - wordWidth / 2,
            top: pxY - wordHeight / 2,
            right: pxX + wordWidth / 2,
            bottom: pxY + wordHeight / 2,
          };

          // Check overlap with forbidden layout elements
          let intersectsAvoid = false;
          for (const rect of avoidRects) {
            if (
              candidateRect.left < rect.right &&
              candidateRect.right > rect.left &&
              candidateRect.top < rect.bottom &&
              candidateRect.bottom > rect.top
            ) {
              intersectsAvoid = true;
              break;
            }
          }

          if (intersectsAvoid) continue;

          // Check overlap with already placed words
          let intersectsOther = false;
          const horizontalGap = 120; // Increased spacing horizontally
          const verticalGap = 60;   // Increased spacing vertically

          for (const other of placedWords) {
            const otherPxX = (other.x / 100) * sectionRect.width;
            const otherPxY = (other.y / 100) * sectionRect.height;
            const otherSize = other.size;
            const otherHeight = otherSize * 16 * 1.25;
            const otherWidth = other.word.length * otherSize * 16 * 0.65;

            const otherRect = {
              left: otherPxX - otherWidth / 2 - horizontalGap,
              top: otherPxY - otherHeight / 2 - verticalGap,
              right: otherPxX + otherWidth / 2 + horizontalGap,
              bottom: otherPxY + otherHeight / 2 + verticalGap,
            };

            if (
              candidateRect.left < otherRect.right &&
              candidateRect.right > otherRect.left &&
              candidateRect.top < otherRect.bottom &&
              candidateRect.bottom > otherRect.top
            ) {
              intersectsOther = true;
              break;
            }
          }

          if (intersectsOther) continue;

          bestX = pctX;
          bestY = pctY;
          found = true;
          break;
        }

        if (found) {
          placedWords.push({
            id: i,
            word: wordText,
            x: round(bestX, 3),
            y: round(bestY, 3),
            rot: round(rot, 3),
            size: round(size, 4),
            delay: round(delay, 3),
            dur: round(dur, 3),
            opacity: round(opacity, 4),
          });
        }
      }

      setWords(placedWords);
    };

    // Calculate layout after mounting and fonts/styles are resolved
    const timer = setTimeout(generatePositions, 100);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(generatePositions, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [dynamicWords]);

  const l1Text = portfolioData.skillsHeadline1 || LINE1;
  const l2Text = portfolioData.skillsHeadline2 || LINE2;
  const l1 = l1Text.split('');
  const l2 = l2Text.split('');
  const l1Words = l1Text.split(' ');
  const l2Words = l2Text.split(' ');

  return (
    <section
      ref={sectionRef}
      id="skills"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'auto',
        background: isDark ? '#0A0A0A' : '#FFFFFF',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 'clamp(5rem, 10vw, 11rem)',
        paddingBottom: 'clamp(4.5rem, 9vw, 9.5rem)',
        overflow: 'hidden',
      }}
    >
      {/* ── Floating vocabulary ─────────────────────────────────────────────── */}
      {words.map((w) => (
        <motion.span
          key={w.id}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontFamily: 'var(--font-instrument), Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${w.size}rem`,
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, w.opacity, w.opacity * 0.7, w.opacity, 0],
            filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
            y: [8, 0, -4, 0, -8],
            color: isDark ? [
              'rgba(255,255,255,0.28)',
              'rgba(255,255,255,0.46)',
              'rgba(255,255,255,0.36)',
              'rgba(255,255,255,0.42)',
              'rgba(255,255,255,0.32)',
            ] : [
              'rgba(0,0,0,0.32)',
              'rgba(0,0,0,0.50)',
              'rgba(0,0,0,0.40)',
              'rgba(0,0,0,0.46)',
              'rgba(0,0,0,0.36)',
            ],
          }}
          transition={{
            duration: w.dur,
            delay: w.delay,
            repeat: Infinity,
            repeatDelay: w.dur * 0.8,
            ease: 'easeInOut',
          }}
        >
          {w.word}
        </motion.span>
      ))}

      {/* Ambient orb — top left */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-8%',
          width: '55vw',
          height: '55vw',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.015) 0%, rgba(0,0,0,0.005) 45%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Ambient orb — bottom right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.012) 0%, rgba(0,0,0,0.004) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Section label */}
      <div
        style={{
          maxWidth: '1440px',
          width: '100%',
          padding: '0 clamp(1.25rem,5vw,5rem)',
          marginBottom: 'clamp(2rem, 4vw, 3.5rem)',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.span
            className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -16 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            03 / Skills
          </motion.span>
          <motion.div
            className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={sectionInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
          />
        </div>
      </div>

      {/* ── Center content ──────────────────────────────────────────────────── */}
      <motion.div
        style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
        }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.7, ease: EASE }}
      >

        {/* Line 1 — heavy, interactive */}
        <div style={{ display: 'block' }}>
          <h2
            className="avoid-float"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(3.2rem, 10vw, 9.5rem)',
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              color: `${fg}0.92)`,
              display: 'inline-block',
              margin: 0,
            }}
          >
            {l1Words.map((word, wordIdx) => {
              const precedingText = l1Words.slice(0, wordIdx).join(' ');
              const startIndex = precedingText ? precedingText.length + 1 : 0;
              return (
                <Fragment key={wordIdx}>
                  {wordIdx > 0 && ' '}
                  <span className="inline-block whitespace-nowrap">
                    {word.split('').map((char, charIdx) => {
                      const globalIdx = startIndex + charIdx;
                      return (
                        <span
                          key={charIdx}
                          ref={(el) => { charRefs.current[globalIdx] = el; }}
                          style={{
                            display: 'inline-block',
                            transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                </Fragment>
              );
            })}
          </h2>
        </div>

        {/* Line 2 — italic serif, dim */}
        <div style={{ display: 'block' }}>
          <h2
            className="avoid-float"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(3.2rem, 10vw, 9.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
              color: `${fg}0.4)`,
              display: 'inline-block',
              margin: 0,
            }}
          >
            {l2Words.map((word, wordIdx) => {
              const precedingText = l2Words.slice(0, wordIdx).join(' ');
              const startIndex = precedingText ? precedingText.length + 1 : 0;
              return (
                <Fragment key={wordIdx}>
                  {wordIdx > 0 && ' '}
                  <span className="inline-block whitespace-nowrap">
                    {word.split('').map((char, charIdx) => {
                      const globalIdx = l1.length + startIndex + charIdx;
                      return (
                        <span
                          key={charIdx}
                          ref={(el) => { charRefs.current[globalIdx] = el; }}
                          style={{
                            display: 'inline-block',
                            transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                </Fragment>
              );
            })}
          </h2>
        </div>

        {/* Tagline */}
        <div style={{ display: 'block' }}>
          <motion.p
            className="avoid-float"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize: 'clamp(0.6rem, 1.4vw, 0.78rem)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: `${fg}0.7)`,
              maxWidth: '28rem',
              margin: 'clamp(2.2rem, 4.5vw, 3.5rem) auto clamp(1rem, 2vw, 1.5rem) auto',
              lineHeight: 2,
              display: 'inline-block',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            {portfolioData.skillsTagline || 'Production-grade systems built with a modern, battle-tested stack.'}
          </motion.p>
        </div>

        {/* Remodeled Skills Grid */}
        <motion.div
          className="avoid-float"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '78rem',
            margin: 'clamp(1.5rem, 3vw, 2.2rem) auto 0 auto',
            textAlign: 'left',
          }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.6 }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {dynamicCategories.map((cat, catIdx) => (
            <motion.div
              key={catIdx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
              }}
              whileHover={{
                y: -6,
                borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                transition: { duration: 0.3, ease: 'easeOut' }
              }}
              style={{
                background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: '8px',
                padding: 'clamp(1.0rem, 2vw, 1.35rem) clamp(1.25rem, 3vw, 1.75rem)',
                transition: 'border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '0.9rem',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                  paddingBottom: '0.6rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.0rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: `${fg}0.9)`,
                  }}
                >
                  {cat.title}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                    color: `${fg}0.45)`,
                  }}
                >
                  {cat.num}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.65rem',
                }}
              >
                {cat.skills.map((skillItem, skillIdx) => {
                  const skill = typeof skillItem === 'string'
                    ? { name: skillItem, percentage: 85, icon: undefined }
                    : skillItem;
                  const skillName = skill.name;
                  const isHovered = hoveredSkill === skillName;
                  const hasBuiltin = !!TECH_LOGOS[skillName];
                  const autoIcon = normalizeIconUrl(skill.icon || (hasBuiltin ? undefined : getAutoLogoUrl(skillName)), isDark);
                  const hasIcon = autoIcon && !failedImages[autoIcon];
                  return (
                    <motion.span
                      key={skillIdx}
                      onMouseEnter={() => setHoveredSkill(skillName)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      whileHover={{
                        scale: 1.05,
                        borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        color: `${fg}1.0)`,
                      }}
                      style={{
                        position: 'relative',
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        color: `${fg}0.75)`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: '100px',
                        padding: '0.45rem 1.0rem',
                        cursor: 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
                      }}
                    >
                      {hasIcon ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.55rem' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={autoIcon} 
                            alt={skillName} 
                            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                            onError={() => {
                              if (autoIcon) {
                                setFailedImages(prev => ({ ...prev, [autoIcon]: true }));
                              }
                            }}
                          />
                        </span>
                      ) : TECH_LOGOS[skillName] ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.55rem' }}>
                          {TECH_LOGOS[skillName](16)}
                        </span>
                      ) : null}
                      <span>{skillName}</span>

                      {/* Hover Tooltip Popover Card */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.92, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                            exit={{ opacity: 0, y: 12, scale: 0.92, x: '-50%' }}
                            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 12px)',
                              left: '50%',
                              zIndex: 100,
                              width: '165px',
                              background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.98)',
                              backdropFilter: 'blur(12px)',
                              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                              borderRadius: '16px',
                              padding: '1.1rem',
                              boxShadow: isDark
                                ? '0 12px 30px -10px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.05)'
                                : '0 12px 30px -10px rgba(0,0,0,0.15)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              pointerEvents: 'none',
                            }}
                          >
                            {/* Inner Logo Box */}
                            <div
                              style={{
                                width: '56px',
                                height: '56px',
                                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.65rem',
                              }}
                            >
                              {hasIcon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={autoIcon} 
                                  alt={skillName} 
                                  style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
                                  onError={() => {
                                    if (autoIcon) {
                                      setFailedImages(prev => ({ ...prev, [autoIcon]: true }));
                                    }
                                  }}
                                />
                              ) : TECH_LOGOS[skillName] ? (
                                TECH_LOGOS[skillName](28)
                              ) : (
                                <span className="text-[12px] opacity-40 font-bold uppercase" style={{ color: isDark ? '#ffffff' : '#000000' }}>{skillName.slice(0, 2)}</span>
                              )}
                            </div>

                            {/* Skill Name */}
                            <div
                              style={{
                                fontFamily: 'Satoshi, system-ui, sans-serif',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                color: isDark ? '#FFFFFF' : '#0A0A0A',
                                lineHeight: 1.2,
                              }}
                            >
                              {skillName}
                            </div>

                            {/* Category Subtitle */}
                            <div
                              style={{
                                fontFamily: 'Satoshi, system-ui, sans-serif',
                                fontWeight: 700,
                                fontSize: '0.52rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.48)',
                                marginTop: '0.25rem',
                                lineHeight: 1.1,
                              }}
                            >
                              {cat.title.toUpperCase()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>


      </motion.div>
    </section>
  );
}
