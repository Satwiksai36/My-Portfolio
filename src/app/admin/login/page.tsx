'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { CustomCursor } from '@/components/CustomCursor';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomCursor />
      <div
        className={`w-full min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
          isDark ? 'bg-[#0A0A0A]' : 'bg-[#FFFFFF]'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md p-8 sm:p-10"
          style={{
            background: isDark ? '#161616' : '#fbfbfb',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 right-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-px h-8 bg-black/20 dark:bg-white/20" />
            <div className="absolute top-0 right-0 w-8 h-px bg-black/20 dark:bg-white/20" />
          </div>
          <div className="absolute bottom-0 left-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-px h-8 bg-black/10 dark:bg-white/10" />
            <div className="absolute bottom-0 left-0 w-8 h-px bg-black/10 dark:bg-white/10" />
          </div>

          <div className="mb-8 text-center">
            <span
              className="text-[0.55rem] tracking-[0.28em] uppercase font-medium block mb-2"
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                color: isDark ? 'rgba(240,240,240,0.65)' : 'rgba(0,0,0,0.65)',
              }}
            >
              Control Panel
            </span>
            <h2
              className="font-black tracking-[-0.035em] leading-tight"
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 900,
                fontSize: '2.2rem',
                color: isDark ? '#F0F0F0' : '#0A0A0A',
              }}
            >
              Admin{' '}
              <span
                style={{
                  fontFamily: 'var(--font-instrument), Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: isDark ? 'rgba(240,240,240,0.55)' : 'rgba(0,0,0,0.55)',
                }}
              >
                Access
              </span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className={`block text-[0.58rem] tracking-[0.18em] uppercase mb-2.5 font-medium ${
                  isDark ? 'text-white/65' : 'text-black/65'
                }`}
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-transparent px-5 py-3.5 text-sm focus:outline-none transition-colors duration-200 border ${
                  isDark
                    ? 'border-white/22 text-white/85 placeholder:text-white/40 focus:border-white/50'
                    : 'border-black/22 text-black placeholder:text-black/45 focus:border-black/45'
                }`}
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <p
                className="text-[0.7rem] tracking-[0.12em] text-red-500 font-medium"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-black text-white py-4 text-[0.62rem] tracking-[0.22em] uppercase font-semibold hover:opacity-85 transition-opacity duration-200 disabled:opacity-40 flex items-center justify-center gap-2.5 cursor-pointer"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && (
                <Send
                  size={11}
                  className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
