import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import LogoLoop from './LogoLoop';

const stories = [
  {
    story: "I felt lost and alone until I found ZenMind. The chatbot helped me understand that my feelings were valid, and the stories inspired me to keep going.",
    author: "Sarah, 16",
    rating: 5,
  },
  {
    story: "The therapy sessions changed my life. Having someone who truly understands what I'm going through made all the difference.",
    author: "Michael, 17",
    rating: 5,
  },
  {
    story: "I love how the platform shares stories when I need them most. It's like having a friend who always knows what to say.",
    author: "Emma, 15",
    rating: 5,
  },
  {
    story: "I started journaling after each chat and now I can actually notice my progress week by week. It feels empowering.",
    author: "Aarav, 16",
    rating: 5,
  },
  {
    story: "The stories made me feel less alone. I realized so many teens are dealing with the same thoughts and emotions.",
    author: "Noah, 15",
    rating: 5,
  },
  {
    story: "Whenever I feel overwhelmed, ZenMind gives me practical coping steps immediately. It helps me calm down fast.",
    author: "Mia, 17",
    rating: 5,
  },
];

export default function StorySection() {
  const renderStoryCard = (item: (typeof stories)[number]) => (
    <article className="w-[280px] sm:w-[320px] h-[220px] sm:h-[230px] bg-gradient-to-br from-white to-[#f8fdf9] rounded-2xl p-5 sm:p-6 shadow-md border border-[#0d5d3a]/15 ring-1 ring-inset ring-[#0d5d3a]/10 flex flex-col">
      <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-[#0d5d3a] opacity-20 mb-3 sm:mb-4 flex-shrink-0" />
      <p
        className="text-[#0a2617] text-sm sm:text-[15px] leading-relaxed mb-3 sm:mb-4 flex-1 overflow-hidden"
        style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
      >
        "{item.story}"
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-[#0d5d3a]/10 mt-auto">
        <span className="text-[#4a7c5d] font-medium text-xs sm:text-sm">{item.author}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < (item.rating ?? 5) ? 'fill-[#0d5d3a] text-[#0d5d3a]' : 'fill-transparent text-[#0d5d3a]/30'}`}
            />
          ))}
        </div>
      </div>
    </article>
  );

  const topRow = stories.slice(0, 3).map((item, index) => ({
    node: renderStoryCard(item),
    title: `story-top-${index}`,
  }));

  const bottomRow = stories.slice(3).map((item, index) => ({
    node: renderStoryCard(item),
    title: `story-bottom-${index}`,
  }));

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-full blur-3xl opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#0d5d3a] uppercase tracking-wider text-xs sm:text-sm font-medium">Real Stories</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Stories of{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] bg-clip-text text-transparent">
              Hope & Healing
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] max-w-2xl mx-auto px-4">
            Hear from adolescents who found their path to wellness through ZenMind.
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-5">
          <div className="relative overflow-hidden">
            <LogoLoop
              logos={topRow}
              speed={70}
              direction="left"
              gap={18}
              pauseOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Stories row one"
            />
          </div>
          <div className="relative overflow-hidden">
            <LogoLoop
              logos={bottomRow}
              speed={70}
              direction="right"
              gap={18}
              pauseOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Stories row two"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
