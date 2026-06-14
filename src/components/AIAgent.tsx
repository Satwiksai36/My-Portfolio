'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, RefreshCw, Minus } from 'lucide-react';
import { usePortfolio } from '@/lib/PortfolioContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What is your technical stack?',
  'Tell me about your top projects',
  'How can I get in touch with you?',
  'Where can I download your resume?'
];

// Futuristic EVE-style floating full-body robot assistant icon
const SleekBotIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Head / Face */}
    <rect x="6" y="6" width="12" height="10" rx="2.5" />
    
    {/* Eyes */}
    <circle cx="9.5" cy="10.5" r="0.85" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="10.5" r="0.85" fill="currentColor" stroke="none" />

    {/* Smile */}
    <path d="M10 12.5c.8.8 3.2.8 4 0" strokeWidth="1.5" />

    {/* Top Antenna */}
    <line x1="12" y1="6" x2="12" y2="3.5" strokeWidth="2" />
    <circle cx="12" cy="2.5" r="1.2" fill="currentColor" stroke="none" />

    {/* Ears */}
    <path d="M6 9H4.5c-.8 0-1.5.7-1.5 1.5v1c0 .8.7 1.5 1.5 1.5H6" />
    <path d="M18 9h1.5c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5H18" />

    {/* Neck */}
    <path d="M11 16v1.5h2V16" strokeWidth="1.5" />

    {/* Body / Shoulders */}
    <path d="M6.5 21.5c0-1.8 1.5-3.2 3.2-3.2h4.6c1.7 0 3.2 1.4 3.2 3.2" />

    {/* Chest Screen */}
    <rect x="10" y="19" width="4" height="2" rx="0.5" strokeWidth="1" />
  </svg>
);

