import { useRef, useState, type MouseEvent } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Calendar, Video, Clock, Award, ArrowRight } from 'lucide-react';
import therapyVideo from '../../../asset/therapy.mp4';

const benefits = [
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule',
  },
  {
    icon: Video,
    title: 'Video or Chat',
    description: 'Choose your preferred communication method',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get matched with a therapist in 24 hours',
  },
  {
    icon: Award,
    title: 'Licensed Professionals',
    description: 'All therapists are certified and experienced',
  },
];

export default function TherapySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.6 });
  const cardWidth = useTransform(smoothProgress, [0, 1], ['70vw', '95vw']);
  const topRadius = useTransform(smoothProgress, [0, 1], [26, 42]);

  const handleCardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  };

  return (
    <section id="therapy" ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#050505] transition-colors duration-300 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f2f8f3] dark:bg-[#10b981] rounded-full blur-3xl opacity-60 dark:opacity-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#edf7ef] dark:bg-[#059669] rounded-full blur-3xl opacity-70 dark:opacity-10" />

      <div className="relative z-10 flex justify-center px-4 sm:px-6">
        <motion.div
          style={{
            width: cardWidth,
            borderTopLeftRadius: topRadius,
            borderTopRightRadius: topRadius,
            borderBottomLeftRadius: topRadius,
            borderBottomRightRadius: topRadius,
          }}
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => setCursor((prev) => ({ ...prev, active: true }))}
          onMouseLeave={() => setCursor((prev) => ({ ...prev, active: false }))}
          className="relative min-h-[90vh] sm:min-h-[98vh] lg:min-h-[108vh] overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl dark:shadow-[#10b981]/10 cursor-none"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={therapyVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
          <motion.div
            animate={{
              x: cursor.x - 24,
              y: cursor.y - 24,
              opacity: cursor.active ? 1 : 0,
              scale: cursor.active ? 1 : 0.8,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.45 }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden h-12 w-12 rounded-full border border-white/70 bg-white/20 backdrop-blur-sm md:block"
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-h-[90vh] sm:min-h-[98vh] lg:min-h-[108vh] flex-col justify-between p-6 sm:p-10 lg:p-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.35 }}
              className="max-w-3xl"
            >
              <span className="text-[#d8efda] uppercase tracking-wider text-xs sm:text-sm font-medium">Professional Therapy</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Connect with{' '}
                <span className="bg-gradient-to-r from-[#c8e6c9] to-white bg-clip-text text-transparent">
                  Expert Therapists
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#d8efda] max-w-2xl">
                Licensed professionals specialized in adolescent mental health, ready to guide you with care and confidentiality.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#10b981] px-6 py-3 font-medium text-[#0d5d3a] dark:text-[#050505] transition hover:bg-[#e8f5e9] dark:hover:bg-[#34d399]"
              >
                Book a Session
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="bg-white/14 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/25"
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#d8efda] mb-3" />
                    <h4 className="text-sm sm:text-base mb-1.5" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      {benefit.title}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
