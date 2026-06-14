'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight } from 'lucide-react';
import { animate, createTimeline, scrambleText } from 'animejs';
import { usePortfolio } from '@/lib/PortfolioContext';
import { useTheme } from '@/lib/ThemeProvider';

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';
const EASE = [0.22, 1, 0.36, 1] as const;


function runScramble(el: HTMLElement, duration = 900, delay = 0) {
  animate(el, {
    innerHTML: scrambleText({
      chars: SCRAMBLE_CHARS,
      duration,
      delay,
      perturbation: 0.18,
      cursor: '█▓▒░',
      settleDuration: 280,
    }),
  });
}

export function Hero() {
  const { portfolioData } = usePortfolio();
  const containerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const STACK_TAGS = portfolioData.heroStackTags;

  useEffect(() => {
    // ── Scramble entrance ──────────────────────────────────────────────────────
    const tl = createTimeline({ delay: 180 });

    if (line1Ref.current && line2Ref.current && subRef.current) {
      tl.add(line1Ref.current, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration: 820,
          perturbation: 0.22,
          cursor: '█▓▒░',
          settleDuration: 260,
        }),
      });
      tl.add(line2Ref.current, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration: 820,
          perturbation: 0.22,
          cursor: '█▓▒░',
          settleDuration: 260,
        }),
      }, '-=680');
      tl.add(subRef.current, {
        innerHTML: scrambleText({
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz —',
          duration: 700,
          perturbation: 0.15,
          cursor: '░▒',
          settleDuration: 200,
        }),
      }, '-=500');
    }

    // ── GSAP: scroll shrink name ───────────────────────────────────────────────
    const ctx = gsap.context(() => {
      if (nameRef.current) {
        gsap.to(nameRef.current, {
          scale: 0.92,
          opacity: 0.4,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }, containerRef);

    // ── Hover replay ───────────────────────────────────────────────────────────
    const hoverTargets: [HTMLElement | null, number][] = [
      [line1Ref.current, 700],
      [line2Ref.current, 700],
      [subRef.current, 600],
    ];
    const cleanups: (() => void)[] = [];
    hoverTargets.forEach(([el, dur]) => {
      if (!el) return;
      const handler = () => runScramble(el, dur);
      el.addEventListener('pointerenter', handler);
      cleanups.push(() => el.removeEventListener('pointerenter', handler));
    });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="home"
      className={`relative w-full min-h-[115vh] overflow-hidden flex flex-col ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          key={portfolioData.heroVideo || "/hero_vid_revamp_opt.mp4"}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={portfolioData.heroPoster || "/hero_revamp_poster.jpg"}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={portfolioData.heroVideo || "/hero_vid_revamp_opt.mp4"} type="video/mp4" />
        </video>
        <div className={`absolute inset-0 z-1 pointer-events-none ${isDark ? 'bg-[#0A0A0A]/55' : 'bg-white/55'}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 w-full pl-[clamp(1rem,4vw,5rem)] pr-[clamp(1rem,8vw,14rem)]">

        {/* Main content — starts near top for cut effect */}
        <div
          className="flex flex-col flex-1 justify-start"
          style={{ paddingTop: 'clamp(1.5rem, 3vw, 3rem)' }}
        >

          {/* Status pill */}
          <motion.div
            className="flex items-center gap-3 mb-[clamp(1.5rem,3vw,3rem)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: EASE }}
          >
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-xs ${isDark
                ? 'border-white/15 bg-white/3 text-white/80'
                : 'border-black/15 bg-black/2 text-black/80'
                }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500"
                style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)' }}
              />
              <span
                className="text-[0.6rem] font-bold tracking-[0.2em] uppercase"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                }}
              >
                {portfolioData.availabilityStatus}
              </span>
            </span>
          </motion.div>

          {/* H1 — massive display name */}
          <h1
            ref={nameRef}
            className={`font-black leading-[0.88] tracking-tighter will-change-transform ${isDark ? 'text-white' : 'text-black'}`}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.8rem, 11.5vw, 14rem)',
            }}
          >
            <span ref={line1Ref} className="block cursor-default select-none">{portfolioData.firstName}</span>
            <span ref={line2Ref} className="block cursor-default select-none">{portfolioData.lastName}</span>
          </h1>

          {/* Italic serif tagline */}
          <p
            ref={subRef}
            className={`mt-[clamp(1rem,2.5vw,2.5rem)] cursor-default select-none ${isDark ? 'text-white/75' : 'text-black/75'}`}
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.25rem, 3vw, 3rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}
          >
            {portfolioData.tagline}
          </p>

          {/* Bottom row: CTA */}
          <div className="mt-[clamp(2rem,4vw,4rem)] flex flex-wrap items-center gap-4">
            <motion.a
              href="#projects"
              data-cursor="view"
              className={`group flex items-center gap-2 px-6 py-3.5 text-[0.7rem] font-medium tracking-[0.18em] uppercase transition-colors duration-200 ${isDark ? 'bg-white text-black hover:bg-white/80' : 'bg-black text-white hover:bg-black/80'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.1, ease: EASE }}
            >
              View Work
              <ArrowDownRight
                size={12}
                className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
              />
            </motion.a>
            <motion.button
              data-cursor="hire"
              onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
              className={`text-[0.7rem] font-medium tracking-[0.18em] uppercase px-6 py-3.5 transition-all duration-200 ${isDark
                ? 'bg-black text-white border border-white hover:bg-white hover:text-black'
                : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2, ease: EASE }}
            >
              Contact
            </motion.button>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-12"
            style={{
              background: `linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,10,0.60)'}, transparent)`
            }}
          />
          <span
            className="text-[0.55rem] tracking-[0.22em] uppercase"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(10,10,10,0.85)'
            }}
          >
            Scroll
          </span>
        </motion.div>
      </div>

      {/* Side label — desktop */}
      <div className="absolute right-[clamp(1rem,2vw,2.5rem)] top-[45%] -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-10">
        <span
          className="text-[0.55rem] tracking-[0.25em] uppercase [writing-mode:vertical-rl] rotate-180"
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(10,10,10,0.85)'
          }}
        >
          {portfolioData.heroSideLabel || `${portfolioData.title.split(' & ')[0]} · ${portfolioData.stats.find(s => s.label.includes('Experience'))?.target ?? 5}+ Years · Remote`}
        </span>
      </div>
    </section>
  );
}
