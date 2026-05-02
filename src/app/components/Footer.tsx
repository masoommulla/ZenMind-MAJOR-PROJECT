import { motion } from 'motion/react';
import { Heart, Instagram, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import logo from '../../../asset/logo.png';

const footerLinks = {
  Product: ['Features', 'AI Chatbot', 'Therapy', 'Pricing', 'FAQ'],
  Company: ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
  Resources: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Crisis Support', 'Community'],
  Support: ['Contact Us', 'Documentation', 'Safety Guidelines', 'Report Issue', 'Feedback'],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer id="about" className="bg-gradient-to-br from-[#071d13] via-[#0a2617] to-[#0d5d3a] text-white relative overflow-hidden">
      <div className="absolute -top-10 right-4 w-40 h-40 bg-[#27a86a]/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-8 left-4 w-40 h-40 bg-[#c8e6c9]/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mb-8 sm:mb-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ZenMind Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/35 shadow-lg shadow-black/20" />
              <span className="text-2xl sm:text-3xl" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                ZenMind
              </span>
            </div>
            <p className="text-white/75 mb-5 max-w-sm text-sm sm:text-base">
              Empowering adolescents to navigate their mental health journey with compassionate AI support and professional guidance.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 sm:gap-y-6">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold mb-2.5 text-sm sm:text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {category}
                </h4>
                <ul className="space-y-1.5 sm:space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 4 }}
                        className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm block"
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white/8 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/15 mb-6">
          <p className="text-xs sm:text-sm text-white/85 text-center leading-relaxed">
            <strong className="text-white">India Crisis Support:</strong> Emergency <strong>112</strong> • Tele-MANAS <strong>14416</strong> or <strong>1-800-891-4416</strong> • AASRA <strong>+91 22 2754 6669</strong>
          </p>
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/60 text-xs sm:text-sm">
              © 2026 ZenMind. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
              Made with <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 fill-red-400" /> for adolescent mental wellness
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
