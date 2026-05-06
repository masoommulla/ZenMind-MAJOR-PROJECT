import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function TherapistLogin({ onBackHome, onAuthSuccess }: { onBackHome: () => void, onAuthSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/therapist/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or account suspended.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col transition-colors duration-300">
      <header className="p-6">
        <button
          onClick={onBackHome}
          className="flex items-center gap-2 text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-white transition font-medium"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#fbfdfb] dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-[#0d5d3a] dark:text-[#10b981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Therapist Portal
            </h1>
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-2 text-center">
              Sign in to manage your schedule, sessions, and connect with clients.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-[#0a2617] dark:text-white outline-none focus:border-[#0d5d3a] dark:focus:border-[#10b981] transition"
                placeholder="doctor@zenmind.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-[#0a2617] dark:text-white outline-none focus:border-[#0d5d3a] dark:focus:border-[#10b981] transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} /> Secure Login
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-xs text-[#4a7c5d] dark:text-gray-500 mt-8">
            Note: Accounts are issued strictly by ZenMind Administrators. If you cannot access your account, please contact support.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
