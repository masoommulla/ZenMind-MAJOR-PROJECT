import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Lock, User } from 'lucide-react';
import logo from '../../../asset/logo.png';
import { apiFetch } from '../api/client';

type AdminLoginProps = {
  onBackHome: () => void;
  onAdminAuthSuccess: () => void;
};

export default function AdminLogin({ onBackHome, onAdminAuthSuccess }: AdminLoginProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get('username') || '');
    const password = String(form.get('password') || '');

    setBusy(true);
    setError(null);
    try {
      await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      onAdminAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f7fbf8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_24px_80px_rgba(7,29,19,0.18)] p-8 border border-black/5"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="ZenMind Logo" className="w-16 h-16 rounded-full mb-4 shadow-md" />
          <h1 className="text-2xl text-[#0a2617] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
            Admin Portal
          </h1>
          <p className="text-sm text-[#4a7c5d] mt-1">Sign in to manage ZenMind</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-[#0a2617] font-medium">Username</span>
            <div className="mt-1.5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]">
                <User className="w-4 h-4" />
              </span>
              <input
                name="username"
                type="text"
                required
                placeholder="Enter admin username"
                className="w-full rounded-xl border border-[#0d5d3a]/18 bg-[#fbfdfb] pl-10 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/25"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-[#0a2617] font-medium">Password</span>
            <div className="mt-1.5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-[#0d5d3a]/18 bg-[#fbfdfb] pl-10 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#0d5d3a]/25"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 py-3 rounded-xl bg-[#0a2617] text-white font-semibold shadow-lg shadow-[#0a2617]/20 hover:bg-[#071a0f] disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {busy ? 'Authenticating...' : 'Sign In'}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackHome}
          className="w-full mt-6 text-sm text-[#4a7c5d] hover:text-[#0a2617] font-medium transition"
        >
          &larr; Return to Website
        </button>
      </motion.div>
    </section>
  );
}
