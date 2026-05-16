import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Linkedin, Twitter, ExternalLink, Heart, Zap, Users, Globe } from 'lucide-react';
import { apiFetch } from '../api/client';

const VALUES = [
  { icon: Heart,  title: 'Empathy First',    desc: 'Every decision we make starts with understanding the real pain points of adolescents navigating mental health.' },
  { icon: Zap,    title: 'Accessible Care',  desc: 'Quality mental health support should never be gated by cost, location, or stigma. We build for everyone.' },
  { icon: Users,  title: 'Community Driven', desc: 'Healing happens together. We foster peer circles, shared stories, and human connection alongside AI.' },
  { icon: Globe,  title: 'Privacy Sacred',   desc: 'Your thoughts are yours. We use end-to-end encryption and never sell personal data — ever.' },
];

export default function AboutPage({ onClose }: { onClose: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>('/team')
      .then(res => setMembers(res.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white dark:bg-[#050505] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-[#0d5d3a]/10 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 py-4">
        <span className="font-black text-[#0d5d3a] dark:text-[#10b981] text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
          ZenMind · About Us
        </span>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition">
          <X size={20} />
        </button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f8fdf9] via-[#e8f5e9] to-[#c8e6c9] dark:from-[#050505] dark:via-[#071d13] dark:to-[#0a2617] py-20 sm:py-28">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-[#0d5d3a]"
              style={{ width: `${Math.random() * 8 + 4}px`, height: `${Math.random() * 8 + 4}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 + 0.1 }} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0d5d3a]/10 dark:bg-[#10b981]/10 text-[#0d5d3a] dark:text-[#10b981] text-xs font-black uppercase tracking-widest mb-6">
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0a2617] dark:text-white mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Built by students,{' '}
              <span className="bg-gradient-to-r from-[#0d5d3a] to-[#10b981] bg-clip-text text-transparent">
                for every student
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              ZenMind was born from a simple frustration — quality mental health care was inaccessible, expensive, and stigmatised. 
              Two college friends decided to change that with technology, empathy, and relentless execution.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs font-black mb-4 block">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0a2617] dark:text-white mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Make mental wellness accessible to every adolescent in India
              </h2>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-4">
                India has over 50 million adolescents who need mental health support — yet fewer than 1 in 10 ever receive it. 
                ZenMind bridges that gap with AI-powered compassion, curated therapeutic content, and real human therapists.
              </p>
              <p className="text-[#4a7c5d] dark:text-gray-400 text-base leading-relaxed">
                We believe that no young person should face anxiety, depression, or loneliness without support — and we've built a platform that's always there.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="grid grid-cols-2 gap-4">
              {[
                { num: '50K+', label: 'Students supported' },
                { num: '98%',  label: 'Report feeling heard' },
                { num: '1K+',  label: 'Licensed therapists' },
                { num: '24/7', label: 'Always available' },
              ].map(s => (
                <div key={s.label} className="bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] dark:from-[#111111] dark:to-[#1a1a1a] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10">
                  <div className="text-3xl sm:text-4xl font-black text-[#0d5d3a] dark:text-[#10b981] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{s.num}</div>
                  <div className="text-xs sm:text-sm text-[#4a7c5d] dark:text-gray-400 font-semibold">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team / Founders */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] dark:from-[#071d13] dark:to-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs font-black mb-4 block">The Founders</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              The people behind ZenMind
            </h2>
          </motion.div>

          {loading ? (
            <div className="text-center py-12 text-[#4a7c5d] dark:text-gray-400 font-semibold">Loading team...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-[#4a7c5d] dark:text-gray-400">Team info coming soon.</div>
          ) : (
            <div className={`grid gap-8 ${members.length === 1 ? 'max-w-sm mx-auto' : members.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {members.map((m: any, i: number) => (
                <TeamCard key={m._id} member={m} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs font-black mb-4 block">What We Believe</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Our core values</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] dark:from-[#111111] dark:to-[#1a1a1a] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10">
                  <div className="w-11 h-11 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] flex items-center justify-center mb-4">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-black text-[#0a2617] dark:text-white mb-2 text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{v.title}</h3>
                  <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer gap */}
      <div className="h-16 bg-white dark:bg-[#050505]" />
    </motion.div>
  );
}

function TeamCard({ member, index }: { member: any; index: number }) {
  const imageUrl = member.imageBase64
    ? (member.imageBase64.startsWith('data:') ? member.imageBase64 : `data:image/jpeg;base64,${member.imageBase64}`)
    : member.imageUrl || null;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(13,93,58,0.15)' }}
      className="bg-white dark:bg-[#111111] rounded-3xl overflow-hidden border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm transition-all group"
    >
      {/* Photo */}
      <div className="relative h-64 sm:h-72 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] dark:from-[#1a2a1f] dark:to-[#0d1a10] overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={member.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#0d5d3a] flex items-center justify-center text-white text-4xl font-black">
              {member.name.charAt(0)}
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Social links on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {member.linkedinUrl && (
            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#0d5d3a] hover:bg-white transition">
              <Linkedin size={16} />
            </a>
          )}
          {member.twitterUrl && (
            <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#0d5d3a] hover:bg-white transition">
              <Twitter size={16} />
            </a>
          )}
          {member.profileLink && (
            <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#0d5d3a] hover:bg-white transition">
              <ExternalLink size={16} />
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-black text-[#0a2617] dark:text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{member.name}</h3>
            <p className="text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm">{member.role}</p>
          </div>
          {member.profileLink && (
            <span className="shrink-0 w-8 h-8 rounded-full border border-[#0d5d3a]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] opacity-50 group-hover:opacity-100 transition">
              <ExternalLink size={13} />
            </span>
          )}
        </div>
        {member.bio && <p className="text-[#4a7c5d] dark:text-gray-400 text-sm leading-relaxed mt-3 line-clamp-3">{member.bio}</p>}
      </div>
    </motion.div>
  );

  if (member.profileLink) {
    return (
      <a href={member.profileLink} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }
  return cardContent;
}
