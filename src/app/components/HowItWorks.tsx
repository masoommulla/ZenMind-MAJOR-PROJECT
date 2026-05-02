import { motion } from 'motion/react';
import { UserPlus, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';
import Stepper, { Step } from './Stepper';
import DotField from './DotField';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in minutes with complete privacy and security. Your journey begins here.',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Start Chatting',
    description: 'Share your thoughts with our AI companion. Feel heard, understood, and supported.',
  },
  {
    number: '03',
    icon: Lightbulb,
    title: 'Get Inspired',
    description: 'Receive personalized stories and insights tailored to your experiences.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Track Your Growth',
    description: 'Connect with therapists, monitor progress, and celebrate your wellness journey.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <DotField
          dotRadius={3.4}
          dotSpacing={12}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={320}
          cursorForce={0.06}
          bulgeOnly={false}
          showGlow={false}
          gradientFrom="rgba(13, 93, 58, 0.28)"
          gradientTo="rgba(83, 155, 96, 0.22)"
          glowColor="#0b4229"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-[#0d5d3a] uppercase tracking-wider text-xs sm:text-sm font-medium">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Your Path to{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] bg-clip-text text-transparent">
              Wellness
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] max-w-2xl mx-auto px-4">
            Four simple steps to start your transformative journey toward better mental health.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <Stepper
            initialStep={1}
            onStepChange={() => {}}
            onFinalStepCompleted={() => {}}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Step key={step.number}>
                  <div className="flex flex-col items-center justify-center py-4 text-center min-h-[220px] sm:min-h-[240px]">
                    <span
                      className="text-5xl sm:text-6xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] bg-clip-text text-transparent opacity-20 mb-4"
                      style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}
                    >
                      {step.number}
                    </span>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center mb-4 sm:mb-5">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl text-[#0a2617] mb-3" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#4a7c5d] leading-relaxed max-w-2xl mx-auto">
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