export function AIAgent() {


  const { portfolioData } = usePortfolio();
  const firstName = portfolioData.firstName || 'Satwik';
  const initialGreeting = `Hi! I am **${firstName}'s Assistant**. 🤖\n\nHow can I help you today? Ask me about ${firstName}'s technical stack, custom projects, background, or how to hire him!`;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: initialGreeting
        }
      ]);
    }
  }, [initialGreeting, messages.length]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 600);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      setVisible(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (window.scrollY <= 10) {
        return;
      }

      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 10) {
          setVisible(false);
        }
      }, 800);
    };

    if (window.scrollY <= 10) {
      setVisible(true);
    } else {
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 10) {
          setVisible(false);
        }
      }, 800);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  const isAgentVisible = visible || isOpen || hovered;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch reply');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Oops! I ran into an error connecting to my server. Please try asking again, or contact Satwik directly at his email!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  // Formatting helper for simple markdown rendering (bold, list bullets, links)
  const formatMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let formattedLine: React.ReactNode[] = [line];

      // 1. Parse bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];

      boldRegex.lastIndex = 0;
      while ((match = boldRegex.exec(line)) !== null) {
        const textBefore = line.substring(lastIndex, match.index);
        const boldText = match[1];

        if (textBefore) parts.push(textBefore);
        parts.push(<strong key={`b-${match.index}`} className="font-bold text-white!">{boldText}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      let finalParts: React.ReactNode[] = parts.length > 0 ? parts : [line];

      // 2. Parse Markdown Links
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      const finalPartsWithLinks: React.ReactNode[] = [];

      for (const part of finalParts) {
        if (typeof part === 'string') {
          let linkLastIdx = 0;
          let linkMatch;
          linkRegex.lastIndex = 0;

          while ((linkMatch = linkRegex.exec(part)) !== null) {
            const textBeforeLink = part.substring(linkLastIdx, linkMatch.index);
            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];

            if (textBeforeLink) finalPartsWithLinks.push(textBeforeLink);
            finalPartsWithLinks.push(
              <a
                key={`a-${linkMatch.index}`}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400! hover:text-indigo-300! font-semibold underline transition-colors"
              >
                {linkText}
              </a>
            );
            linkLastIdx = linkRegex.lastIndex;
          }

          if (linkLastIdx < part.length) {
            finalPartsWithLinks.push(part.substring(linkLastIdx));
          }
        } else {
          finalPartsWithLinks.push(part);
        }
      }

      return (
        <div key={lineIdx} className={line.startsWith('- ') ? 'pl-4 py-0.5 relative before:content-["•"] before:absolute before:left-0 before:text-neutral-500!' : 'min-h-[1.2rem]'}>
          {line.startsWith('- ') ? finalPartsWithLinks.map((p) => typeof p === 'string' ? p.substring(2) : p) : finalPartsWithLinks}
        </div>
      );
    });
  };

  return (
    <>
      {/* --- Floating Action Button --- */}
      <motion.div
        animate={{
          y: isAgentVisible ? 0 : 100,
          opacity: isAgentVisible ? 1 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 32,
          mass: 0.75
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed right-4 sm:right-6 z-50 transition-[bottom] duration-300 ${isAgentVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        style={{
          bottom: scrolled ? '88px' : '24px'
        }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4.5 h-11 rounded-full bg-[#0E0E11] border border-white/10 text-white flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:border-indigo-500/30 focus:outline-none transition-all group relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`Chat with ${firstName}'s Assistant`}
        >
          {/* Subtle colored glow background */}
          <div className="absolute inset-0 bg-linear-to-tr from-indigo-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Glowing rings */}
          <span className="absolute -inset-px rounded-full bg-linear-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-5 h-5"
              >
                <X size={16} className="text-neutral-400! group-hover:text-white! transition-colors" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <SleekBotIcon className="w-4.5 h-4.5 text-indigo-400! group-hover:animate-bounce" />
                <span className="text-[0.7rem] font-bold tracking-widest uppercase text-white!" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>Ask me</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* --- Chat Box Overlay --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.94 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="fixed w-[calc(100vw-32px)] sm:w-[410px] h-[550px] bg-[#0A0A0C]/95 border border-white/10 rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden backdrop-blur-2xl text-neutral-300 transition-all duration-300 right-4 sm:right-[96px] bottom-(--chat-bottom-mobile) sm:bottom-(--chat-bottom-desktop) max-h-(--chat-max-height-mobile) sm:max-h-none"
            data-lenis-prevent
            style={{
              ['--chat-bottom-mobile' as any]: scrolled ? '156px' : '92px',
              ['--chat-bottom-desktop' as any]: '24px',
              ['--chat-max-height-mobile' as any]: scrolled ? 'calc(100vh - 180px)' : 'calc(100vh - 116px)'
            }}
          >
            {/* Ambient background glow inside chatbox */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-12 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-[60px] pointer-events-none" />

            {/* Glowing top border indicator */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-indigo-500/60 via-purple-500/50 to-pink-500/30" />

            {/* Header */}
            <div className="relative px-6 py-4.5 border-b border-white/5 bg-[#0F0F13]/60 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl border border-white/10 bg-[#16161D] flex items-center justify-center shrink-0 relative shadow-inner">
                  <SleekBotIcon className="w-6.5 h-6.5 text-indigo-400!" />
                  {/* Pulse online indicator */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0C] shadow-lg animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white! leading-none">
                    {firstName}'s Assistant
                  </h3>
                  <span className="text-[11px] tracking-widest uppercase text-neutral-400! font-bold block mt-1.5">
                    Portfolio Agent
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMessages([])}
                  className="w-8 h-8 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-center text-neutral-400! hover:text-white! transition-all cursor-pointer"
                  title="Restart Chat"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 flex items-center justify-center text-neutral-400! hover:text-white! transition-all cursor-pointer"
                  title="Minimize"
                >
                  <Minus size={13} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    {/* Message Icon Avatar */}
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-neutral-400! ${isUser ? 'bg-white/5 border-white/10' : 'bg-[#121217] border-white/5'
                      }`}>
                      {isUser ? <User size={13} /> : <SleekBotIcon className="w-4 h-4 text-indigo-400/80!" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-[20px] px-4.5 py-3 text-[16px] leading-relaxed shadow-sm ${isUser
                      ? 'bg-linear-to-r from-indigo-600 to-indigo-700 text-white! font-medium rounded-tr-none'
                      : 'bg-[#131317]/80 border border-white/5 text-neutral-350! rounded-tl-none backdrop-blur-sm'
                      }`}>
                      {isUser ? msg.content : formatMessageContent(msg.content)}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-lg bg-[#121217] border border-white/5 flex items-center justify-center text-neutral-400! shrink-0">
                    <SleekBotIcon className="w-4 h-4 text-indigo-400/80!" />
                  </div>
                  <div className="rounded-[20px] rounded-tl-none px-5 py-4 bg-[#131317]/80 border border-white/5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400! rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400! rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400! rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Quick Links */}
            {messages.length === 1 && (
              <div className="px-6 pb-4 pt-1 flex flex-col gap-2 shrink-0">
                <span className="text-[11px] tracking-widest uppercase font-bold text-neutral-500! mb-0.5">Quick Inquiries</span>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="text-left px-3.5 py-3 bg-[#111115] border border-white/5 hover:bg-[#16161D] hover:border-indigo-500/20 transition-all rounded-xl text-[14px] font-bold text-neutral-300! hover:text-white! cursor-pointer flex items-center justify-between group"
                    >
                      <span className="line-clamp-2 pr-1">{sug}</span>
                      <Sparkles size={10} className="text-indigo-400! opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-white/5 bg-[#08080A] shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  placeholder={`Ask ${firstName}'s assistant...`}
                  className="w-full bg-[#111114] border border-white/5 focus:border-indigo-500/20 px-5 py-3.5 pr-14 rounded-2xl text-[16px] focus:outline-none text-white! placeholder:text-neutral-500! disabled:opacity-40 transition-all"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-500 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-lg shadow-indigo-600/10"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
