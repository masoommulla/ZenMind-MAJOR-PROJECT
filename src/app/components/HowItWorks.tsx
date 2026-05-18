import { motion } from 'motion/react';
import { UserPlus, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';
import Stepper, { Step } from './Stepper';

const steps = [
  { number: '01', icon: UserPlus,      title: 'Create Your Account', description: 'Sign up in minutes with complete privacy and security. Your journey begins here.' },
  { number: '02', icon: MessageSquare, title: 'Start Chatting',       description: 'Share your thoughts with our AI companion. Feel heard, understood, and supported.' },
  { number: '03', icon: Lightbulb,     title: 'Get Inspired',         description: 'Receive personalized stories and insights tailored to your experiences.' },
  { number: '04', icon: TrendingUp,    title: 'Track Your Growth',    description: 'Connect with therapists, monitor progress, and celebrate your wellness journey.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] dark:from-[#050505] dark:to-[#111111] transition-colors duration-300 relative overflow-hidden">
      <style>{`
        /* ── Stepper card override — green neumorphic theme ── */
        .zen-stepper-wrap [class*="rounded"] {
          background: linear-gradient(135deg, #0d5d3a, #1a8a5a, #0a4a2e) !important;
          border: none !important;
          box-shadow: 8px 8px 18px rgba(7,29,19,0.55), -8px -8px 18px rgba(26,138,90,0.10), inset 2px 2px 5px rgba(52,211,153,0.30), inset -2px -2px 5px rgba(7,29,19,0.40) !important;
          background-image: radial-gradient(circle, rgba(52,211,153,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px) !important;
          background-size: 20px 20px !important;
          background-position: 0 0, 10px 10px !important;
        }
        /* Nav prev/next buttons */
        .zen-step-nav-btn {
          cursor: pointer; border-radius: 16px; border: none;
          padding: 2px;
          background: radial-gradient(circle 80px at 80% -10%, #34d399, #0a2617);
          position: relative; font-size: 14px; font-weight: 600;
          transition: transform 0.2s ease;
        }
        .zen-step-nav-btn::after {
          content: ""; position: absolute; width: 65%; height: 60%;
          border-radius: 120px; top: 0; right: 0;
          box-shadow: 0 0 20px rgba(52,211,153,0.25); z-index: -1;
        }
        .zen-step-nav-blob {
          position: absolute; width: 55px; height: 100%; border-radius: 16px;
          bottom: 0; left: 0;
          background: radial-gradient(circle 50px at 0% 100%, #10b981, #0d5d3a80, transparent);
          box-shadow: -8px 8px 24px rgba(16,185,129,0.25);
        }
        .zen-step-nav-inner {
          padding: 10px 22px; border-radius: 14px; color: #fff;
          z-index: 3; position: relative;
          background: radial-gradient(circle 80px at 80% -50%, #1a8a5a, #071e10);
          font-weight: 600;
        }
        .zen-step-nav-inner::before {
          content: ""; width: 100%; height: 100%; left: 0; top: 0;
          border-radius: 14px;
          background: radial-gradient(circle 60px at 0% 100%, rgba(16,185,129,0.12), rgba(13,93,58,0.08), transparent);
          position: absolute;
        }
        .zen-step-nav-btn:hover { transform: translateY(-2px); }
        .zen-step-nav-btn:active { transform: translateY(1px); }
        /* Step number & text colour inside the dark card */
        .zen-stepper-wrap .text-\\[\\#0a2617\\] { color: #a7f3d0 !important; }
        .zen-stepper-wrap .text-\\[\\#4a7c5d\\] { color: rgba(167,243,208,0.65) !important; }
        .zen-stepper-wrap .dark\\:text-white  { color: #a7f3d0 !important; }
        .zen-stepper-wrap .dark\\:text-gray-400 { color: rgba(167,243,208,0.65) !important; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-medium">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Your Path to{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">Wellness</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4">
            Four simple steps to start your transformative journey toward better mental health.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true, amount: 0.25 }}
          className="zen-stepper-wrap"
        >
          <Stepper
            initialStep={1}
            onStepChange={() => {}}
            onFinalStepCompleted={() => {}}
            backButtonText="← Previous"
            nextButtonText="Next →"
            backButtonStyle={{
              cursor: 'pointer', borderRadius: '16px', border: 'none', padding: '2px',
              background: 'radial-gradient(circle 80px at 80% -10%, #34d399, #0a2617)',
              position: 'relative', fontSize: '14px', fontWeight: 600,
            }}
            nextButtonStyle={{
              cursor: 'pointer', borderRadius: '16px', border: 'none', padding: '2px',
              background: 'radial-gradient(circle 80px at 80% -10%, #34d399, #0a2617)',
              position: 'relative', fontSize: '14px', fontWeight: 600,
            }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Step key={step.number}>
                  <div className="flex flex-col items-center justify-center py-6 text-center min-h-[220px] sm:min-h-[240px]">
                    <span
                      className="text-5xl sm:text-6xl opacity-20 mb-4"
                      style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                        background: 'linear-gradient(135deg,#34d399,#6ee7b7)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {step.number}
                    </span>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg,#10b981,#34d399)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                      boxShadow: '3px 3px 8px rgba(7,29,19,0.5),-3px -3px 8px rgba(52,211,153,0.2)',
                    }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl mb-3" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#a7f3d0' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(167,243,208,0.65)' }}>
                      {step.description}
                    </p>
                  </div>
                </Step>
              );
            })}
          </Stepper>
        </motion.div>
      </div>
    </section>
  );
}
