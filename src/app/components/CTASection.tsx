import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import okVideo from '../../../asset/ok/ok.mp4';

type CTASectionProps = {
  onGetStarted: () => void;
};

export default function CTASection({ onGetStarted }: CTASectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    circlesRef.current.forEach((circle, index) => {
      if (circle) {
        gsap.to(circle, {
          y: Math.random() * 40 - 20,
          x: Math.random() * 40 - 20,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    });
  }, []);

  return (
    <section id="cta" ref={containerRef} className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden border border-[#0d5d3a]/15 rounded-2xl sm:rounded-3xl lg:rounded-[2.4rem]"
        >
          <div
            ref={(el) => (circlesRef.current[0] = el)}
            className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <div
            ref={(el) => (circlesRef.current[1] = el)}
            className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          />
          <div
            ref={(el) => (circlesRef.current[2] = el)}
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#27a86a]/20 rounded-full blur-3xl"
          />

          <div className="relative z-10 grid lg:grid-cols-2 min-h-[28rem] lg:min-h-[34rem]">
            <div className="relative min-h-[16rem] lg:min-h-full">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={okVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0b2f1d]/35" />
            </div>

            <div className="flex flex-col justify-center items-center text-center p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs sm:text-sm text-white/90">Start Your Free Journey Today</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6 max-w-xl"
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
              >
                Ready to Transform Your Mental Health?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="text-base sm:text-lg text-white/90 mb-8 max-w-xl"
              >
                Join thousands of adolescents who have found support, healing, and growth through ZenMind. Your journey to wellness starts with a single step.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#0d5d3a] rounded-full font-medium flex items-center justify-center gap-2 shadow-lg text-base sm:text-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-transparent text-white rounded-full font-medium border-2 border-white text-base sm:text-lg"
                >
                  Schedule a Demo
                </motion.button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="text-white/70 text-xs sm:text-sm mt-6"
              >
                No credit card required • 100% confidential • Available 24/7
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
