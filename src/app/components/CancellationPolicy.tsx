import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldAlert, Clock, IndianRupee, Info } from 'lucide-react';

export default function CancellationPolicy({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-[#f7fbf8] dark:bg-[#050505] overflow-y-auto"
    >
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-[#0d5d3a]/10 dark:border-white/10 px-4 sm:px-8 py-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-xl border border-[#0d5d3a]/15 text-[#0d5d3a] dark:border-white/10 dark:text-gray-300 hover:bg-[#f0fbf4] dark:hover:bg-white/10 transition flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm hidden sm:inline">Back to Dashboard</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Cancellation Policy
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 pb-24">
        
        {/* Intro */}
        <div className="bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
            <ShieldAlert size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>ZenMind Therapy Session Policies</h2>
            <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
              We value both your time and the time of our dedicated mental health professionals. 
              Please read our comprehensive video conference and session cancellation guidelines below.
            </p>
          </div>
        </div>

        {/* Refund Tiers */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#0a2617] dark:text-white flex items-center gap-3">
            <IndianRupee className="text-[#0d5d3a] dark:text-[#10b981]" size={28} />
            Refund Structure
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-xl font-black">100%</span>
              </div>
              <h4 className="text-lg font-bold text-[#0a2617] dark:text-white mb-2">3+ Days Before</h4>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">
                Cancel your session 3 or more days prior to the scheduled time to receive a full, 100% refund.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-xl font-black">80%</span>
              </div>
              <h4 className="text-lg font-bold text-[#0a2617] dark:text-white mb-2">2 Days Before</h4>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">
                Cancel your session exactly 2 days prior to the scheduled time. A 20% processing fee is retained.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-xl font-black">70%</span>
              </div>
              <h4 className="text-lg font-bold text-[#0a2617] dark:text-white mb-2">Instant / Late Cancel</h4>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">
                Cancellations made within 48 hours or instant cancellations yield a 70% refund. 30% covers platform and therapist reservation charges.
              </p>
            </div>
          </div>
        </div>

        {/* Video Conference Rules */}
        <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-[#0a2617] dark:text-white flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
            <Clock className="text-[#0d5d3a] dark:text-[#10b981]" size={24} />
            Video Conference & No-Show Policy
          </h3>
          <ul className="space-y-4 text-[#4a7c5d] dark:text-gray-300 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981] mt-2 shrink-0" />
              <p><strong>10-Minute Grace Period:</strong> If you do not join the video session within 10 minutes of the scheduled start time, the session will be automatically terminated and marked as cancelled.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981] mt-2 shrink-0" />
              <p><strong>Therapist No-Show:</strong> In the rare event that a therapist does not join within the 10-minute grace period, the session will be automatically cancelled, and you will receive a 100% refund.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d5d3a] dark:bg-[#10b981] mt-2 shrink-0" />
              <p><strong>Technical Issues:</strong> Please ensure your camera and microphone permissions are granted prior to the session. If technical issues arise on the platform's end preventing the session from occurring, a full refund or free reschedule will be provided.</p>
            </li>
          </ul>
        </div>

        {/* Refund Process Info */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start">
          <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">How Refunds are Processed</h4>
            <p className="text-blue-800/80 dark:text-blue-400/80 text-sm leading-relaxed">
              Refunds are automatically initiated upon cancellation. Please allow 5-7 business days for the credited amount to reflect in your original payment method. If you do not see the refund after this period, please contact our support team.
            </p>
          </div>
        </div>

      </main>
    </motion.div>
  );
}
