import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';

const stats = [
  { value: 50000, suffix: '+', label: 'Active Users', duration: 2 },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', duration: 2 },
  { value: 1000, suffix: '+', label: 'Therapists', duration: 2 },
  { value: 24, suffix: '/7', label: 'Support Available', duration: 1.5 },
];

export default function Statistics() {
  const [counters, setCounters] = useState(stats.map(() => 0));
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            stats.forEach((stat, index) => {
              gsap.to(
                {},
                {
                  duration: stat.duration,
                  onUpdate: function () {
                    const progress = this.progress();
                    const currentValue = Math.floor(progress * stat.value);
                    setCounters((prev) => {
                      const newCounters = [...prev];
                      newCounters[index] = currentValue;
                      return newCounters;
                    });
                  },
                }
              );
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#e8f5e9] to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZDVkM2EiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0yNCAwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Trusted by{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] max-w-2xl mx-auto px-4">
            Join a growing community committed to mental wellness and personal growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl px-3 sm:px-5 lg:px-6 py-5 sm:py-7 shadow-lg border border-[#0d5d3a]/10 h-full min-h-[132px] sm:min-h-[154px] flex flex-col items-center justify-center overflow-hidden">
                <div className="mb-2 sm:mb-3 leading-none w-full text-center" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                  <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] bg-clip-text text-transparent inline-block whitespace-nowrap tracking-tight text-[clamp(1.5rem,3.8vw,2.5rem)] sm:text-[clamp(1.8rem,3.5vw,2.7rem)]">
                    {counters[index].toLocaleString()}
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-[#4a7c5d] text-xs sm:text-sm lg:text-base font-medium text-center">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
