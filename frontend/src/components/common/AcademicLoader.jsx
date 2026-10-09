import React from 'react';
import { motion } from 'motion/react';

export const AcademicLoader = ({
  title = 'The Girls Kingdom',
  subtitle = 'School & College Mardan',
  message = 'Verifying Academic Credentials...',
  caption = 'Securing Institutional Session',
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F7F2EC] p-6 select-none font-sans relative overflow-hidden">
      {/* Subtle warm ambient glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#5A0D1A]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Animated Crest Container */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5A0D1A]/20 via-[#D4AF37]/25 to-transparent blur-md"
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Elegant spinning orbital ring */}
          <svg
            className="absolute inset-0 w-24 h-24 -rotate-90 animate-spin"
            style={{ animationDuration: '2.8s' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#EFE5E0"
              strokeWidth="3.5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#loaderMaroonGoldGradient)"
              strokeWidth="3.5"
              strokeDasharray="276"
              strokeDashoffset="170"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loaderMaroonGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5A0D1A" />
                <stop offset="50%" stopColor="#8B1A2E" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Crest with gentle breath animation */}
          <motion.div
            className="relative w-18 h-18 rounded-full bg-white shadow-md border-2 border-[#EFE5E0] p-1.5 flex items-center justify-center ring-2 ring-[#D4AF37]/30 ring-offset-2 ring-offset-[#FAF8F5]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src="/logo.png"
              alt="The Girls Kingdom Crest"
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>
        </div>

        {/* Institution Title */}
        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#111827]">
          {title}
        </h2>
        <p className="mt-1 text-[11px] font-bold text-[#8B6B38] uppercase tracking-[0.22em] font-sans">
          {subtitle}
        </p>

        {/* Sleek Progress Bar */}
        <div className="w-56 h-1.5 bg-[#EFE5E0] rounded-full overflow-hidden mt-6 mb-3 relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#5A0D1A] via-[#8B1A2E] to-[#D4AF37]"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: '55%' }}
          />
        </div>

        {/* Dynamic Status Message */}
        <p className="text-xs font-semibold text-[#4B5563] flex items-center justify-center gap-1.5">
          <span>{message}</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-[#5A0D1A] animate-ping" />
          </span>
        </p>

        {/* Institutional Motto / Caption */}
        <p className="mt-4 text-[10px] text-[#9CA3AF] tracking-wider uppercase font-medium">
          {caption}
        </p>
      </div>
    </div>
  );
};

export default AcademicLoader;
