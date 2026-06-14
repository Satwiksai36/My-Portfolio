'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '@/lib/PortfolioContext';

export function PageLoader({ onDone }: { onDone: () => void }) {
  const { portfolioData } = usePortfolio();
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const countRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();

    // 1. Fade in the logo container
    tl.to(logoRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    });

    /* ── Count 0 → 100 over 2.6s ─────────────────────────────────────────── */
    const DURATION = 2600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setCount(Math.round(e * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ── Progress line ───────────────────────────────────────────────────── */
    gsap.to(lineRef.current, {
      scaleX: 1,
      duration: 2.6,
      ease: 'power2.inOut',
    });

    /* ── Dot pulse ───────────────────────────────────────────────────────── */
    gsap.to(dotRef.current, {
      opacity: 0.15,
      repeat: -1,
      yoyo: true,
      duration: 0.6,
      ease: 'power1.inOut',
    });

    /* ── Exit sequence ───────────────────────────────────────────────────── */
    const exitTl = gsap.timeline({
      delay: 3.1,
      onComplete: () => {
        document.body.style.overflow = '';
        onDoneRef.current();
      },
    });

    // Fade out logo, counter, label
    exitTl.to([logoRef.current, countRef.current, labelRef.current], {
      opacity: 0,
      y: -16,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.05,
    });

    // Slide up panels staggered (creates the rising horizontal boundary line reveal)
    panelRefs.current.forEach((panel, i) => {
      exitTl.to(
        panel,
        { y: '-100%', duration: 0.8, ease: 'power4.inOut' },
        0.2 + i * 0.07,
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 overflow-hidden">

      {/* ── 5 vertical panels ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { panelRefs.current[i] = el; }}
            className="flex-1"
            style={{ backgroundColor: '#0A0A0A' }}
          />
        ))}
      </div>

      {/* ── Logo — center ──────────────────────────────────────────────────── */}
      <div
        ref={logoRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none gap-2"
        style={{ opacity: 0 }}
      >
        {/* Brand Logo in big size */}
        {portfolioData.logoWhite ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portfolioData.logoWhite}
            alt={portfolioData.brandName || 'Logo'}
            style={{
              height: 'clamp(6rem, 16vw, 11rem)',
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.9,
              userSelect: 'none',
            }}
            draggable={false}
          />
        ) : (
          <h1
            className="flex flex-wrap justify-center items-center select-none"
            style={{
              fontFamily: 'var(--font-special-gothic), "Special Gothic Expanded One", sans-serif',
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
              fontWeight: 400,
              letterSpacing: '0.05em',
              margin: 0,
              padding: 0,
              lineHeight: 1.1,
              textTransform: 'uppercase',
              color: '#ffffff',
            }}
          >
            {portfolioData.brandName || 'PORTFOLIO'}
          </h1>
        )}

        {/* Loading indicator below logo */}
        <div
          ref={labelRef}
          className="flex items-center gap-2"
        >
          <span
            ref={dotRef}
            className="block w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em',
            }}
          >
            Loading portfolio
          </span>
        </div>
      </div>

      {/* ── Progress line — bottom edge ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          ref={lineRef}
          className="h-full origin-left"
          style={{ backgroundColor: 'rgba(255,255,255,0.28)', transform: 'scaleX(0)' }}
        />
      </div>

      {/* ── Counter — bottom right ──────────────────────────────────────────── */}
      <div
        ref={countRef}
        className="absolute bottom-6 right-6 z-10 pointer-events-none select-none tabular-nums"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(4rem, 10vw, 8rem)',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        {count}%
      </div>

      {/* ── Index label — bottom left ───────────────────────────────────────── */}
      <div
        className="absolute bottom-7 left-6 z-10 pointer-events-none"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.14)',
          fontWeight: 500,
        }}
      >
        Portfolio · 2026
      </div>

    </div>
  );
}