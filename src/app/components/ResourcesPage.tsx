import { motion } from 'motion/react';
import { Phone, Mail, ExternalLink, Shield, FileText, Users, HeartHandshake, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

const CRISIS_LINES = [
  { name: 'iCall – Tata Institute', number: '9152987821', desc: 'Mon–Sat, 8am–10pm · Free counselling & therapy', tag: 'Counselling' },
  { name: 'Kiran – Govt of India', number: '1800-599-0019', desc: '24/7 · Free · 13 Indian languages · All India', tag: '24/7 Free' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 · Mental health & suicide prevention', tag: '24/7' },
  { name: 'iCharity / iCall Alt',  number: '9820466627',   desc: 'Crisis support & emotional counselling', tag: 'Counselling' },
  { name: 'SNEHI',                 number: '044-24640050', desc: 'Chennai · Emotional support helpline', tag: 'Regional' },
  { name: 'NIMHANS Helpline',      number: '080-46110007', desc: 'National Institute of Mental Health, Bangalore', tag: 'Clinical' },
  { name: 'Aasra',                 number: '022-27546669', desc: '24/7 · Suicide prevention & emotional support', tag: '24/7' },
  { name: 'Sumaitri',              number: '011-23389090', desc: 'New Delhi · Emotional support, Mon–Fri', tag: 'Regional' },
  { name: 'Arpita Suicide Prev.', number: '080-23655557', desc: 'Bangalore · Crisis counselling', tag: 'Regional' },
  { name: 'Mann Talks',            number: '8686139139',   desc: 'Student mental health support', tag: 'Students' },
  { name: 'Fortis StressLine',     number: '8376804102',   desc: 'Fortis Hospital · 24/7 Crisis support', tag: '24/7' },
  { name: 'Parivarthan',           number: '7676602602',   desc: 'Bangalore · Individual & family counselling', tag: 'Counselling' },
];

const TAG_COLORS: Record<string, string> = {
  '24/7':       'bg-green-100  dark:bg-green-500/20  text-green-700  dark:text-green-400',
  '24/7 Free':  'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  'Free':       'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  'Counselling':'bg-blue-100   dark:bg-blue-500/20   text-blue-700   dark:text-blue-400',
  'Clinical':   'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  'Regional':   'bg-amber-100  dark:bg-amber-500/20  text-amber-700  dark:text-amber-400',
  'Students':   'bg-pink-100   dark:bg-pink-500/20   text-pink-700   dark:text-pink-400',
};

export default function ResourcesPage({ page, onClose }: { page: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-[#f7fbf8] dark:bg-[#050505] overflow-y-auto"
    >
      {/* Floating close button — no full header */}
      <button onClick={onClose}
        className="fixed top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] shadow-lg border border-[#0d5d3a]/20 dark:border-white/10 flex items-center justify-center text-[#0a2617] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition">
        
      </button>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-14 pb-24">
        {page === 'Help Center' && <HelpCenter />}
        {page === 'Privacy Policy' && <PrivacyPolicy />}
        {page === 'Terms of Service' && <TermsOfService />}
        {page === 'Crisis Support' && <CrisisSupport />}
        {page === 'Community' && <Community />}
      </div>
    </motion.div>
  );
}

/* ── HELP CENTER ── */
function HelpCenter() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-4">Help Center</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>How can we help?</h1>
        <p className="text-[#4a7c5d] dark:text-gray-400">Find answers, contact support, or reach a real human for help.</p>
      </div>

      {[
        { q: 'How do I create an account?', a: 'Click "Get Started" on the home page, enter your email and set a password. Verify your email to activate your account.' },
        { q: 'How do I book a therapy session?', a: 'Navigate to the Therapy Hub in your dashboard, browse available therapists, and click "Book Session" on any therapist card.' },
        { q: 'Are my conversations private?', a: 'Absolutely. All AI chats are encrypted and never shared. Video sessions use end-to-end WebRTC encryption and are never recorded.' },
        { q: 'How do I cancel a session?', a: 'Go to Dashboard → My Sessions → find your upcoming session → click Cancel. Refund policy applies based on how early you cancel.' },
        { q: 'I forgot my password — what do I do?', a: 'Click "Forgot Password" on the login page. We\'ll send a reset link to your registered email address.' },
        { q: 'How do I report a problem?', a: 'Use the "Report Issue" link in the Support section of the footer, or email us at support@zenmind.in' },
      ].map((faq, i) => (
        <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-6">
          <h3 className="font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{faq.q}</h3>
          <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
        </div>
      ))}

      <div className="bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 rounded-2xl border border-[#0d5d3a]/20 p-6 text-center">
        <p className="font-bold text-[#0a2617] dark:text-white mb-2">Still need help?</p>
        <a href="mailto:support@zenmind.in" className="inline-flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:underline">
          <Mail size={16} /> support@zenmind.in
        </a>
      </div>
    </div>
  );
}

/* ── CRISIS SUPPORT ── */
function CrisisSupport() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black text-sm mb-4">
          <AlertTriangle size={16} /> If you are in immediate danger, call <a href="tel:112" className="underline">112</a>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Crisis Support</h1>
        <p className="text-[#4a7c5d] dark:text-gray-400 max-w-xl mx-auto">You are not alone. Trained counsellors are available right now. Tap any number to call directly.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CRISIS_LINES.map((line, i) => (
          <motion.a key={i} href={`tel:${line.number.replace(/[^0-9]/g, '')}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group bg-white dark:bg-[#111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-5 flex items-start gap-4 hover:border-[#0d5d3a]/40 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-full bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0d5d3a] transition-colors">
              <Phone size={18} className="text-[#0d5d3a] dark:text-[#10b981] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="font-black text-[#0a2617] dark:text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{line.name}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${TAG_COLORS[line.tag] || 'bg-gray-100 text-gray-600'}`}>{line.tag}</span>
              </div>
              <p className="text-[#0d5d3a] dark:text-[#10b981] font-black text-base">{line.number}</p>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-xs mt-0.5">{line.desc}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6">
        <p className="text-amber-800 dark:text-amber-300 text-sm font-semibold leading-relaxed">
          <strong>Please note:</strong> ZenMind is a supportive platform, not an emergency service. If you or someone you know is in immediate danger, please call <strong>112</strong> (India Emergency) or go to your nearest hospital.
        </p>
      </div>
    </div>
  );
}

/* ── PRIVACY POLICY ── */
function PrivacyPolicy() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect only what is necessary: your name, email, and session preferences. AI conversations are processed in real-time and not permanently stored in identifiable form. Therapy session metadata (time, duration) is stored for billing — video content is never recorded.' },
    { title: 'How We Use Your Data', body: 'Your data is used exclusively to provide the ZenMind service: to personalise your experience, connect you with therapists, and improve our AI model. We never sell, rent, or share your personal data with third parties for advertising.' },
    { title: 'Data Security', body: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Video sessions use end-to-end WebRTC encryption. We conduct regular security audits and follow industry best practices.' },
    { title: 'Data Retention', body: 'Account data is retained for the duration of your account. You can request complete deletion at any time by contacting support@zenmind.in. Deletion is processed within 30 days.' },
    { title: 'Cookies', body: 'We use essential cookies for authentication and session management. No third-party tracking cookies are used. You can clear cookies at any time via your browser settings.' },
    { title: 'Children\'s Privacy', body: 'ZenMind is designed for adolescents aged 13+. Users under 18 should use the platform with parental awareness. We do not knowingly collect data from children under 13.' },
    { title: 'Your Rights', body: 'You have the right to access, correct, export, or delete your personal data. Contact us at privacy@zenmind.in for any data rights requests. We respond within 7 business days.' },
    { title: 'Contact', body: 'Privacy Officer: privacy@zenmind.in | ZenMind Healthcare, India | Last updated: May 2026' },
  ];
  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-4">Legal</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Privacy Policy</h1>
        <p className="text-[#4a7c5d] dark:text-gray-400">Your privacy is our foundational commitment. We are transparent about everything.</p>
      </div>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-[#0d5d3a] dark:text-[#10b981] shrink-0" /><h3 className="font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{s.title}</h3></div>
            <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── TERMS OF SERVICE ── */
function TermsOfService() {
  const sections = [
    { title: 'Acceptance of Terms', body: 'By creating an account on ZenMind, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
    { title: 'Eligibility', body: 'You must be at least 13 years of age to use ZenMind. Users under 18 are advised to inform a parent or guardian. By using the platform, you confirm you meet these requirements.' },
    { title: 'Use of the Platform', body: 'ZenMind is a mental wellness support platform, not a substitute for emergency medical care. The AI companion provides emotional support — it is not a licensed therapist. For medical emergencies, contact 112 immediately.' },
    { title: 'Therapy Sessions', body: 'All therapists are independently licensed professionals. ZenMind facilitates the connection and session but is not responsible for the clinical advice provided by therapists. Sessions are subject to our cancellation and refund policy.' },
    { title: 'User Content', body: 'You retain ownership of any content you submit. By submitting community stories, you grant ZenMind a non-exclusive licence to display and moderate that content within the platform.' },
    { title: 'Prohibited Conduct', body: 'You may not use ZenMind to harass others, post harmful content, attempt to reverse-engineer the platform, or misrepresent yourself as a healthcare professional.' },
    { title: 'Payment & Refunds', body: 'Session fees are charged at the time of booking. Refunds follow our cancellation policy (100% for 3+ days notice, 80% for 2 days, 70% for late cancellation). All payments are processed securely.' },
    { title: 'Limitation of Liability', body: 'ZenMind provides the platform "as is". We are not liable for clinical outcomes, third-party service disruptions, or indirect damages arising from platform use.' },
    { title: 'Changes to Terms', body: 'We may update these terms at any time. Continued use of the platform after updates constitutes acceptance. We will notify you of significant changes via email.' },
    { title: 'Contact', body: 'Legal: legal@zenmind.in | ZenMind Healthcare, India | Last updated: May 2026' },
  ];
  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-4">Legal</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Terms of Service</h1>
        <p className="text-[#4a7c5d] dark:text-gray-400">Simple, transparent terms. No hidden surprises.</p>
      </div>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-6">
            <h3 className="font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}><span className="text-[#0d5d3a] dark:text-[#10b981] mr-2">{i + 1}.</span>{s.title}</h3>
            <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── COMMUNITY ── */
function Community() {
  return (
    <div className="space-y-10 text-center">
      <div>
        <span className="inline-block px-4 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-4">Community</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>You belong here</h1>
        <p className="text-[#4a7c5d] dark:text-gray-400 max-w-lg mx-auto">ZenMind's community is a safe, moderated space for adolescents to share, support each other, and heal together.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 text-left">
        {[
          { icon: Users, title: 'Peer Circles', desc: 'Join topic-based support circles — anxiety, sleep, exam stress, self-esteem and more. Real conversations with peers who understand.' },
          { icon: HeartHandshake, title: 'Community Stories', desc: 'Read and share personal mental health journeys. Every story you share (anonymously if you choose) could be someone else\'s turning point.' },
          { icon: Shield, title: 'Safe & Moderated', desc: 'All community content is reviewed by our moderation team. Harmful content is removed swiftly. Your safety is always the priority.' },
        ].map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-6">
            <div className="w-11 h-11 rounded-2xl bg-[#0d5d3a] flex items-center justify-center mb-4"><Icon size={20} className="text-white" /></div>
            <h3 className="font-black text-[#0a2617] dark:text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
            <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-[#0d5d3a] to-[#10b981] rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Join the community</h3>
        <p className="text-white/80 mb-4 text-sm">Sign in to access Peer Circles, share your story, and connect with others on the same journey.</p>
        <span className="inline-block px-5 py-2.5 rounded-xl bg-white text-[#0d5d3a] font-black text-sm">Sign In to Join →</span>
      </div>
    </div>
  );
}
