'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight, X, Send, Mail } from 'lucide-react';
import Image from 'next/image';
import { usePortfolio } from '@/lib/PortfolioContext';
import { getAutoLogoUrl, normalizeIconUrl } from '@/lib/data';
import { useTheme } from '@/lib/ThemeProvider';
import { useIsMobile } from '@/lib/useIsMobile';
import dynamic from 'next/dynamic';

const ContactCanvas = dynamic(
  () => import('./ContactCanvas').then((m) => m.ContactCanvas),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = [0.22, 1, 0.36, 1] as const;



/* ── Magnetic CTA button ──────────────────────────────────────────────────── */
function MagneticCTA({ onClick, isDark }: { onClick: () => void; isDark: boolean }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 280, damping: 26 });
  const y = useSpring(rawY, { stiffness: 280, damping: 26 });

  return (
    <motion.button
      data-cursor="hire"
      style={{
        x,
        y,
        backgroundColor: isDark ? '#FFFFFF' : '#0A0A0A',
        color: isDark ? '#0A0A0A' : '#FFFFFF',
        border: isDark ? '1px solid #FFFFFF' : '1px solid #0A0A0A'
      }}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - r.left - r.width / 2) * 0.3);
        rawY.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
      className="group inline-flex items-center gap-4 px-12 py-5 transition-colors duration-300"
      whileHover={{
        backgroundColor: isDark ? '#E5E5E5' : '#262626',
        borderColor: isDark ? '#E5E5E5' : '#262626'
      }}
    >
      <span
        className="text-[0.8rem] tracking-[0.22em] uppercase font-bold"
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
      >
        Send a Message
      </span>
      <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </motion.button>
  );
}

