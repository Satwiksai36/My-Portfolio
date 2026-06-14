'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '@/lib/PortfolioContext';
import { useTheme } from '@/lib/ThemeProvider';
import { useIsMobile } from '@/lib/useIsMobile';

import { HangingProfile } from './HangingProfile';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

/* Word-by-word animated pull quote */
function AnimatedQuote({ inView, quoteWords }: { inView: boolean; quoteWords: string[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <p
      style={{
        fontFamily: 'var(--font-instrument), Georgia, serif',
        fontStyle: 'italic',
        fontSize: 'clamp(1.35rem, 3.5vw, 3.5rem)',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        color: isDark ? '#F0F0F0' : '#0A0A0A',
      }}
    >
      &ldquo;
      {quoteWords.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.55, delay: 0.05 + i * 0.045, ease: EASE }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
      &rdquo;
    </p>
  );
}

export function About() {
  const { portfolioData } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isMobile = useIsMobile(1024);

  const sectionInView = useInView(sectionRef, { once: true, margin: '-10%' });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      /* Horizontal rule draw-in */
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: lineRef.current, start: 'top 85%' },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full border-t"
      style={{
        background: isDark ? '#0A0A0A' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(5rem,10vw,11rem)] pb-[clamp(4.5rem,7vw,7.5rem)]">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[0.85rem] tracking-[0.22em] uppercase font-bold"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,10,0.55)',
            }}
          >
            01 / About
          </motion.span>
          <div
            ref={lineRef}
            className="flex-1 h-px"
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          className={`font-black tracking-tighter leading-[0.88] mb-[clamp(3rem,6vw,7rem)] overflow-visible ${isDark ? 'text-white' : 'text-black'}`}
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(4rem, 10vw, 13rem)',
          }}
        >
          {isMobile ? (
            <>
              About{' '}
              <span
                style={{
                  fontFamily: 'var(--font-instrument), Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: isDark ? 'rgba(240,240,240,0.30)' : 'rgba(10,10,10,0.30)',
                }}
              >
                Me
              </span>
            </>
          ) : (
            <>
              Ab<span className="relative inline-block overflow-visible select-none">
                o
                {/* The knot/loop of string wrapping around 'o' */}
                <span className="absolute bottom-[5%] left-1/2 -translate-x-1/2 translate-y-[20%] pointer-events-none z-20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
                    {/* Loop around 'o' bottom stroke */}
                    <ellipse
                      cx="12"
                      cy="10"
                      rx="8"
                      ry="4"
                      stroke="#FF3B30"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    {/* Knot core */}
                    <circle cx="12" cy="12" r="3.5" fill="#FF3B30" />
                    {/* Tied rope ends hanging down a bit */}
                    <path
                      d="M 10.5,14 C 9.5,16.5 8,18 7,19.5"
                      stroke="#FF3B30"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 13.5,14 C 14.5,16.5 16,18 17,19.5"
                      stroke="#FF3B30"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>

                {/* The hanging profile card component - using span to keep HTML phrasing validation inside h2 */}
                <span className="absolute top-[82%] left-1/2 -translate-x-1/2 z-10 w-[500px] max-w-[100vw] flex justify-center pointer-events-none">
                  <span className="pointer-events-auto block">
                    <HangingProfile />
                  </span>
                </span>
              </span>ut{' '}
              <span
                style={{
                  fontFamily: 'var(--font-instrument), Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: isDark ? 'rgba(240,240,240,0.30)' : 'rgba(10,10,10,0.30)',
                }}
              >
                Me
              </span>
            </>
          )}
        </motion.h2>

        {/* Grid: keeping text aligned to the right column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(3rem,6vw,8rem)]">
          {/* Left side: Spacing for the hanging profile card to swing */}
          <div className="flex justify-center items-start lg:pt-0 min-h-[610px]">
            {isMobile && <HangingProfile />}
          </div>

          {/* Right side text matter */}
          <div className="flex flex-col gap-10">
            <AnimatedQuote inView={sectionInView} quoteWords={portfolioData.aboutQuoteWords} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
              className="space-y-5"
            >
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
                  color: isDark ? 'rgba(240,240,240,0.55)' : 'rgba(10,10,10,0.55)',
                }}
              >
                {portfolioData.shortBio}
              </p>
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                  color: isDark ? 'rgba(240,240,240,0.70)' : 'rgba(10,10,10,0.70)',
                }}
              >
                {portfolioData.subBio}
              </p>
            </motion.div>

            {/* Download Resume Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              className="pt-2"
            >
              <motion.a
                href={portfolioData.resumeUrl}
                download={portfolioData.resumeFilename || 'Resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,10,0.9)',
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  border: 'none',
                  background: isDark ? '#FFFFFF' : '#000000',
                  color: isDark ? '#000000' : '#FFFFFF',
                  padding: '0.8rem 1.75rem',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'color 0.2s ease, transform 0.2s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Resume
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
