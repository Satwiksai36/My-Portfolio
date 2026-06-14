'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { PageLoader } from '@/components/PageLoader';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { CustomCursor } from '@/components/CustomCursor';
import { AIAgent } from '@/components/AIAgent';

// Lazy load heavy components below the fold to speed up hydration and loader start
const About = dynamic(() => import('@/components/About').then((m) => m.About), { ssr: false });
const Education = dynamic(() => import('@/components/Education').then((m) => m.Education), { ssr: false });
const Stack = dynamic(() => import('@/components/Stack').then((m) => m.Stack), { ssr: false });
const Services = dynamic(() => import('@/components/Services').then((m) => m.Services), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects').then((m) => m.Projects), { ssr: false });
const Credentials = dynamic(() => import('@/components/Credentials').then((m) => m.Credentials), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact').then((m) => m.Contact), { ssr: false });

function BackToTop() {
  const [scrollYVisible, setScrollYVisible] = useState(false);
  const [scrollActive, setScrollActive] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      setScrollYVisible(window.scrollY > 600);
      setScrollActive(true);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        setScrollActive(false);
      }, 800);
    };

    // Initial check
    setScrollYVisible(window.scrollY > 600);
    timeout = setTimeout(() => {
      setScrollActive(false);
    }, 800);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const showButton = scrollYVisible && (scrollActive || hovered);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 bg-black text-white flex items-center justify-center hover:bg-black/75 transition-colors duration-200"
          aria-label="Back to top"
        >
          <ArrowUp size={14} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function HomeClient() {
  const [loaded, setLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (loaded) {
      // Refresh ScrollTrigger after a short delay to allow page layout to settle
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        import('gsap').then(({ default: gsap }) => {
          gsap.registerPlugin(ScrollTrigger);
          const timer = setTimeout(() => {
            ScrollTrigger.refresh();
          }, 800);
          return () => clearTimeout(timer);
        });
      });
    }
  }, [loaded]);

  return (
    <>
      <CustomCursor />
      {!loaded && <PageLoader onDone={() => setLoaded(true)} />}
      <SmoothScroll>
        {loaded && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-9999 pointer-events-none"
            style={{ scaleX }}
          />
        )}
        <Navbar />
        <main>
          <Hero />
          <About />
          <Education />
          <Stack />
          <Services />
          <Projects />
          <Credentials />
          <Contact />
        </main>
        <BackToTop />
        <AIAgent />
      </SmoothScroll>
    </>
  );
}
