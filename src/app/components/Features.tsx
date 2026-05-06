import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, BookOpen, Users, Shield, Zap, LineChart } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI-Powered Chatbot',
    description: 'Share your thoughts and feelings with our empathetic AI companion that listens without judgment, available 24/7.',
    video: '/asset/page2/ai.mp4',
    isFirst: true,
  },
  {
    icon: BookOpen,
    title: 'Inspirational Stories',
    description: 'Receive personalized, real-time stories that resonate with your experiences and provide hope and inspiration.',
    video: '/asset/page2/story.mp4',
  },
  {
    icon: Users,
    title: 'Professional Therapists',
    description: 'Connect with licensed therapists who specialize in adolescent mental health for guided support.',
    video: '/asset/page2/therapiest.mp4',
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Your conversations are completely confidential and protected with end-to-end encryption.',
    video: '/asset/page2/privacy.mp4',
  },
  {
    icon: Zap,
    title: 'Instant Support',
    description: 'Get immediate help when you need it most, with crisis support and coping strategies.',
    video: '/asset/page2/support.mp4',
  },
  {
    icon: LineChart,
    title: 'Weekly & Monthly Analysis',
    description: 'Track trends in mood, habits, and progress with clear weekly and monthly wellness analysis.',
    video: '/asset/page2/graph.mp4',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScrollCards = useCallback((direction: 'left' | 'right') => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = Math.min(slider.clientWidth * 0.85, 520);
    slider.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8f5e9] dark:bg-[#10b981] rounded-full blur-3xl opacity-50 dark:opacity-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c8e6c9] dark:bg-[#059669] rounded-full blur-3xl opacity-30 dark:opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-medium">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
              Thrive
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4">
            Our comprehensive platform provides multiple pathways to support your mental wellness journey.
          </p>
        </motion.div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(13, 93, 58, 0.2)' }}
                transition={{ duration: 0.3 }}
                className="h-[24rem] sm:h-[25rem] lg:h-[26rem] min-w-[82%] sm:min-w-[60%] lg:min-w-[42%] xl:min-w-[36%] snap-start"
              >
                <div
                  className={`group relative flex h-full items-end overflow-hidden rounded-3xl border border-white/20 p-6 sm:p-8 ${feature.isFirst ? 'justify-end text-right' : ''}`}
                >
                  <video
                    className={`absolute inset-0 h-full w-full object-cover ${feature.isFirst ? 'object-right' : 'object-center'}`}
                    src={feature.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/65" />
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.08 }}
                    viewport={{ once: true, amount: 0.35 }}
                    className="relative z-10 max-w-xl"
                  >
                    <div className="mb-4 sm:mb-6 inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="mb-3 sm:mb-4 text-2xl sm:text-3xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      {feature.title}
                    </h3>
                    <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleScrollCards('left')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0d5d3a]/25 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0d5d3a] dark:text-gray-300 text-xl leading-none transition hover:border-[#0d5d3a] dark:hover:border-white/20 hover:bg-[#0d5d3a] dark:hover:bg-[#222222] hover:text-white dark:hover:text-white"
            aria-label="Scroll features left"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => handleScrollCards('right')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0d5d3a]/25 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0d5d3a] dark:text-gray-300 text-xl leading-none transition hover:border-[#0d5d3a] dark:hover:border-white/20 hover:bg-[#0d5d3a] dark:hover:bg-[#222222] hover:text-white dark:hover:text-white"
            aria-label="Scroll features right"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
