import { motion } from 'motion/react';
import { X, Clock, Bell } from 'lucide-react';

const PAGE_CONTENT: Record<string, { emoji: string; title: string; subtitle: string; desc: string }> = {
  Blog: {
    emoji: '📝',
    title: 'ZenMind Blog',
    subtitle: 'Insights, stories & mental health resources',
    desc: "We're crafting articles, guides, and personal stories about adolescent mental wellness. Our blog will cover mindfulness, coping strategies, therapist insights, and community stories.",
  },
  Press: {
    emoji: '📰',
    title: 'Press & Media',
    subtitle: 'ZenMind in the news',
    desc: "Our press room is being prepared. Here you'll find press releases, media assets, coverage links, and contact information for journalists and media partners.",
  },
  Partners: {
    emoji: '🤝',
    title: 'Partner with ZenMind',
    subtitle: 'Together we make mental health accessible',
    desc: "We partner with schools, colleges, NGOs, and healthcare providers to expand access to mental wellness resources. Partnership opportunities and our partner programme will launch here soon.",
  },
};

export default function ComingSoonPage({ page, onClose }: { page: string; onClose: () => void }) {
  const content = PAGE_CONTENT[page] || {
    emoji: '🌿',
    title: page,
    subtitle: 'Coming soon',
    desc: 'This page is under construction. Check back soon for updates!',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white dark:bg-[#050505] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-[#0d5d3a]/10 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 py-4">
        <span className="font-black text-[#0d5d3a] dark:text-[#10b981] text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>ZenMind · {page}</span>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition"><X size={20} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          {/* Animated rings */}
          <div className="relative flex items-center justify-center mb-10 mx-auto" style={{ width: 180, height: 180 }}>
            {[180, 140, 100].map((size, i) => (
              <motion.div key={i} className="absolute rounded-full border-2 border-[#0d5d3a]/20 dark:border-[#10b981]/20"
                style={{ width: size, height: size }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
            ))}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-4xl shadow-2xl shadow-[#0d5d3a]/30 z-10">
              {content.emoji}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-5">
              Coming Soon
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              {content.title}
            </h1>
            <p className="text-[#0d5d3a] dark:text-[#10b981] font-bold mb-4">{content.subtitle}</p>
            <p className="text-[#4a7c5d] dark:text-gray-400 text-base leading-relaxed mb-8">{content.desc}</p>

            {/* ETA chip */}
            <div className="inline-flex items-center gap-2 bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 border border-[#0d5d3a]/20 dark:border-[#10b981]/20 rounded-2xl px-5 py-3 text-sm text-[#0d5d3a] dark:text-[#10b981] font-bold">
              <Clock size={15} />
              We're working on it — launching soon!
            </div>

            {/* Notify */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <div className="flex-1 max-w-xs relative mx-auto sm:mx-0">
                <Bell size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d]" />
                <input type="email" placeholder="your@email.com"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm" />
              </div>
              <button className="px-6 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition shadow-lg shadow-[#0d5d3a]/20">
                Notify Me
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
