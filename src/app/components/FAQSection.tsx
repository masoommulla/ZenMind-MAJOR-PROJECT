import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Is ZenMind free to use?',
    a: 'Yes — the core platform including the AI chat companion, mood journal, peer circles, wellness goals, and reading lists are completely free. Live therapy sessions with professionals are available as affordable add-ons.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Absolutely. All your data is encrypted end-to-end. Your journal entries, mood logs, and chat history are private by default — no one else can see them. You can post anonymously in Peer Circles too. We are HIPAA-aligned in our data practices.',
  },
  {
    q: 'Do I need to be a certain age to use ZenMind?',
    a: 'ZenMind is designed primarily for adolescents aged 13–21. Users under 18 may need parental consent depending on their region. Our therapists are specially trained in adolescent mental health.',
  },
  {
    q: 'How does the AI therapist matching work?',
    a: 'Our 5-minute quiz assesses your needs, preferences, language, budget, and session style. The algorithm matches you with 3 best-fit verified therapists from our vetted network. You can switch anytime — no questions asked.',
  },
  {
    q: 'Are the therapists real, licensed professionals?',
    a: 'Yes. Every therapist on ZenMind is a licensed mental health professional verified by our team. They hold degrees in psychology, counseling, or social work and have experience specifically with adolescent clients.',
  },
  {
    q: 'What if I am in a crisis right now?',
    a: 'If you are in immediate danger, please call emergency services (112 in India) or Tele-MANAS at 14416. ZenMind is not a crisis service but our AI will always direct you to the right resources the moment you flag distress.',
  },
  {
    q: 'Can I use ZenMind without talking to a therapist?',
    a: 'Completely. Many users never book a therapy session and still see huge improvements through the AI chat, journal, wellness programs, peer circles, and goal tracker. Human therapy is always optional.',
  },
  {
    q: 'How do Peer Support Circles work?',
    a: 'Peer Circles are moderated group chat rooms around specific themes (anxiety, academics, family, etc.). They are text-based, real-time, and anonymous by default. A trained moderator oversees every circle to ensure safety.',
  },
];

export default function FAQSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 bg-white dark:bg-[#050505]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d5d3a]/08 dark:bg-[#10b981]/10 border border-[#0d5d3a]/15 dark:border-[#10b981]/20 mb-5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981]" />
            <span className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Questions? We have answers.
          </h2>
          <p className="text-base sm:text-lg text-[#4a7c5d] dark:text-gray-400 max-w-xl mx-auto">
            Everything you need to know before you take the first step.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#0d5d3a]/30 dark:border-[#10b981]/30 bg-[#f0fbf4] dark:bg-[#0d1f14]'
                    : 'border-[#0d5d3a]/10 dark:border-white/08 bg-white dark:bg-[#111111] hover:border-[#0d5d3a]/20 dark:hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${
                    isOpen ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-[#0a2617] dark:text-gray-100'
                  }`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isOpen
                      ? 'bg-[#0d5d3a] dark:bg-[#10b981] text-white'
                      : 'bg-[#0d5d3a]/08 dark:bg-white/08 text-[#0d5d3a] dark:text-[#10b981]'
                  }`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 text-sm text-[#4a7c5d] dark:text-gray-400 leading-relaxed border-t border-[#0d5d3a]/10 dark:border-white/08 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-[#4a7c5d] dark:text-gray-400 text-sm mb-5">
            Still have questions? Our team responds within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="px-7 py-3 bg-[#0d5d3a] text-white rounded-full font-semibold text-sm shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition"
            >
              Start for Free
            </motion.button>
            <motion.a
              href="mailto:hello@zenmind.in"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3 border border-[#0d5d3a]/25 dark:border-white/15 text-[#0d5d3a] dark:text-gray-300 rounded-full font-semibold text-sm hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
            >
              Email Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
