'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '@/lib/PortfolioContext';
import { EducationItem } from '@/lib/data';
import { useTheme } from '@/lib/ThemeProvider';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── EducationLogo component ─────────────────────────────────────────── */
function EducationLogo({ company, className = "w-3/5 h-3/5" }: { company: string; className?: string }) {
  const c = company.toLowerCase();

  if (c.includes('vit')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} text-indigo-400!`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M7 21v-6c0-2.8 2.2-5 5-5s5 2.2 5 5v6" />
        <path d="M12 12v9" />
        <path d="M2 17l10 5 10-5" />
      </svg>
    );
  }

  if (c.includes('sasi')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} text-emerald-400!`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M12 6h4" />
        <path d="M12 10h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`${className} text-amber-400!`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

/* ── Mobile card (vertical scroll) ──────────────────────────────────────── */
function MobileCard({ edu, index }: { edu: EducationItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-6%' });
  const num = String(index + 1).padStart(2, '0');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      ref={ref}
      className={`border-b py-10 px-6 ${isDark ? 'border-white/8' : 'border-black/8'}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {/* Top row: num + status */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[0.75rem] tracking-[0.24em] uppercase font-semibold ${isDark ? 'text-white/60' : 'text-black/60'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {num}
        </span>
        <span
          className={`text-[0.75rem] tracking-[0.18em] uppercase font-semibold ${isDark ? 'text-white/60' : 'text-black/60'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {edu.year.toLowerCase().includes('present') ? 'Ongoing' : 'Completed'}
        </span>
      </div>

      {/* Year */}
      <div
        className="leading-none select-none mb-6"
        style={{
          fontFamily: 'var(--font-instrument), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(3.5rem, 15vw, 6.5rem)',
          color: isDark ? 'rgba(240,240,240,0.6)' : 'rgba(10,10,10,0.6)',
          letterSpacing: '-0.04em',
        }}
      >
        {edu.year}
      </div>

      {/* Divider */}
      <div className={`w-full h-px mb-6 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

      {/* Role + branch + company */}
      <div className="flex items-start gap-5 mb-5">
        {/* Logo container */}
        <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center shrink-0 overflow-hidden relative ${isDark ? 'border-white/10 bg-white/2' : 'border-black/10 bg-black/2'}`}>
          {edu.logo ? (
            <img src={edu.logo} alt={edu.company} className="w-full h-full object-cover" />
          ) : (
            <EducationLogo company={edu.company} />
          )}
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-black tracking-[-0.03em] leading-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
            }}
          >
            {edu.role}
          </h3>
          {edu.branch && (
            <p
              className={`text-[0.88rem] tracking-wider font-extrabold mb-2.5 ${isDark ? 'text-white/75' : 'text-black/75'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              {edu.branch}
            </p>
          )}
          <p
            className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold mb-1.5 ${isDark ? 'text-white/60' : 'text-black/60'}`}
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            {edu.company}
          </p>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="flex items-center gap-3 mt-4.5 mb-6.5">
        <span
          className={`text-[0.7rem] tracking-[0.2em] uppercase font-bold ${isDark ? 'text-white/55' : 'text-black/55'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          Grade
        </span>
        <span
          className={`border text-[0.8rem] tracking-widest uppercase font-black px-3.5 py-1.5 rounded-full ${isDark ? 'border-white/15 bg-white/2 text-white/85' : 'border-black/15 bg-black/2 text-black/85'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {edu.type}
        </span>
      </div>

      {/* Description */}
      {edu.bullets && edu.bullets.length > 0 && (
        <ul className="mb-6 flex flex-col gap-2.5">
          {edu.bullets.map((b, i) => (
            <li
              key={i}
              className={`flex gap-2.5 leading-relaxed font-semibold ${isDark ? 'text-white/70' : 'text-black/70'}`}
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontSize: 'clamp(0.88rem, 3vw, 1rem)',
              }}
            >
              <span className={`mt-[0.45em] w-1 h-1 rounded-full shrink-0 ${isDark ? 'bg-white/55' : 'bg-black/55'}`} />
              {b}
            </li>
          ))}
        </ul>
      )}

      {/* Stack badges */}
      {edu.stack && edu.stack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {edu.stack.map((t) => (
            <span
              key={t}
              className={`border text-[0.65rem] tracking-widest uppercase font-semibold px-3 py-1.5 ${isDark ? 'border-white/20 bg-white/5 text-white/75' : 'border-black/20 bg-black/5 text-black/75'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Desktop panel (horizontal scroll) ──────────────────────────────────── */
function DesktopPanel({
  edu,
  index,
  total,
}: {
  edu: EducationItem;
  index: number;
  total: number;
}) {
  const num = String(index + 1).padStart(2, '0');
  const tot = String(total).padStart(2, '0');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={`relative shrink-0 h-full flex flex-col justify-between border-r ${isDark ? 'border-white/8' : 'border-black/8'}`}
      style={{
        width: '100vw',
        padding: 'clamp(6.5rem, 8vw, 8.5rem) clamp(2rem,5vw,5rem) clamp(2rem,4vw,4.5rem) clamp(2rem,5vw,5rem)'
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold ${isDark ? 'text-white/60' : 'text-black/60'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {num} · {edu.year.toLowerCase().includes('present') ? 'Ongoing' : 'Completed'}
        </span>
        <span
          className={`text-[0.85rem] tracking-[0.18em] uppercase font-bold tabular-nums ${isDark ? 'text-white/50' : 'text-black/50'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {num} / {tot}
        </span>
      </div>

      {/* Center: year + rule + content */}
      <div className="flex items-stretch flex-1 mt-8 mb-8 gap-0">
        {/* Year */}
        <div
          className="flex items-center shrink-0"
          style={{ width: 'clamp(220px, 32vw, 480px)' }}
        >
          {(() => {
            const parts = edu.year.split(/[–-]/).map((s) => s.trim());
            const hasRange = parts.length > 1;
            const textStyle = {
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(4rem, 9.5vw, 11.5rem)',
              color: isDark ? 'rgba(240,240,240,0.62)' : 'rgba(10,10,10,0.62)',
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              userSelect: 'none' as const,
            };

            if (hasRange) {
              return (
                <div className="flex flex-col justify-center w-full gap-0">
                  <span className="text-left" style={textStyle}>
                    {parts[0]}
                  </span>
                  <span className="text-center" style={textStyle}>
                    –
                  </span>
                  <span className="text-right" style={textStyle}>
                    {parts[1]}
                  </span>
                </div>
              );
            }

            return (
              <span className="text-left w-full block" style={textStyle}>
                {edu.year}
              </span>
            );
          })()}
        </div>

        {/* Vertical rule */}
        <div className={`w-px self-stretch mx-[clamp(2rem,3.5vw,4rem)] shrink-0 ${isDark ? 'bg-white/12' : 'bg-black/12'}`} />

        {/* Content */}
        <div className="flex flex-col justify-center gap-6 flex-1 min-w-0 max-w-3xl">
          {/* Header Row: Logo on left, Name/Branch/Company on right */}
          <div className="flex items-center gap-8">
            {/* Logo container */}
            <div className={`w-28 h-28 rounded-[24px] border flex items-center justify-center shrink-0 overflow-hidden relative shadow-md ${isDark ? 'border-white/10 bg-white/2' : 'border-black/10 bg-black/2'}`}>
              {edu.logo ? (
                <img src={edu.logo} alt={edu.company} className="w-full h-full object-cover" />
              ) : (
                <EducationLogo company={edu.company} />
              )}
            </div>

            {/* Text header block */}
            <div className="flex flex-col gap-4 min-w-0">
              <h3
                className="whitespace-nowrap"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 2.5vw, 3.2rem)',
                  color: isDark ? 'rgba(240,240,240,0.92)' : 'rgba(10,10,10,0.92)',
                  letterSpacing: '-0.035em',
                  lineHeight: 1.02,
                }}
              >
                {edu.role}
              </h3>
              {edu.branch && (
                <p
                  className={`text-[1.1rem] tracking-wide font-extrabold -mt-1.5 ${isDark ? 'text-white/75' : 'text-black/75'}`}
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {edu.branch}
                </p>
              )}
              <p
                className={`text-[1rem] tracking-[0.24em] uppercase font-bold ${isDark ? 'text-white/70' : 'text-black/70'}`}
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {edu.company}
              </p>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="flex items-center gap-3.5">
            <span
              className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold ${isDark ? 'text-white/55' : 'text-black/55'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              Grade
            </span>
            <span
              className={`border text-[0.85rem] tracking-widest uppercase font-black px-4.5 py-2 rounded-full ${isDark ? 'border-white/15 bg-white/2 text-white/85' : 'border-black/15 bg-black/2 text-black/85'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              {edu.type}
            </span>
          </div>

          {edu.bullets && edu.bullets.length > 0 && (
            <ul className="flex flex-col gap-2" style={{ maxWidth: '54ch' }}>
              {edu.bullets.map((b, i) => (
                <li
                  key={i}
                  className={`flex gap-2.5 leading-relaxed font-semibold ${isDark ? 'text-white/72' : 'text-black/72'}`}
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                  }}
                >
                  <span className={`mt-[0.5em] w-1 h-1 rounded-full shrink-0 ${isDark ? 'bg-white/55' : 'bg-black/55'}`} />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {edu.stack && edu.stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {edu.stack.map((t) => (
                <span
                  key={t}
                  className={`border text-[0.65rem] tracking-widest uppercase font-semibold px-3 py-1.5 ${isDark ? 'border-white/20 bg-white/5 text-white/75' : 'border-black/20 bg-black/5 text-black/75'}`}
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom scroll hint — first panel only */}
      {index === 0 && (
        <p
          className={`text-[0.75rem] tracking-[0.2em] uppercase font-bold ${isDark ? 'text-white/50' : 'text-black/50'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          Scroll to explore →
        </p>
      )}
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
export function Education() {
  const { portfolioData } = usePortfolio();
  const EDUCATION = portfolioData.education;
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (window.innerWidth < 1024) return; // desktop only

    const pin = pinRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!pin || !track) return;

    const ctx = gsap.context(() => {
      const getEnd = () => `+=${track.scrollWidth - window.innerWidth}`;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        role: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: getEnd,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: getEnd,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* Shared section header */
  const Header = (
    <div className="px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(4rem,8vw,10rem)] pb-[clamp(2rem,4vw,4rem)]">
      <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
        <motion.span
          className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          initial={{ opacity: 0, x: -16 }}
          animate={sectionInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          02 / My Journey
        </motion.span>
        <motion.div
          className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={sectionInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
        />
      </div>

      <h2
        className={`font-black tracking-[-0.04em] leading-[0.9] ${isDark ? 'text-white' : 'text-black'}`}
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 7vw, 8rem)',
        }}
      >
        <span className="inline-block overflow-hidden align-bottom pt-4 pb-6 mr-[0.22em] -mt-4 -mb-6">
          <motion.span
            className="block"
            initial={{ y: '110%' }}
            animate={sectionInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            My
          </motion.span>
        </span>
        {' '}
        <span className="inline-block overflow-hidden align-bottom pt-4 pb-6 px-6 -mt-4 -mb-6 -mx-6">
          <motion.span
            className="block"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              color: isDark ? 'rgba(240,240,240,0.28)' : 'rgba(10,10,10,0.28)',
            }}
            initial={{ y: '110%' }}
            animate={sectionInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            Journey
          </motion.span>
        </span>
      </h2>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="education"
      className={`w-full border-t ${isDark ? 'border-white/8' : 'border-black/8'}`}
    >
      {/* ── Mobile layout (< lg) ─────────────────────────────────────────── */}
      <div className="block lg:hidden relative overflow-hidden">
        {/* Video bg */}
        <video
          autoPlay muted loop playsInline preload="auto"
          poster="/ex_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/ex_video_opt.mp4" type="video/mp4" />
        </video>
        <div className={`absolute inset-0 z-1 pointer-events-none ${isDark ? 'bg-[#0A0A0A]/78' : 'bg-white/78'}`} />

        <div className="relative z-10">
          {Header}
          <div>
            {EDUCATION.map((edu, i) => (
              <MobileCard key={i} edu={edu} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop layout (≥ lg) ────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* Header sits above the pin — plain white bg */}
        <div style={{ background: isDark ? '#0A0A0A' : '#FFFFFF' }}>
          {Header}
        </div>

        {/* Pinned horizontal scroll */}
        <div ref={pinRef} data-cursor="drag" className="h-screen overflow-hidden relative">
          {/* Video bg — pinned with content */}
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          >
            <source src="/ex_video_opt.mp4" type="video/mp4" />
          </video>
          <div className={`absolute inset-0 z-1 pointer-events-none ${isDark ? 'bg-[#0A0A0A]/72' : 'bg-white/72'}`} />

          {/* Progress bar */}
          <div className={`absolute top-0 left-0 right-0 h-px z-20 pointer-events-none ${isDark ? 'bg-white/8' : 'bg-black/8'}`}>
            <div
              ref={progressRef}
              className={`h-full origin-left ${isDark ? 'bg-white/40' : 'bg-black/40'}`}
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          {/* Track */}
          <div
            ref={trackRef}
            className="relative z-10 flex h-full"
            style={{ width: `${EDUCATION.length * 100}vw` }}
          >
            {EDUCATION.map((edu, i) => (
              <DesktopPanel
                key={i}
                edu={edu}
                index={i}
                total={EDUCATION.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
