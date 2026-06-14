'use client';

import { useEffect, useRef } from 'react';
import { usePortfolio } from '@/lib/PortfolioContext';
import { useTheme } from '@/lib/ThemeProvider';



export function HangingProfile() {
  const { portfolioData } = usePortfolio();
  const boxRef = useRef<HTMLSpanElement>(null);
  const ropeRef = useRef<SVGLineElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gravity = 1.2;
  const ropeLength = 220;
  const damping = 0.995;

  const state = useRef({
    angle: 0,
    velocity: 0,
    isDragging: false,
    dragX: 0,
    dragY: 0,
    currentLength: ropeLength
  });

  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      if (!state.current.isDragging) {
        state.current.currentLength += (ropeLength - state.current.currentLength) * 0.1;

        const acceleration = (-gravity / state.current.currentLength) * Math.sin(state.current.angle);

        state.current.velocity += acceleration;
        state.current.velocity *= damping;
        state.current.angle += state.current.velocity;
      } else {
        const dx = state.current.dragX;
        const dy = Math.max(state.current.dragY, 10);

        const targetAngle = Math.atan2(dx, dy);
        let targetLength = Math.sqrt(dx * dx + dy * dy);

        if (targetLength > ropeLength) {
          targetLength = ropeLength + (targetLength - ropeLength) * 0.2;
        } else if (targetLength < ropeLength * 0.3) {
          targetLength = ropeLength * 0.3;
        }

        state.current.angle += (targetAngle - state.current.angle) * 0.4;
        state.current.currentLength += (targetLength - state.current.currentLength) * 0.4;
        state.current.velocity = 0;
      }

      if (boxRef.current && ropeRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const originX = rect.width / 2;

        const x = state.current.currentLength * Math.sin(state.current.angle);
        const y = state.current.currentLength * Math.cos(state.current.angle);

        // Update SVG line attributes dynamically using computed originX
        ropeRef.current.setAttribute('x1', originX.toString());
        ropeRef.current.setAttribute('x2', (originX + x).toString());
        ropeRef.current.setAttribute('y2', y.toString());

        boxRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${-state.current.angle}rad)`;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    state.current.isDragging = true;
    if (boxRef.current) {
      boxRef.current.style.cursor = 'grabbing';
    }

    const updateMousePos = (ev: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const originX = rect.width / 2;
      const originY = 0;

      state.current.dragX = ev.clientX - rect.left - originX;
      state.current.dragY = ev.clientY - rect.top - originY;
    };

    const handlePointerUp = () => {
      state.current.isDragging = false;
      if (boxRef.current) {
        boxRef.current.style.cursor = 'grab';
      }
      window.removeEventListener('pointermove', updateMousePos);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    updateMousePos(e.nativeEvent as PointerEvent);

    window.addEventListener('pointermove', updateMousePos);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleSocialPointerDown = (e: React.PointerEvent) => {
    // Prevent starting drag physics when clicking social links
    e.stopPropagation();
  };

  return (
    <span ref={containerRef} className="relative w-[500px] max-w-[100vw] h-[750px] flex justify-center">
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
        <line
          ref={ropeRef}
          x1="50%"
          y1="0"
          x2="50%"
          y2="220"
          stroke="#FF3B30"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span
        ref={boxRef}
        onPointerDown={handlePointerDown}
        className="absolute top-0 flex flex-col items-center p-4 w-[340px] rounded-[32px] bg-[#18181A] border border-white/8 cursor-grab shadow-2xl select-none group hover:bg-[#1C1C1E] transition-colors duration-300 text-base font-normal tracking-normal leading-normal normal-case text-white"
        style={{
          left: '50%',
          marginLeft: '-170px',
          transformOrigin: 'center top', // pivot point is exactly at y = 0
          touchAction: 'none'
        }}
      >
        {/* Hanging hook hole tab centered at y = 0 (-mt-2 is -8px, height w-4 is 16px, so center is exactly at y = 0) */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 rounded-full border border-white/10 bg-[#18181A] flex items-center justify-center pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
        </span>

        {/* Portrait Profile Photo - Rounded Rectangle */}
        <span className="w-full h-[290px] rounded-[20px] overflow-hidden border border-white/10 mb-4 bg-white/5 flex items-center justify-center pointer-events-none group-hover:border-white/20 transition-colors duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {portfolioData.headshotImage ? (
            <img
              src={portfolioData.headshotImage}
              alt={portfolioData.fullName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 pointer-events-none"
            />
          ) : null}
        </span>

        {/* Display Text details */}
        <span className="flex flex-col items-center text-center pointer-events-none">
          <span
            className="text-2xl font-bold text-white tracking-tight block"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            {portfolioData.fullName}
          </span>
          <span
            className="text-[14px] text-white/70 font-semibold mt-2 leading-snug block"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            {portfolioData.title}
          </span>
          <span
            className="text-[13px] text-white/60 mt-1.5 font-medium block"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            {portfolioData.location}
          </span>
        </span>

        {/* Social Links Row */}
        <span
          className="flex items-center justify-center gap-5 mt-5.5 pt-4.5 border-t border-white/5 w-full"
          onPointerDown={handleSocialPointerDown}
        >
          <a
            href={portfolioData.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-all duration-200 shrink-0"
            aria-label="GitHub"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/github-logo.jpg"
              alt="GitHub"
              className="w-[36px] h-[36px] object-contain rounded-[6px]"
            />
          </a>
          <a
            href={portfolioData.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-all duration-200 shrink-0"
            aria-label="LinkedIn"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/linkedin-logo.png"
              alt="LinkedIn"
              className="w-[36px] h-[36px] object-contain rounded-[6px]"
            />
          </a>
          <a
            href={portfolioData.socials.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-all duration-200 shrink-0"
            aria-label="LeetCode"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/leetcode-logo.png"
              alt="LeetCode"
              className="w-[36px] h-[36px] object-contain rounded-[6px]"
            />
          </a>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${portfolioData.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-all duration-200 shrink-0"
            aria-label="Email"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/gmail-logo.png"
              alt="Gmail"
              className="w-[36px] h-[36px] object-contain rounded-[6px]"
            />
          </a>
        </span>
      </span>
    </span>
  );
}
