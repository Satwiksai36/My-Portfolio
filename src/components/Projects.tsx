'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '@/lib/PortfolioContext';
import { Project, getAutoLogoUrl, normalizeIconUrl } from '@/lib/data';
import { useTheme } from '@/lib/ThemeProvider';
import { TECH_LOGOS } from './Stack';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Cube geometry ─────────────────────────────────────────────────────────────

// Which of the 6 cube faces is front-facing at each scroll stop
function faceAtStop(i: number): number {
  if (i < 6) return i;
  return 1 + ((i - 2) % 4);
}

// CSS 3D transforms for a 16:9 rectangular prism (depth = width).
// Side faces use --cw/2; top/bottom use --ch/2 so the box seals correctly.
const FACE_TRANSFORMS: string[] = [
  'rotateX(-90deg) translateZ(calc(var(--ch) / 2))', // 0 top
  'translateZ(calc(var(--cw) / 2))',                  // 1 front
  'rotateY(90deg) translateZ(calc(var(--cw) / 2))',   // 2 right
  'rotateY(180deg) translateZ(calc(var(--cw) / 2))',  // 3 back
  'rotateY(-90deg) translateZ(calc(var(--cw) / 2))',  // 4 left
  'rotateX(90deg) translateZ(calc(var(--ch) / 2))',   // 5 bottom
];

// Scroll stops: rotation state at each scene index
function buildStops(n: number): { rx: number; ry: number }[] {
  const base = [
    { rx: 90, ry: 0 },
    { rx: 0, ry: 0 },
    { rx: 0, ry: -90 },
    { rx: 0, ry: -180 },
    { rx: 0, ry: -270 },
    { rx: -90, ry: -360 },
  ];
  const out = base.slice(0, Math.min(n, 6));
  for (let i = 6; i < n; i++) {
    out.push({ rx: 0, ry: -360 - (i - 6) * 90 });
  }
  return out;
}



const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

function getCubeTransform(progress: number, sceneCount: number, stops: { rx: number; ry: number }[]): { rx: number; ry: number } {
  const t = progress * (sceneCount - 1);
  const i = Math.min(Math.floor(t), sceneCount - 2);
  const f = easeIO(t - i);
  const a = stops[i];
  const b = stops[i + 1];
  return { rx: a.rx + (b.rx - a.rx) * f, ry: a.ry + (b.ry - a.ry) * f };
}

function sceneFromProgress(progress: number, sceneCount: number): number {
  return Math.min(sceneCount - 1, Math.floor(progress * sceneCount));
}

// Compute which project image belongs on each face, pre-loading nearby stops
const SWAP_RADIUS = 3;

function deriveFaceImages(stopIdx: number, sceneCount: number, projects: Project[]): (number | null)[] {
  const images: (number | null)[] = Array(6).fill(null);
  for (let offset = -SWAP_RADIUS; offset <= SWAP_RADIUS; offset++) {
    const si = stopIdx + offset;
    if (si < 0 || si >= sceneCount) continue;
    const fi = faceAtStop(si);
    const pi = si - 1; // scene 0 is intro (no project image)
    if (pi >= 0 && pi < projects.length) {
      images[fi] = pi;
    }
  }
  return images;
}

