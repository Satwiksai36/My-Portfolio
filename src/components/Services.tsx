'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TECH_LOGOS } from './Stack';
import { usePortfolio } from '@/lib/PortfolioContext';
import { useTheme } from '@/lib/ThemeProvider';
import { getAutoLogoUrl, normalizeIconUrl } from '@/lib/data';
import { 
  Bot, 
  Cpu, 
  Server, 
  Layers, 
  Cloud, 
  Database, 
  Workflow, 
  Shield, 
  Layout, 
  Terminal, 
  Globe,
  Brain,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Link,
  Zap,
  Activity
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

function getKeywordIcon(keyword: string, isDark: boolean, size = 13) {
  const kw = keyword.toLowerCase().trim();
  
  // 1. Specific exact/close matches to ensure distinct premium look
  if (kw === 'machine learning') {
    return <Brain size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#34D399' : '#059669' }} />;
  }
  if (kw === 'predictive models') {
    return <TrendingUp size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#FBBF24' : '#D97706' }} />;
  }
  if (kw === 'xgboost') {
    return <Activity size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#FB7185' : '#E11D48' }} />;
  }
  if (kw === 'llms') {
    return <MessageSquare size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#818CF8' : '#4F46E5' }} />;
  }
  if (kw === 'ai agents') {
    return <Bot size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />;
  }
  if (kw === 'workflow automation') {
    return <Workflow size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#22D3EE' : '#0891B2' }} />;
  }
  if (kw === 'prompt engineering') {
    return <Sparkles size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#F472B6' : '#DB2777' }} />;
  }
  if (kw === 'rest apis') {
    return <Link size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#60A5FA' : '#2563EB' }} />;
  }
  if (kw === 'backend architecture') {
    return <Server size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#FB923C' : '#EA580C' }} />;
  }
  if (kw === 'system design') {
    return <Layers size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#A7F3D0' : '#047857' }} />;
  }
  if (kw === 'cloud deployment') {
    return <Cloud size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#38BDF8' : '#0284C7' }} />;
  }
  
  // 2. Broad category fallback rules
  if (
    kw.includes('llm') || 
    kw.includes('gpt') || 
    kw.includes('ai') || 
    kw.includes('artificial intelligence') || 
    kw.includes('agent') || 
    kw.includes('bot') || 
    kw.includes('nlp') || 
    kw.includes('openai') || 
    kw.includes('claude') ||
    kw.includes('prompt')
  ) {
    return <Bot size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#818CF8' : '#4F46E5' }} />;
  }
  if (
    kw.includes('machine learning') || 
    kw.includes('ml') || 
    kw.includes('xgboost') || 
    kw.includes('predictive') || 
    kw.includes('data science') || 
    kw.includes('model') || 
    kw.includes('deep learning')
  ) {
    return <Cpu size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#34D399' : '#059669' }} />;
  }
  if (
    kw.includes('backend') || 
    kw.includes('api') || 
    kw.includes('server') || 
    kw.includes('rest')
  ) {
    return <Server size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#60A5FA' : '#2563EB' }} />;
  }
  if (
    kw.includes('system design') || 
    kw.includes('architecture') || 
    kw.includes('microservices') || 
    kw.includes('design pattern')
  ) {
    return <Layers size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#FBBF24' : '#D97706' }} />;
  }
  if (
    kw.includes('cloud') || 
    kw.includes('deployment') || 
    kw.includes('devops') || 
    kw.includes('docker') || 
    kw.includes('kubernetes') || 
    kw.includes('aws') || 
    kw.includes('gcp') || 
    kw.includes('azure') || 
    kw.includes('netlify') || 
    kw.includes('vercel') || 
    kw.includes('supabase')
  ) {
    return <Cloud size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#38BDF8' : '#0284C7' }} />;
  }
  if (
    kw.includes('database') || 
    kw.includes('sql') || 
    kw.includes('postgres') || 
    kw.includes('mongo') || 
    kw.includes('redis') || 
    kw.includes('db')
  ) {
    return <Database size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#FB7185' : '#E11D48' }} />;
  }
  if (
    kw.includes('automation') || 
    kw.includes('workflow') || 
    kw.includes('pipeline') || 
    kw.includes('ci/cd') || 
    kw.includes('cron') || 
    kw.includes('scrape') || 
    kw.includes('scripting')
  ) {
    return <Workflow size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#22D3EE' : '#0891B2' }} />;
  }
  if (
    kw.includes('security') || 
    kw.includes('auth') || 
    kw.includes('jwt') || 
    kw.includes('oauth') || 
    kw.includes('cryptography')
  ) {
    return <Shield size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#2DD4BF' : '#0D9488' }} />;
  }
  if (
    kw.includes('frontend') || 
    kw.includes('ui') || 
    kw.includes('ux') || 
    kw.includes('web') || 
    kw.includes('layout') || 
    kw.includes('interface')
  ) {
    return <Layout size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#E879F9' : '#C084FC' }} />;
  }
  if (kw.includes('git') || kw.includes('github')) {
    return <Globe size={size} className="mr-[0.55rem] shrink-0" style={{ color: isDark ? '#A3A3A3' : '#4B5563' }} />;
  }
  
  // 3. Hash fallback (different word = different icon)
  const hash = kw.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackIcons = [
    { component: Terminal, color: '#A3A3A3' },
    { component: Cpu, color: '#34D399' },
    { component: Layers, color: '#FBBF24' },
    { component: Shield, color: '#2DD4BF' },
    { component: Layout, color: '#E879F9' },
    { component: Globe, color: '#60A5FA' },
    { component: Zap, color: '#FCD34D' },
    { component: Activity, color: '#F472B6' }
  ];
  const choice = fallbackIcons[hash % fallbackIcons.length];
  const FallbackIcon = choice.component;
  const colorHex = isDark ? choice.color : undefined;
  return <FallbackIcon size={size} className="mr-[0.55rem] shrink-0" style={{ color: colorHex }} />;
}



/* ─── Toggle icon: two lines that morph into × ─────────────────────────── */
function ToggleIcon({ open, isDark }: { open: boolean; isDark: boolean }) {
  return (
    <div className="relative w-5 h-5 shrink-0">
      <motion.span
        className={`absolute left-0 top-1/2 block w-5 h-px origin-center ${isDark ? 'bg-white/50' : 'bg-black/50'}`}
        animate={{ rotate: open ? 45 : 0, y: open ? 0 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ translateY: '-50%' }}
      />
      <motion.span
        className={`absolute left-0 top-1/2 block w-5 h-px origin-center ${isDark ? 'bg-white/50' : 'bg-black/50'}`}
        animate={{ rotate: open ? -45 : 90 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ translateY: '-50%' }}
      />
    </div>
  );
}

/* ─── Individual service row ─────────────────────────────────────────────── */
function ServiceRow({
  service,
  index,
  isOpen,
  hasOpenSibling,
  onToggle,
  isDark,
}: {
  service: { index?: string; title: string; short: string; body: string; keywords: string[] };
  index: number;
  isOpen: boolean;
  hasOpenSibling: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { once: true, margin: '-8%' });
  const [hovered, setHovered] = useState(false);
  const { portfolioData } = usePortfolio();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const rawX = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 380, damping: 32 });

  return (
    <motion.div
      ref={rowRef}
      animate={{ opacity: hasOpenSibling ? 0.35 : 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`relative overflow-hidden border-b ${isDark ? 'border-white/8' : 'border-black/8'}`}
    >
      {/* Hover sweep background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 60%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.04) 0%, transparent 60%)',
        }}
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -16 }}
        transition={{ duration: 0.35 }}
      />

      {/* Left accent bar — clips in on hover or open */}
      <motion.div
        className={`absolute left-0 top-0 bottom-0 w-px origin-top ${isDark ? 'bg-white/30' : 'bg-black/30'}`}
        animate={{ scaleY: hovered || isOpen ? 1 : 0, opacity: hovered || isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />

      <button
        onClick={onToggle}
        onMouseEnter={() => { setHovered(true); rawX.set(10); }}
        onMouseLeave={() => { setHovered(false); rawX.set(0); }}
        className="w-full flex items-center justify-between py-6 lg:py-8 text-left pl-4 lg:pl-6"
      >
        {/* Content: index + title + short */}
        <motion.div
          style={{ x: springX }}
          className="flex items-baseline gap-6 lg:gap-10 flex-1 min-w-0"
        >
          {/* Index */}
          <motion.span
            className="text-[0.6rem] tracking-[0.22em] uppercase font-medium shrink-0 tabular-nums"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            animate={{ color: hovered || isOpen ? (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)') : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)') }}
            transition={{ duration: 0.25 }}
          >
            {service.index || (index + 1).toString().padStart(2, '0')}
          </motion.span>

          {/* Title — clips up from below on scroll-in */}
          <div className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-8 flex-1 min-w-0">
            <div className="overflow-hidden pt-4 pb-6 -mt-4 -mb-6">
              <motion.h3
                className={`font-black tracking-[-0.035em] leading-none ${isDark ? 'text-white' : 'text-black'}`}
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 3.5vw, 3.5rem)',
                }}
                initial={{ y: '110%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.75, delay: index * 0.09, ease: EASE }}
              >
                {service.title}
              </motion.h3>
            </div>

            {/* Short — fades out when open */}
            <motion.p
              className={`text-sm lg:text-base hidden lg:block shrink-0 ${isDark ? 'text-white' : 'text-black'}`}
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              animate={{ opacity: isOpen ? 0 : hovered ? 0.75 : 0.45 }}
              transition={{ duration: 0.2 }}
            >
              {service.short}
            </motion.p>
          </div>
        </motion.div>

        <div className="ml-4">
          <ToggleIcon open={isOpen} isDark={isDark} />
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-10 pl-[calc(1rem+1.5rem+1.5rem)] lg:pl-[calc(1.5rem+2.5rem+2.5rem)] pr-4 lg:pr-6">

              {/* Body — word-by-word stagger */}
              <p
                className={`leading-relaxed max-w-2xl mb-6 ${isDark ? 'text-white/50' : 'text-black/50'}`}
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
                }}
              >
                {service.body.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.4, delay: i * 0.022, ease: EASE }}
                    style={{ display: 'inline-block', marginRight: '0.3em' }}
                  >
                    {word}
                  </motion.span>
                ))}
              </p>

              {/* Keywords — staggered clip-path pop-in */}
              <div className="flex flex-wrap gap-2">
                {service.keywords.map((kw, i) => {
                  const customLogoUrl = portfolioData.customTechLogos?.[kw];
                  const hasBuiltinLogo = !!TECH_LOGOS[kw];
                  const autoIcon = normalizeIconUrl(customLogoUrl || (hasBuiltinLogo ? undefined : getAutoLogoUrl(kw)), isDark);
                  const hasCustomLogo = autoIcon && !failedImages[autoIcon];
                  return (
                    <motion.span
                      key={kw}
                      initial={{ opacity: 0, y: 10, clipPath: 'inset(100% 0 0 0)' }}
                      animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                      transition={{ duration: 0.4, delay: 0.12 + i * 0.07, ease: EASE }}
                      className="inline-flex items-center cursor-default"
                      style={{
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: '100px',
                        padding: '0.45rem 1.0rem',
                      }}
                    >
                      {hasCustomLogo ? (
                        <span className="inline-flex items-center mr-[0.55rem] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={autoIcon} 
                            alt={kw} 
                            style={{ width: '16px', height: '16px', objectFit: 'contain' }} 
                            onError={() => setFailedImages(prev => ({ ...prev, [autoIcon]: true }))}
                          />
                        </span>
                      ) : hasBuiltinLogo ? (
                        <span className="inline-flex items-center mr-[0.55rem] shrink-0">
                          {TECH_LOGOS[kw](16)}
                        </span>
                      ) : (
                        getKeywordIcon(kw, isDark)
                      )}
                      <span>{kw}</span>
                    </motion.span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Services() {
  const { portfolioData } = usePortfolio();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activeServices = portfolioData.services || [];

  /* Scroll-scrub vertical progress line */
  useEffect(() => {
    if (!sectionRef.current || !lineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 35%',
            scrub: 1.5,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      data-theme={isDark ? "dark" : "light"}
      className={`w-full relative transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FFFFFF]'}`}
    >
      {/* Scroll-progress line — left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-px hidden lg:block pointer-events-none ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        <div ref={lineRef} className={`w-full h-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />
      </div>

      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(3.5rem,7vw,7.5rem)] pb-[clamp(5rem,10vw,11rem)]">

        {/* Section label + animated divider */}
        <div className="flex items-center gap-4 mb-[clamp(3rem,6vw,7rem)]">
          <motion.span
            className={`text-[0.85rem] tracking-[0.22em] uppercase font-bold shrink-0 ${isDark ? 'text-white/60' : 'text-black/60'}`}
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -16 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            04 / Services
          </motion.span>
          <motion.div
            className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={sectionInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
          />
        </div>

        {/* Headline — word-by-word clip reveal */}
        <h2
          className={`font-black tracking-[-0.04em] leading-[0.9] mb-[clamp(3rem,5vw,6rem)] ${isDark ? 'text-white' : 'text-black'}`}
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(2.8rem, 7vw, 8rem)',
          }}
        >
          {(['What', 'I'] as const).map((word, i) => (
            <span key={word} className="inline-block overflow-hidden align-bottom pt-4 pb-6 mr-[0.25em] -mt-4 -mb-6">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={sectionInView ? { y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.05 + i * 0.1, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          {' '}
          <span className="inline-block overflow-hidden align-bottom pt-4 pb-6 -mt-4 -mb-6">
            <motion.span
              className="block"
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              }}
              initial={{ y: '110%' }}
              animate={sectionInView ? { y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            >
              Build
            </motion.span>
          </span>
        </h2>

        {/* Service rows */}
        <motion.div
          className={`border-t ${isDark ? 'border-white/8' : 'border-black/8'}`}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={sectionInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          {activeServices.map((service, i) => (
            <ServiceRow
              key={service.index || service.title}
              service={service}
              index={i}
              isOpen={openIndex === i}
              hasOpenSibling={openIndex !== null && openIndex !== i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              isDark={isDark}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
