import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Sparkles, BrainCircuit, HeartHandshake, ShieldCheck, 
  Calendar, FileText, Lock, Clock, IndianRupee, HelpCircle, ChevronDown, Activity, Users, Shield, Send, AlertTriangle, FileCode
} from 'lucide-react';
import { apiFetch } from '../api/client';

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group"
      >
        <span className={`text-lg sm:text-xl font-bold transition-colors ${isOpen ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-[#0a2617] dark:text-white group-hover:text-[#0d5d3a] dark:group-hover:text-[#10b981]'}`}>
          {q}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#e6f4ea] dark:bg-[#10b981]/20' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'}`}>
          <ChevronDown size={20} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0d5d3a] dark:text-[#10b981]' : 'text-gray-500 dark:text-gray-400'}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-[#4a7c5d] dark:text-gray-400 leading-relaxed text-base sm:text-lg max-w-4xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SupportForm = ({ type, title, subtitle }: { type: 'contact' | 'report'; title: string; subtitle: string }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await apiFetch('/support', { method: 'POST', body: JSON.stringify({ type, ...form }) });
      setMsg({ text: 'Submitted successfully. Our team will get back to you soon!', ok: true });
      setForm({ name: '', email: '', phone: '', subject: '', body: '' });
    } catch(err: any) {
      setMsg({ text: err.message || 'Failed to submit.', ok: false });
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, borderRadius: 5, border: '2px solid #fefefe',
    background: '#111', boxShadow: '4px 4px #fefefe',
    fontSize: 14, fontWeight: 600, color: '#fefefe', padding: '5px 12px', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { color: '#7e7e7e', fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
        <p className="text-[#4a7c5d] dark:text-gray-400 text-lg">{subtitle}</p>
      </div>

      <form onSubmit={submit} style={{
        background: '#111', padding: '28px 32px', display: 'flex', flexDirection: 'column',
        gap: 18, borderRadius: 5, border: '2px solid #fefefe', boxShadow: '4px 4px #fefefe',
      }}>
        <div style={{ color: '#fefefe', fontWeight: 900, fontSize: 20, marginBottom: 8 }}>
          {type === 'contact' ? 'Get in Touch,' : 'Report an Issue,'}
          <br /><span style={{ color: '#7e7e7e', fontWeight: 600, fontSize: 15 }}>fill out the form below</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>
            <span style={labelStyle}>Full Name</span>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Jane Doe" style={inputStyle} onFocus={e => (e.target.style.borderColor = '#2d8cf0')} onBlur={e => (e.target.style.borderColor = '#fefefe')} />
          </label>
          <label>
            <span style={labelStyle}>Email Address</span>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder="jane@example.com" style={inputStyle} onFocus={e => (e.target.style.borderColor = '#2d8cf0')} onBlur={e => (e.target.style.borderColor = '#fefefe')} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>
            <span style={labelStyle}>Mobile Number</span>
            <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="+91 9876543210" style={inputStyle} onFocus={e => (e.target.style.borderColor = '#2d8cf0')} onBlur={e => (e.target.style.borderColor = '#fefefe')} />
          </label>
          <label>
            <span style={labelStyle}>Subject</span>
            <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              placeholder={type === 'report' ? "Bug or broken link" : "How can we help?"} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#2d8cf0')} onBlur={e => (e.target.style.borderColor = '#fefefe')} />
          </label>
        </div>

        <label>
          <span style={labelStyle}>Message Details</span>
          <textarea required value={form.body} onChange={e => setForm({...form, body: e.target.value})}
            placeholder={type === 'report' ? "Describe the issue in detail..." : "Write your message here..."}
            rows={4}
            style={{ ...inputStyle, height: 'auto', resize: 'vertical', paddingTop: 10, paddingBottom: 10 }}
            onFocus={e => (e.target.style.borderColor = '#2d8cf0')} onBlur={e => (e.target.style.borderColor = '#fefefe')} />
        </label>

        <button type="submit" disabled={busy} style={{
          marginTop: 8, width: 140, height: 42, borderRadius: 5,
          border: '2px solid #fefefe', background: '#111', boxShadow: '4px 4px #fefefe',
          fontSize: 15, fontWeight: 600, color: '#fefefe', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 0.15s ease', opacity: busy ? 0.6 : 1,
        }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.transform = 'translate(3px,3px)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px #fefefe'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
        >
          <Send size={15} /> {busy ? 'Sending...' : `Submit ${type === 'report' ? 'Report' : 'Message'}`}
        </button>

        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 5, fontWeight: 700, fontSize: 13,
            border: `1px solid ${msg.ok ? '#10b981' : '#ef4444'}`,
            color: msg.ok ? '#10b981' : '#ef4444', background: 'transparent' }}>
            {msg.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default function ProductPage({ page, onClose }: { page: string; onClose: () => void }) {
  
  const renderContent = () => {
    switch(page) {
      case 'Features':
        return (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto pt-10 pb-6">
              <h2 className="text-4xl sm:text-6xl font-black text-[#0a2617] dark:text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                Everything you need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d5d3a] to-[#27a86a] dark:from-[#10b981] dark:to-[#34d399]">mental wellness.</span>
              </h2>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-lg sm:text-xl">
                A powerful suite of tools designed specifically for adolescents to track, manage, and improve their mental health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Spans 2 cols */}
              <div className="md:col-span-2 bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] rounded-[2rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                  <BrainCircuit size={300} />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                    <BrainCircuit size={32} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Intelligent AI Companion</h3>
                  <p className="text-white/80 text-lg max-w-md">
                    Available 24/7. Our highly advanced AI provides instant emotional support, coping mechanisms, and a safe space to vent without judgment.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <HeartHandshake size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0a2617] dark:text-white mb-3">Professional Therapy</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400">
                  Book secure 1-on-1 video sessions with licensed and verified mental health professionals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0a2617] dark:text-white mb-3">Mood Tracking</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400">
                  Visualize your emotional trends over time with our intuitive daily mood logging system.
                </p>
              </div>

              {/* Feature 4 - Spans 2 cols */}
              <div className="md:col-span-2 bg-[#f0fbf4] dark:bg-[#0a1a12] border border-[#0d5d3a]/10 dark:border-[#10b981]/20 rounded-[2rem] p-8 sm:p-12 shadow-sm relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#0d5d3a]/5 dark:from-[#10b981]/10 to-transparent" />
                 <div className="relative z-10">
                  <div className="w-16 h-16 bg-white dark:bg-[#111] shadow-sm rounded-2xl flex items-center justify-center mb-8 text-[#0d5d3a] dark:text-[#10b981] group-hover:scale-110 transition-transform">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-3xl font-bold text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>End-to-End Privacy</h3>
                  <p className="text-[#4a7c5d] dark:text-gray-400 text-lg max-w-lg">
                    We built ZenMind on a foundation of absolute privacy. Your therapy videos are never recorded, and your AI chat logs are encrypted. Your data belongs to you.
                  </p>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'AI Chatbot':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
              <div className="w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-2 bg-white dark:bg-[#111] rounded-full shadow-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                  <BrainCircuit className="text-indigo-600 dark:text-indigo-400" size={48} />
                </div>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl sm:text-6xl font-black text-[#0a2617] dark:text-white mb-6 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Meet Your AI Companion
                </h2>
                <p className="text-lg sm:text-xl text-[#4a7c5d] dark:text-gray-400 leading-relaxed mb-10">
                  We are engineering a proprietary emotional intelligence model specifically calibrated for adolescent cognitive behavioral support.
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                  <Sparkles size={20} />
                  Specifications & Beta Access Coming Soon
                </div>
              </div>
            </div>
          </div>
        );

      case 'Therapy':
        return (
          <div className="space-y-16 py-8">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6">
                <Shield size={16} /> Verified Professionals Only
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-[#0a2617] dark:text-white mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Therapy built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">absolute trust.</span>
              </h2>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                We believe you deserve the best. Every single therapist on ZenMind is rigorously vetted, verified, and interviewed by our core medical administration team.
              </p>
            </div>

            {/* Vetting Process */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Credential Verification", desc: "We manually verify all medical licenses and educational backgrounds with issuing authorities." },
                { step: "02", title: "Clinical Interview", desc: "Therapists undergo a rigorous interview focusing on adolescent psychology and crisis management." },
                { step: "03", title: "Continuous Monitoring", desc: "We actively monitor patient feedback and ratings to ensure the highest standard of care is maintained." }
              ].map((v, i) => (
                <div key={i} className="bg-white dark:bg-[#111] p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 relative overflow-hidden">
                  <div className="text-6xl font-black text-gray-100 dark:text-white/5 absolute -top-4 -right-4">{v.step}</div>
                  <div className="relative z-10 mt-8">
                    <h4 className="text-xl font-bold text-[#0a2617] dark:text-white mb-3">{v.title}</h4>
                    <p className="text-[#4a7c5d] dark:text-gray-400">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />

            {/* Cancellation Policy */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Cancellation Policy</h3>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-lg">Transparent and fair policies to respect both your time and the therapist's schedule.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <div className="w-20 h-20 shrink-0 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-2xl font-black border-4 border-white dark:border-[#111] shadow-lg">100%</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0a2617] dark:text-white mb-2">3+ Days Advance Notice</h4>
                    <p className="text-[#4a7c5d] dark:text-gray-400">Cancel your session 3 or more days prior to the scheduled time to receive a full, unconditional refund.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <div className="w-20 h-20 shrink-0 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-black border-4 border-white dark:border-[#111] shadow-lg">80%</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0a2617] dark:text-white mb-2">2 Days Advance Notice</h4>
                    <p className="text-[#4a7c5d] dark:text-gray-400">Cancellations made exactly 2 days prior incur a small 20% processing fee.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <div className="w-20 h-20 shrink-0 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 text-2xl font-black border-4 border-white dark:border-[#111] shadow-lg">70%</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0a2617] dark:text-white mb-2">Late / Instant Cancellation</h4>
                    <p className="text-[#4a7c5d] dark:text-gray-400">Within 48 hours, a 30% fee is retained to cover platform and therapist reservation charges.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/30 rounded-2xl p-6 flex items-start gap-4">
                <Clock className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg mb-2">The 10-Minute No-Show Rule</h4>
                  <p className="text-blue-800/80 dark:text-blue-300/80">
                    If you do not join the video session within 10 minutes of the start time, the session is automatically cancelled (subject to late cancellation policy). If the therapist fails to join within 10 minutes, you are immediately issued a 100% refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Pricing':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
                Simple, transparent pricing
              </h2>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-lg">
                Choose the plan that best fits your wellness journey.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
              {/* Free Tier */}
              <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>ZenFree</h3>
                <div className="text-3xl font-black text-[#0d5d3a] dark:text-[#10b981] mb-1">₹0</div>
                <div className="text-sm text-[#4a7c5d] dark:text-gray-400 mb-6">Free forever</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 10 AI Chat credits / mo</li>
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> Basic mood tracking</li>
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> Community access</li>
                </ul>
              </div>

              {/* Silver Tier */}
              <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/20 dark:border-[#10b981]/20 p-8 rounded-[2rem] shadow-md hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>ZenSilver</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="text-3xl font-black text-[#0d5d3a] dark:text-[#10b981]">₹199</div>
                  <div className="text-sm text-[#4a7c5d] dark:text-gray-400">/mo</div>
                </div>
                <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mb-6">or ₹1,799/yr</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 100 AI Chat credits / mo</li>
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> Unlimited mood tracking</li>
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 2 Wellness Programs</li>
                  <li className="flex items-center gap-2 text-sm text-[#0a2617] dark:text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 10% Store Discount</li>
                </ul>
              </div>

              {/* Gold Tier */}
              <div className="bg-gradient-to-b from-[#0d5d3a] to-[#1a8a5a] p-8 rounded-[2rem] shadow-xl transform md:-translate-y-4 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>ZenGold</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="text-3xl font-black text-white">₹499</div>
                  <div className="text-sm text-white/80">/mo</div>
                </div>
                <div className="text-xs text-white/80 mb-6">or ₹4,499/yr</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-white"><CheckCircle size={16} className="text-yellow-400" /> 1 Free Therapy Session / mo</li>
                  <li className="flex items-center gap-2 text-sm text-white"><CheckCircle size={16} className="text-yellow-400" /> 500 AI Chat credits / mo</li>
                  <li className="flex items-center gap-2 text-sm text-white"><CheckCircle size={16} className="text-yellow-400" /> All Wellness Programs</li>
                  <li className="flex items-center gap-2 text-sm text-white"><CheckCircle size={16} className="text-yellow-400" /> 20% Store Discount</li>
                </ul>
              </div>

              {/* Platinum Tier */}
              <div className="bg-[#1a1a1a] dark:bg-[#050505] border border-gray-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>ZenPlatinum</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="text-3xl font-black text-white">₹999</div>
                  <div className="text-sm text-gray-400">/mo</div>
                </div>
                <div className="text-xs text-gray-400 mb-6">or ₹8,999/yr</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 2 Free Therapy Sessions / mo</li>
                  <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> Unlimited AI Chat</li>
                  <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> Direct Therapist Chat</li>
                  <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={16} className="text-[#10b981]" /> 30% Store Discount</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'FAQ':
        return (
          <div className="max-w-4xl mx-auto py-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-6xl font-black text-[#0a2617] dark:text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d5d3a] to-[#27a86a] dark:from-[#10b981] dark:to-[#34d399]">Questions.</span>
              </h2>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-lg sm:text-xl">
                Everything you need to know about the ZenMind platform, therapy, and billing.
              </p>
            </div>

            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-sm">
              {[
                {
                  q: "How do I know the therapists are qualified?",
                  a: "Every therapist undergoes a stringent vetting process by the ZenMind administration. We manually verify medical licenses, educational backgrounds, and clinic details before they are allowed on the platform. We ensure you are speaking with a certified professional."
                },
                {
                  q: "What happens if I miss my session?",
                  a: "We have a strict 10-minute grace period rule. If you do not join the video room within 10 minutes of the scheduled start time, the session is automatically cancelled and is subject to our late cancellation policy (which yields a 70% refund)."
                },
                {
                  q: "What if the therapist doesn't show up?",
                  a: "In the rare event that a therapist fails to join the room within the 10-minute grace period, the system will automatically cancel the session and you will be issued a 100% refund immediately."
                },
                {
                  q: "How secure is my data and video call?",
                  a: "Extremely secure. All video calls use WebRTC with end-to-end encryption. We do not record or store your video sessions. Furthermore, your chat logs with the AI companion are encrypted and anonymized to ensure complete privacy."
                },
                {
                  q: "How long does a refund take to process?",
                  a: "Once a cancellation occurs, the refund is initiated automatically from our end. It typically takes 5-7 business days for the funds to reflect in your original payment method, depending on your bank's processing times."
                }
              ].map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        );

      case 'Contact Us':
        return <SupportForm type="contact" title="Get in Touch" subtitle="Have a question or need assistance? Our support team is here to help." />;

      case 'Report Issue':
        return <SupportForm type="report" title="Report an Issue" subtitle="Found a bug or experiencing technical difficulties? Let us know so we can fix it." />;

      case 'Documentation':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-[#0d5d3a]/20 dark:bg-[#10b981]/20 blur-3xl rounded-full" />
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[3rem] shadow-2xl relative z-10 w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e6f4ea] dark:bg-[#0d5d3a]/30 text-[#0d5d3a] dark:text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <FileCode size={30} className="sm:hidden" />
                  <FileCode size={36} className="hidden sm:block" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0a2617] dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Documentation
                </h2>
                <div className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold text-sm mb-4 sm:mb-6 uppercase tracking-widest">
                  Coming Soon
                </div>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                  We are building comprehensive developer and user documentation to help you get the most out of the ZenMind platform.
                </p>
              </div>
            </div>
          </div>
        );

      case 'Safety Guidelines':
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full" />
              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[3rem] shadow-2xl relative z-10 w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <ShieldCheck size={30} className="sm:hidden" />
                  <ShieldCheck size={36} className="hidden sm:block" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0a2617] dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Safety Guidelines
                </h2>
                <div className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold text-sm mb-4 sm:mb-6 uppercase tracking-widest">
                  Coming Soon
                </div>
                <p className="text-[#4a7c5d] dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                  Community safety is our priority. Our comprehensive safety guidelines and crisis resources page is currently being finalized.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-[#f7fbf8] dark:bg-[#050505] overflow-y-auto"
    >
      {/* Desktop header — hidden on mobile */}
      <header className="hidden sm:flex sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 sm:px-8 py-4 items-center justify-between">
        <button 
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-[#0a2617] dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Back to site
        </button>
        <span className="text-sm font-black tracking-widest uppercase text-gray-400 dark:text-gray-500">
          ZenMind / {page}
        </span>
      </header>
      {/* Mobile floating close button */}
      <button onClick={onClose} className="sm:hidden fixed top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-[#0a2617] dark:text-white hover:bg-gray-100 transition">
        <ChevronLeft size={18} />
      </button>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 pb-32">
        {renderContent()}
      </main>
    </motion.div>
  );
}