// ─── Background canvas — tiny drifting particles ──────────────────────────────
function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    interface Dot {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      a: number;
      aMin: number;
      aMax: number;
      aDir: number;
      aSpd: number;
    }

    const isMobileDevice = window.innerWidth < 768;
    const COUNT = isMobileDevice ? 40 : 160;
    const make = (): Dot => {
      const isStar = Math.random() < 0.25;
      const aMax = isStar ? 0.12 + Math.random() * 0.1 : 0.04 + Math.random() * 0.06;
      const aMin = aMax * 0.15;
      return {
        x: Math.random() * (w || window.innerWidth),
        y: Math.random() * (h || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14 - 0.025, // slight upward float
        r: isStar ? 0.75 + Math.random() * 0.9 : 0.35 + Math.random() * 0.55,
        a: aMin + Math.random() * (aMax - aMin),
        aMin,
        aMax,
        aDir: Math.random() < 0.5 ? 1 : -1,
        aSpd: 0.00025 + Math.random() * 0.0005,
      };
    };

    const dots: Dot[] = Array.from({ length: COUNT }, make);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < -2) d.x = w + 2;
        else if (d.x > w + 2) d.x = -2;
        if (d.y < -2) d.y = h + 2;
        else if (d.y > h + 2) d.y = -2;

        d.a += d.aSpd * d.aDir;
        if (d.a >= d.aMax) { d.a = d.aMax; d.aDir = -1; }
        else if (d.a <= d.aMin) { d.a = d.aMin; d.aDir = 1; }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(240,240,240,${d.a.toFixed(3)})` : `rgba(10,10,10,${d.a.toFixed(3)})`;
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ProjectCard({ project, align }: { project: Project; align: 'left' | 'right' }) {
  const right = align === 'right';
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { portfolioData } = usePortfolio();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <div
      style={{
        padding: '1.75rem 1.5rem',
        background: isDark ? 'rgba(22,22,22,0.95)' : 'rgba(248,248,248,0.95)',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        borderLeft: right ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'),
        borderRight: right ? (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)') : 'none',
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: '2rem',
          height: '1px',
          background: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          marginBottom: '1.1rem',
          marginLeft: right ? 'auto' : 0,
        }}
      />

      {/* Category · year */}
      <p
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
          marginBottom: '0.75rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.category}&nbsp;·&nbsp;{project.year}
      </p>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(1.8rem, 3.2vw, 2.7rem)',
          letterSpacing: '-0.04em',
          lineHeight: 0.88,
          color: isDark ? 'rgba(240,240,240,0.92)' : 'rgba(10,10,10,0.92)',
          marginBottom: '0.9rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          color: isDark ? 'rgba(240,240,240,0.72)' : 'rgba(0,0,0,0.72)',
          marginBottom: '1rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.tagline}
      </p>

      {/* Stack pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '1.25rem',
          justifyContent: right ? 'flex-end' : 'flex-start',
        }}
      >
        {project.stack.map((t) => {
          const customLogoUrl = portfolioData.customTechLogos?.[t];
          const hasBuiltinLogo = !!TECH_LOGOS[t];
          const autoIcon = normalizeIconUrl(customLogoUrl || (hasBuiltinLogo ? undefined : getAutoLogoUrl(t)), isDark);
          const hasCustomLogo = autoIcon && !failedImages[autoIcon];
          return (
            <span
              key={t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.25rem 0.75rem',
                borderRadius: '100px',
              }}
            >
              {hasCustomLogo ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.45rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={autoIcon} 
                    alt={t} 
                    style={{ width: '12px', height: '12px', objectFit: 'contain' }} 
                    onError={() => setFailedImages(prev => ({ ...prev, [autoIcon]: true }))}
                  />
                </span>
              ) : hasBuiltinLogo ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.45rem' }}>
                  {TECH_LOGOS[t](12)}
                </span>
              ) : (
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    opacity: 0.45,
                    marginRight: '0.45rem',
                  }}
                />
              )}
              {t}
            </span>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: right ? 'flex-end' : 'flex-start',
          width: '100%',
        }}
      >
        {/* View Project — Primary solid button */}
        <a
          href={project.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: isDark ? '#FFFFFF' : '#000000',
            border: isDark ? '1px solid #FFFFFF' : '1px solid #000000',
            color: isDark ? '#0A0A0A' : '#FFFFFF',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.6rem 0',
            borderRadius: '100px',
            textDecoration: 'none',
            transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            boxShadow: isDark ? '0 4px 14px rgba(255, 255, 255, 0.1)' : '0 4px 14px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = isDark ? '#E5E5E5' : '#262626';
            el.style.borderColor = isDark ? '#E5E5E5' : '#262626';
            el.style.color = isDark ? '#0A0A0A' : '#FFFFFF';
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = isDark ? '0 6px 20px rgba(255, 255, 255, 0.15)' : '0 6px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = isDark ? '#FFFFFF' : '#000000';
            el.style.borderColor = isDark ? '#FFFFFF' : '#000000';
            el.style.color = isDark ? '#0A0A0A' : '#FFFFFF';
            el.style.transform = 'none';
            el.style.boxShadow = isDark ? '0 4px 14px rgba(255, 255, 255, 0.1)' : '0 4px 14px rgba(0, 0, 0, 0.1)';
          }}
        >
          View Project
          <ArrowUpRight size={14} />
        </a>

        {/* GitHub — Secondary outline button */}
        <a
          href={project.github || portfolioData.socials.github || 'https://github.com/Satwiksai36'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            color: isDark ? '#FFFFFF' : '#000000',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.6rem 0',
            borderRadius: '100px',
            textDecoration: 'none',
            transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = isDark ? '#FFFFFF' : '#000000';
            el.style.color = isDark ? '#0A0A0A' : '#FFFFFF';
            el.style.borderColor = isDark ? '#FFFFFF' : '#000000';
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'transparent';
            el.style.color = isDark ? '#FFFFFF' : '#000000';
            el.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
            el.style.transform = 'none';
          }}
        >
          GitHub
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function Projects() {
  const { portfolioData } = usePortfolio();
  const PROJECTS = portfolioData.projects;
  const SCENE_COUNT = PROJECTS.length + 1;
  const STOPS = useMemo(() => buildStops(SCENE_COUNT), [SCENE_COUNT]);

  const sectionRef = useRef<HTMLElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  // Direct DOM refs for HUD — avoids React re-renders on every scroll frame
  const hudPctRef = useRef<HTMLDivElement>(null);
  const hudFillRef = useRef<HTMLDivElement>(null);
  const hudSceneRef = useRef<HTMLDivElement>(null);
  const captionNumRef = useRef<HTMLDivElement>(null);
  const captionLabelRef = useRef<HTMLDivElement>(null);

  const [activeScene, setActiveScene] = useState(0);
  const activeSceneRef = useRef(0);
  const [faceImages, setFaceImages] = useState<(number | null)[]>(() => deriveFaceImages(0, SCENE_COUNT, PROJECTS));
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });

  // Watch for data changes and sync face images
  useEffect(() => {
    setFaceImages(deriveFaceImages(activeSceneRef.current, SCENE_COUNT, PROJECTS));
  }, [PROJECTS, SCENE_COUNT]);

  useEffect(() => {
    if (!sectionRef.current || !cubeRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self: ScrollTrigger) {
        const p = self.progress;

        // Cube rotation — direct DOM write, no React state
        const { rx, ry } = getCubeTransform(p, SCENE_COUNT, STOPS);
        cubeRef.current!.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

        // HUD percentage
        const pct = Math.round(p * 100);
        if (hudPctRef.current) {
          hudPctRef.current.textContent = String(pct).padStart(3, '0') + '%';
        }
        if (hudFillRef.current) {
          hudFillRef.current.style.width = `${pct}%`;
        }

        // Scene transition (fires only when crossing a scene boundary)
        const newScene = sceneFromProgress(p, SCENE_COUNT);
        if (newScene !== activeSceneRef.current) {
          activeSceneRef.current = newScene;

          const label =
            newScene === 0 ? 'OVERVIEW' : (PROJECTS[newScene - 1]?.category || 'PROJECT').toUpperCase();

          if (hudSceneRef.current) hudSceneRef.current.textContent = label;
          if (captionNumRef.current) {
            captionNumRef.current.textContent = String(newScene).padStart(2, '0');
          }
          if (captionLabelRef.current) captionLabelRef.current.textContent = label;

          setActiveScene(newScene);
          setFaceImages(deriveFaceImages(newScene, SCENE_COUNT, PROJECTS));
        }
      },
    });

    return () => trigger.kill();
  }, [SCENE_COUNT, PROJECTS, STOPS]);

  const project = activeScene > 0 ? PROJECTS[activeScene - 1] : null;
  // Odd scenes → left card, even scenes → right card
  const isRight = activeScene > 0 && activeScene % 2 === 0;

  return (
    <section
      ref={sectionRef}
      id="projects"
      style={{
        height: `${SCENE_COUNT * 100}vh`,
        background: isDark ? '#0A0A0A' : '#FFFFFF',
        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────────────── */}
      <div data-cursor="view" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* ── Background layer — no filter:blur so preserve-3d cube stays sharp ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <BackgroundCanvas />

          {/* Ambient orb 1 — top-left. Pure radial-gradient, no filter:blur. */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-15%',
              width: '75vw',
              height: '75vw',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.005) 40%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(0,0,0,0.015) 0%, rgba(0,0,0,0.005) 40%, transparent 70%)',
            }}
            animate={{ x: [0, 40, -25, 0], y: [0, 30, -40, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Ambient orb 2 — bottom-right */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: '-25%',
              right: '-18%',
              width: '70vw',
              height: '70vw',
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.012) 0%, rgba(255,255,255,0.004) 45%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(0,0,0,0.012) 0%, rgba(0,0,0,0.004) 45%, transparent 70%)',
            }}
            animate={{ x: [0, -35, 20, 0], y: [0, -25, 35, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Header container */}
        <div
          className="absolute top-7 left-1/2 -translate-x-1/2 z-20 w-full"
          style={{
            maxWidth: '1440px',
            padding: '0 clamp(1.25rem, 5vw, 5rem)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-h-[1.2rem]">
              <motion.span
                className={`hidden md:inline-block text-[0.85rem] tracking-[0.22em] uppercase font-bold shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                initial={{ opacity: 0, x: -16 }}
                animate={sectionInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: EASE }}
              >
                05 / Projects
              </motion.span>
              <motion.div
                className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                animate={sectionInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
              />
            </div>

            {/* HUD — top right */}
            <div className="text-right shrink-0">
              <div
                ref={hudPctRef}
                style={{
                  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  fontSize: '0.8rem',
                  letterSpacing: '0.18em',
                  color: isDark ? 'rgba(240,240,240,0.7)' : 'rgba(0,0,0,0.7)',
                  lineHeight: 1.2,
                }}
              >
                000%
              </div>
              <div
                style={{
                  width: '6rem',
                  height: '1px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  marginTop: '0.4rem',
                  marginLeft: 'auto',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  ref={hudFillRef}
                  style={{
                    position: 'absolute',
                    inset: '0 auto 0 0',
                    width: '0%',
                    background: isDark ? 'rgba(240,240,240,0.7)' : 'rgba(0,0,0,0.7)',
                  }}
                />
              </div>
              <div
                ref={hudSceneRef}
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: isDark ? 'rgba(240,240,240,0.6)' : 'rgba(0,0,0,0.6)',
                  marginTop: '0.3rem',
                }}
              >
                OVERVIEW
              </div>
            </div>
          </div>
        </div>

        {/* Nav dots — left (hidden on small screens) */}
        <div className="absolute left-7 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-2">
          {Array.from({ length: SCENE_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: i === activeScene
                  ? (isDark ? 'rgba(240,240,240,0.8)' : 'rgba(0,0,0,0.8)')
                  : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'),
                transform: i === activeScene ? 'scale(1.6)' : 'scale(1)',
                transition: 'background 0.3s, transform 0.3s',
              }}
            />
          ))}
        </div>

        {/* ── 3-D cube + mobile card ──────────────────────────────────────── */}
        <div
          className={`projects-cube-scene${activeScene > 0 ? ' scene-active' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1100px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            ref={cubeRef}
            style={
              {
                // 16:9 prism — depth equals width so all 4 side faces are 16:9
                '--cw': 'min(72vw, 700px)',
                '--ch': 'calc(var(--cw) * 9 / 16)',
                width: 'var(--cw)',
                height: 'var(--ch)',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(90deg) rotateY(0deg)',
                flexShrink: 0,
              } as React.CSSProperties
            }
          >
            {([0, 1, 2, 3, 4, 5] as const).map((fi) => {
              // Top (0) & bottom (5) cap the box — they must be square (width × width)
              // so the prism seals without gaps. Side faces use inset:0 (16:9).
              const isCapFace = fi === 0 || fi === 5;
              return (
                <div
                  key={fi}
                  style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: FACE_TRANSFORMS[fi],
                    background: isDark
                      ? `
                        repeating-linear-gradient(0deg,   rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 48px),
                        repeating-linear-gradient(90deg,  rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 48px),
                        #141415
                      `
                      : `
                        repeating-linear-gradient(0deg,   rgba(0,0,0,0.02) 0, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 48px),
                        repeating-linear-gradient(90deg,  rgba(0,0,0,0.02) 0, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 48px),
                        #f5f4f2
                      `,
                    // Cap faces: square (var(--cw) × var(--cw)), centered on the container
                    ...(isCapFace
                      ? {
                        left: 0,
                        right: 0,
                        top: 'calc(50% - var(--cw) / 2)',
                        width: 'var(--cw)',
                        height: 'var(--cw)',
                      }
                      : { inset: 0 }),
                  }}
                >
                  {faceImages[fi] !== null && (
                    <>
                      <Image
                        src={PROJECTS[faceImages[fi]!].image}
                        alt={PROJECTS[faceImages[fi]!].name}
                        fill
                        className="object-cover"
                        quality={90}
                        sizes="(max-width: 768px) 90vw, 1400px"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.28)',
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile card — directly below cube, hidden on md+ */}
          <div
            className="md:hidden"
            style={{
              marginTop: '0.75rem',
              width: 'min(72vw, 700px)',
              maxWidth: 'calc(100% - 2rem)',
              flexShrink: 0,
              pointerEvents: 'auto',
            }}
          >
            <AnimatePresence mode="wait">
              {activeScene > 0 && project && (
                <motion.div
                  key={`mob-${activeScene}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.32 }}
                >
                  <ProjectCard project={project} align="left" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Intro card — desktop (md+) fades out on scroll ───────────────── */}
        <AnimatePresence>
          {activeScene === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
              className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <div style={{ textAlign: 'center', maxWidth: '32rem', padding: '0 1.5rem' }}>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
                    marginBottom: '1.5rem',
                  }}
                >
                  Selected Work&nbsp;·&nbsp;{PROJECTS.length} Projects
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 0.88,
                    color: isDark ? 'rgba(240,240,240,0.92)' : 'rgba(10,10,10,0.92)',
                    marginBottom: '0.15em',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: isDark ? 'rgba(240,240,240,0.45)' : 'rgba(10,10,10,0.45)',
                    }}
                  >
                    Work
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(240,240,240,0.6)' : 'rgba(0,0,0,0.6)',
                    marginTop: '2rem',
                  }}
                >
                  Scroll to explore
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Intro title — mobile: slides from center → top as user scrolls ── */}
        <div
          className="md:hidden absolute left-1/2 z-10 pointer-events-none"
          style={{
            top: activeScene === 0 ? '50%' : '3.5rem',
            transform: `translateX(-50%) translateY(${activeScene === 0 ? '-50%' : '0'})`,
            transition: 'top 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)',
            textAlign: 'center',
            maxWidth: 'calc(100vw - 4rem)',
            width: 'max-content',
          }}
        >
          <AnimatePresence mode="wait">
            {activeScene === 0 ? (
              <motion.div
                key="mob-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
                    marginBottom: '1.25rem',
                  }}
                >
                  Selected Work&nbsp;·&nbsp;{PROJECTS.length} Projects
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(3rem, 9vw, 5.5rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 0.88,
                    color: isDark ? 'rgba(240,240,240,0.92)' : 'rgba(10,10,10,0.92)',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: isDark ? 'rgba(240,240,240,0.45)' : 'rgba(10,10,10,0.45)',
                    }}
                  >
                    Work
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(240,240,240,0.6)' : 'rgba(0,0,0,0.6)',
                    marginTop: '1.75rem',
                  }}
                >
                  Scroll to explore
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="mob-compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: isDark ? 'rgba(240,240,240,0.6)' : 'rgba(0,0,0,0.6)',
                    marginBottom: '0.4rem',
                  }}
                >
                  05 / Projects
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(2rem, 8vw, 3rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                    }}
                  >
                    Work
                  </span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Project cards — desktop left slot ─────────────────────────────── */}
        <div
          className="absolute hidden md:block z-10"
          style={{
            left: 'clamp(4rem, 7vw, 7rem)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(21rem, 28%)',
          }}
        >
          <AnimatePresence mode="wait">
            {!isRight && activeScene > 0 && project && (
              <motion.div
                key={`left-${activeScene}`}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.38 }}
              >
                <ProjectCard project={project} align="left" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Project cards — desktop right slot ────────────────────────────── */}
        <div
          className="absolute hidden md:block z-10"
          style={{
            right: 'clamp(4rem, 7vw, 7rem)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(21rem, 28%)',
          }}
        >
          <AnimatePresence mode="wait">
            {isRight && activeScene > 0 && project && (
              <motion.div
                key={`right-${activeScene}`}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.38 }}
              >
                <ProjectCard project={project} align="right" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Scene counter — bottom right ──────────────────────────────────── */}
        <div
          className="absolute bottom-7 right-8 z-20"
          style={{ pointerEvents: 'none', textAlign: 'right' }}
        >
          <span
            style={{
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
            }}
          >
            {String(activeScene).padStart(2, '0')}&nbsp;/&nbsp;{String(PROJECTS.length).padStart(2, '0')}
          </span>
        </div>

        {/* ── Face caption — bottom center ──────────────────────────────────── */}
        <div
          className="absolute bottom-7 left-1/2 z-20"
          style={{ transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}
        >
          <div
            ref={captionNumRef}
            style={{
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
              marginBottom: '0.2rem',
            }}
          >
            00
          </div>
          <div
            ref={captionLabelRef}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: isDark ? 'rgba(240,240,240,0.28)' : 'rgba(0,0,0,0.28)',
            }}
          >
            OVERVIEW
          </div>
        </div>

      </div>
    </section>
  );
}
