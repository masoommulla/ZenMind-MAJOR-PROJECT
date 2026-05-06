import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import { apiFetch } from '../api/client';
import heroVideo from '../../../asset/video.mp4';

type HeroProps = {
  onGetStarted: () => void;
};

export default function Hero({ onGetStarted }: HeroProps) {
  const floatingRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    apiFetch<any>('/public/settings').then(res => setStatsData(res)).catch(console.error);
  }, []);

  useEffect(() => {
    if (floatingRef.current) {
      gsap.to(floatingRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }

    circleRefs.current.forEach((circle, index) => {
      if (circle) {
        gsap.to(circle, {
          y: Math.random() * 30 - 15,
          x: Math.random() * 30 - 15,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: index * 0.2,
        });
      }
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] },
    },
  };

  return (
    <section className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#050505] pt-14 sm:pt-16 transition-colors duration-300">
      <div className="absolute inset-y-0 right-0 hidden lg:block w-1/2 z-0 overflow-hidden">
        <video
          className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] object-cover pointer-events-none opacity-100 dark:opacity-60"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
            filter: 'saturate(0.92) hue-rotate(8deg) brightness(1.04)',
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/20 to-transparent dark:from-[#050505] dark:via-[#050505]/20 dark:to-transparent"
          aria-hidden="true"
        />
      </div>
      <div
        ref={(el) => (circleRefs.current[0] = el)}
        className="absolute top-20 left-10 w-64 h-64 bg-[#0d5d3a]/5 dark:bg-[#10b981]/10 rounded-full blur-3xl z-[1] lg:hidden"
      />
      <div
        ref={(el) => (circleRefs.current[1] = el)}
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#1a8a5a]/5 dark:bg-[#10b981]/10 rounded-full blur-3xl z-[1] lg:hidden"
      />
      <div
        ref={(el) => (circleRefs.current[2] = el)}
        className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#c8e6c9]/10 dark:bg-[#0d5d3a]/20 rounded-full blur-3xl z-[1] lg:hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center"
        >
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-white/5 rounded-full shadow-sm border border-[#0d5d3a]/10 dark:border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
              <span className="text-sm text-[#4a7c5d] dark:text-gray-300">Your Mental Wellness Journey Starts Here</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#0a2617] dark:text-white leading-tight max-w-none lg:max-w-[22ch]"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
            >
              Empowering{' '}
              <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
                Adolescents
              </span>{' '}
              Through Mental Health
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 leading-relaxed max-w-xl"
            >
              A safe, supportive platform where young minds can share, heal, and grow. Connect with AI-powered support and professional therapists anytime, anywhere.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(13, 93, 58, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] text-white rounded-full flex items-center gap-2 shadow-lg"
              >
                <span className="font-medium">Start Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-transparent text-[#0d5d3a] dark:text-[#10b981] rounded-full border-2 border-[#0d5d3a] dark:border-[#10b981] font-medium"
              >
                Learn More
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4 min-h-[80px]">
              {(() => {
                const activeUsers = statsData?.activeUsers || '50K+';
                const satisfactionRate = statsData?.satisfactionRate || '98%';
                const supportAvailable = statsData?.supportAvailable || '24/7';
                return (
                  <>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {activeUsers}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Active Users</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {satisfactionRate}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Satisfaction Rate</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-3xl sm:text-4xl text-[#0d5d3a] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        {supportAvailable}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Support Available</div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>

          <motion.div
            ref={floatingRef}
            variants={itemVariants}
            className="relative"
          >
            <div className="hidden lg:block w-full h-full" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