/* ── Contact modal ────────────────────────────────────────────────────────── */
function ContactModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    // Fire the email request asynchronously in the background
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).then((res) => {
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        res.json().then((errData) => {
          console.error('Contact submission API error:', errData);
        }).catch(() => {
          console.error('Contact submission failed with status:', res.status);
        });
      }
    }).catch((err) => {
      setStatus('error');
      console.error('Contact submission network error:', err);
    });
  };

  const inputClass =
    `w-full bg-transparent px-5 py-3.5 text-sm focus:outline-none transition-colors duration-200 ${isDark ? 'border border-white/22 text-white/85 placeholder:text-white/40 focus:border-white/50' : 'border border-black/22 text-black placeholder:text-black/45 focus:border-black/45'}`;

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full sm:max-w-xl overflow-hidden"
        style={{
          background: isDark ? '#161616' : '#fbfbfb',
          border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-px h-12 bg-black/20" />
          <div className="absolute top-0 right-0 w-12 h-px bg-black/20" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-px h-12 bg-black/10" />
          <div className="absolute bottom-0 left-0 w-12 h-px bg-black/10" />
        </div>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <span
                className="text-[0.55rem] tracking-[0.28em] uppercase font-medium block mb-2"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
                }}
              >
                Get in Touch
              </span>
              <h2
                className="font-black tracking-[-0.035em] leading-tight"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                  color: isDark ? '#F0F0F0' : '#0A0A0A',
                }}
              >
                Start a{' '}
                <span
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: isDark ? 'rgba(240,240,240,0.55)' : 'rgba(0,0,0,0.55)',
                  }}
                >
                  conversation
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`w-9 h-9 flex items-center justify-center transition-all duration-200 shrink-0 mt-1 ${isDark
                ? 'border border-white text-white hover:bg-white/10'
                : 'border border-black text-black hover:bg-black/10'
                }`}
            >
              <X size={14} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 pb-12 text-center"
              >
                <div className="flex justify-center mb-4 select-none">
                  <Mail size={72} className={isDark ? 'text-white/90' : 'text-black/90'} strokeWidth={1.0} />
                </div>
                <p
                  className={`leading-relaxed mb-6 ${isDark ? 'text-white/75' : 'text-black/75'}`}
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  }}
                >
                  Thank you.
                </p>
                <p
                  className={`text-sm ${isDark ? 'text-white/65' : 'text-black/65'}`}
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  Your message has been successfully sent. I will get back to you within 24 hours.
                </p>
                <button
                  onClick={onClose}
                  className="mx-auto block bg-black text-white px-8 py-3 text-[0.62rem] tracking-[0.22em] uppercase font-semibold hover:bg-black/85 transition-colors duration-200 mt-8"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-[0.58rem] tracking-[0.18em] uppercase mb-2 font-medium ${isDark ? 'text-white/65' : 'text-black/65'}`}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-[0.58rem] tracking-[0.18em] uppercase mb-2 font-medium ${isDark ? 'text-white/65' : 'text-black/65'}`}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={inputClass}
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[0.58rem] tracking-[0.18em] uppercase mb-2 font-medium ${isDark ? 'text-white/65' : 'text-black/65'}`}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    className={inputClass}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    className={`block text-[0.58rem] tracking-[0.18em] uppercase mb-2 font-medium ${isDark ? 'text-white/65' : 'text-black/65'}`}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  >
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className={`${inputClass} resize-none`}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    placeholder="Tell me about your project..."
                  />
                </div>

                {status === 'error' && (
                  <p
                    className="text-[0.6rem] tracking-[0.12em] text-red-600/70 font-medium"
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  >
                    Something went wrong — please try again or email directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group w-full bg-black text-white py-4 text-[0.62rem] tracking-[0.22em] uppercase font-semibold hover:bg-black/85 transition-colors duration-200 disabled:opacity-40 mt-2 flex items-center justify-center gap-2.5"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                  {status !== 'sending' && (
                    <Send
                      size={11}
                      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export function Contact() {
  const { portfolioData } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const [modalOpen, setModalOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isMobile = useIsMobile();

  const SOCIALS = useMemo(() => {
    const list = portfolioData.socialsList && portfolioData.socialsList.length > 0
      ? portfolioData.socialsList
      : [
        { label: 'GitHub', href: portfolioData.socials.github, logo: '' },
        { label: 'LinkedIn', href: portfolioData.socials.linkedin, logo: '' },
        { label: 'X', href: portfolioData.socials.x, logo: '' },
        { label: 'Instagram', href: portfolioData.socials.instagram, logo: '' },
        { label: 'LeetCode', href: portfolioData.socials.leetcode, logo: '' }
      ].filter(item => item.href);

    const hasEmail = list.some(item => item.label.toLowerCase() === 'email' || item.label.toLowerCase() === 'gmail');
    const finalList = [...list];
    if (!hasEmail && portfolioData.email) {
      finalList.push({
        label: 'Email',
        href: `https://mail.google.com/mail/?view=cm&fs=1&to=${portfolioData.email}`,
        logo: ''
      });
    }

    return finalList.map(item => {
      let logoSrc = item.logo;
      if (!logoSrc) {
        if (item.label.toLowerCase() === 'email' || item.label.toLowerCase() === 'gmail') {
          logoSrc = '/logo/gmail-logo.png';
        } else if (item.label.toLowerCase() === 'github') {
          logoSrc = '/logo/github-logo.jpg';
        } else if (item.label.toLowerCase() === 'linkedin') {
          logoSrc = '/logo/linkedin-logo.png';
        } else if (item.label.toLowerCase() === 'x') {
          logoSrc = '/logo/x-logo.png';
        } else if (item.label.toLowerCase() === 'instagram') {
          logoSrc = '/logo/instagram-logo.png';
        } else if (item.label.toLowerCase() === 'leetcode') {
          logoSrc = '/logo/leetcode-logo.png';
        } else {
          logoSrc = normalizeIconUrl(getAutoLogoUrl(item.label), isDark);
        }
      } else {
        logoSrc = normalizeIconUrl(logoSrc, isDark);
      }
      return {
        label: item.label,
        href: item.href,
        logoSrc
      };
    });
  }, [portfolioData.socialsList, portfolioData.socials, portfolioData.email, isDark]);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener('open-contact-modal', handler);
    return () => window.removeEventListener('open-contact-modal', handler);
  }, []);

  /* ── PORTFOLIO wordmark animation ── */
  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;

    let glitchTimer: ReturnType<typeof setTimeout> | undefined;

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: 'chars' });
      const chars = split.chars as HTMLElement[];

      /*
       * The span's text color matches theme opacity.
       * Animating color directly leaving CSS opacity untouched.
       */
      gsap.set(chars, {
        color: isDark ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)',
        y: 70,
        skewX: () => (Math.random() - 0.5) * 10,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      /* 1 — fly in with a bright flash */
      tl.to(chars, {
        color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
        y: 0,
        skewX: 0,
        duration: 1.6,
        stagger: { amount: 0.55, from: 'random' },
        ease: 'expo.out',
      });

      /* 2 — settle to the original ghost opacity */
      tl.to(chars, {
        color: isDark ? 'rgba(255,255,255,0.032)' : 'rgba(0,0,0,0.032)',
        duration: 2,
        stagger: { amount: 0.4 },
        ease: 'power2.inOut',
      }, '-=0.7');

      /* 3 — continuous idle float */
      chars.forEach((char, i) => {
        gsap.to(char, {
          y: `${2 + Math.sin(i * 0.9) * 3}px`,
          duration: 3.5 + i * 0.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.09,
        });
      });

      /* 4 — periodic glitch on a random character */
      const scheduleGlitch = (delay = 4200) => {
        glitchTimer = setTimeout(() => {
          if (!chars.length) return;
          const i = Math.floor(Math.random() * chars.length);
          gsap.timeline()
            .to(chars[i], { color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)', x: 3, skewX: 7, duration: 0.055 })
            .to(chars[i], { color: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', x: -2, skewX: -5, duration: 0.055 })
            .to(chars[i], { color: isDark ? 'rgba(255,255,255,0.032)' : 'rgba(0,0,0,0.032)', x: 0, skewX: 0, duration: 0.1 });
          scheduleGlitch(1500 + Math.random() * 3000);
        }, delay);
      };
      scheduleGlitch();
    }, el);

    return () => {
      clearTimeout(glitchTimer);
      ctx.revert();
    };
  }, [isDark]);

  /* ── Email SplitText animation ── */
  useEffect(() => {
    if (!sectionRef.current || !emailRef.current) return;
    const ctx = gsap.context(() => {
      const split = new SplitText(emailRef.current!, { type: 'chars' });
      gsap.fromTo(
        split.chars,
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1.1,
          stagger: 0.022,
          ease: 'power4.out',
          scrollTrigger: { trigger: emailRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        className={`w-full border-t relative overflow-hidden ${isDark ? 'border-white/8' : 'border-black/8'}`}
        style={{ background: isDark ? '#0A0A0A' : '#FFFFFF' }}
      >
        {/* Constellation background */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <ContactCanvas />
          </div>
        )}

        <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(5rem,10vw,11rem)] pb-0">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-[clamp(3rem,6vw,8rem)]">
            <motion.span
              className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              initial={{ opacity: 0, x: -16 }}
              animate={sectionInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
            >
              07 / Contact
            </motion.span>
            <motion.div
              className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={sectionInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
            />
          </div>

          {/* Giant email CTA */}
          <div className="mb-[clamp(3rem,6vw,8rem)]">
            <motion.p
              className={`mb-8 sm:mb-10 ${isDark ? 'text-white/70' : 'text-black/70'}`}
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.4rem)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              Have a project in mind?
            </motion.p>

            <div className="overflow-hidden mb-12 sm:mb-16">
              <a
                ref={emailRef}
                href={`mailto:${portfolioData.email}`}
                className="block font-black tracking-[-0.04em] will-change-transform transition-colors duration-300"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 5.5vw, 7rem)',
                  lineHeight: 1.15,
                  paddingBottom: '0.2em',
                  wordBreak: 'break-all',
                  color: isDark ? 'rgba(240,240,240,0.92)' : 'rgba(0,0,0,1)',
                }}
              >
                {portfolioData.email}
              </a>
            </div>

            <motion.div
              className="flex flex-wrap items-center gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            >
              <MagneticCTA onClick={() => setModalOpen(true)} isDark={isDark} />
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${portfolioData.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.78rem] tracking-[0.18em] uppercase font-bold transition-all duration-200 hover:opacity-80"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  color: isDark ? 'rgba(240,240,240,0.75)' : 'rgba(0,0,0,0.75)',
                }}
              >
                or email directly →
              </a>
            </motion.div>
          </div>

          {/* Info strip */}
          <motion.div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-0 border-t mb-0 ${isDark ? 'border-white/8' : 'border-black/8'}`}
            initial={{ opacity: 0 }}
            animate={sectionInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            {[
              { label: 'Location', value: portfolioData.location },
              { label: 'Response', value: portfolioData.responseTime },
              { label: 'Status', value: portfolioData.statusText, pulse: true },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`py-8 pr-8 ${i > 0 ? `sm:border-l sm:pl-8 sm:pr-0 ${isDark ? 'sm:border-white/8' : 'sm:border-black/8'}` : ''}`}
              >
                <p
                  className={`text-[0.72rem] tracking-[0.22em] uppercase font-bold mb-2.5 ${isDark ? 'text-white/55' : 'text-black/55'}`}
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {item.label}
                </p>
                <div className="flex items-center gap-2.5">
                  {item.pulse && <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isDark ? 'bg-white/60' : 'bg-black/60'}`} />}
                  <p
                    className={`font-semibold ${isDark ? 'text-white/90' : 'text-black/90'}`}
                    style={{
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      fontSize: 'clamp(1.1rem, 1.6vw, 1.3rem)',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className={`relative w-full border-t overflow-hidden ${isDark ? 'border-white/10 bg-[#0A0A0A]' : 'border-black/10 bg-[#F5F5F7]'}`}>
          {/* Subtle radial glow background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 120%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)'
                : 'radial-gradient(circle at 50% 120%, rgba(0, 0, 0, 0.03) 0%, transparent 60%)'
            }}
          />

          {/* Background huge wordmark */}
          <div
            className="absolute inset-x-0 flex justify-center items-start pointer-events-none select-none z-0"
            style={{ top: '0rem' }}
          >
            <span
              ref={wordmarkRef}
              style={{
                display: 'block',
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(4.5rem, 18vw, 22rem)',
                letterSpacing: '-0.02em',
                color: isDark ? 'rgba(255,255,255,0.032)' : 'rgba(0,0,0,0.032)',
                lineHeight: 0.82,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              PORTFOLIO
            </span>
          </div>

          <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(4.5rem,6vw,6.5rem)] pb-[clamp(2.5rem,4vw,3.5rem)]">

            {/* Top row: logo + socials */}
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-8 mb-10 sm:mb-12">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
                className="flex items-center gap-3"
              >
                <Image
                  src={isDark ? (portfolioData.logoWhite || '/logo/weblogo-white.png') : (portfolioData.logoBlack || '/logo/weblogo-black.png')}
                  alt={portfolioData.brandName}
                  width={140}
                  height={36}
                  className="opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-103"
                />
              </motion.div>

              {/* Socials */}
              <motion.div
                className="flex items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={sectionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
              >
                {SOCIALS.map(({ label, href, logoSrc }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    aria-label={label}
                    className="group w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* Faint hover glow overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 80%)" />

                    <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-108 group-hover:-translate-y-0.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={label}
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                    </div>
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Middle: nav links */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:gap-x-10 mb-6 border-t border-b py-6"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
              }}
              initial={{ opacity: 0 }}
              animate={sectionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.75, ease: EASE }}
            >
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'My Journey', href: '#education' },
                { label: 'Skills', href: '#skills' },
                { label: 'Services', href: '#services' },
                { label: 'Projects', href: '#projects' },
                { label: 'Credentials', href: '#credentials' },
                { label: 'Contact', href: '#contact' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`relative group py-1 text-[0.72rem] lg:text-[0.78rem] tracking-[0.24em] uppercase font-bold transition-all duration-300 ${isDark
                    ? 'text-white/45 hover:text-white'
                    : 'text-black/45 hover:text-black'
                    }`}
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                  }}
                >
                  <span>{label}</span>
                  <span className={`absolute bottom-0 left-0 w-0 h-[1.5px] group-hover:w-full transition-all duration-300 ease-out ${isDark ? 'bg-white' : 'bg-black'
                    }`} />
                </a>
              ))}
            </motion.div>

            {/* Bottom bar */}
            <motion.div
              className="flex flex-col items-center justify-center gap-3 pt-5 w-full"
              initial={{ opacity: 0 }}
              animate={sectionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
            >
              <p
                className="text-[0.92rem] tracking-wider font-bold text-center"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  color: isDark ? '#FFFFFF' : '#0A0A0A',
                }}
              >
                <span style={{ color: '#EF4444' }}>Support</span> the developer <span style={{ color: '#EF4444' }}>❤️</span>
              </p>
              <p
                className="text-[0.88rem] tracking-wider font-bold text-center"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.85)',
                }}
              >
                © {new Date().getFullYear()} All Rights Reserved |{' '}
                <span style={{ color: '#EF4444' }}>{portfolioData.fullName}</span>
              </p>
            </motion.div>
          </div>  {/* end z-10 wrapper */}
        </footer>
      </section>

      {/* Modal portal */}
      <AnimatePresence>
        {modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
