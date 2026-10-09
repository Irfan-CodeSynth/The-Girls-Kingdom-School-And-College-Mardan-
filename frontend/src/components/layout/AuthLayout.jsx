import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      {/* Left side decorative branding banner (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#420812] via-[#5A0D1A] to-[#701422] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Subtle royal glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="The Girls Kingdom School and College Mardan Logo"
            className="h-12 w-12 object-contain rounded-full shadow-lg ring-2 ring-white/30 bg-white/10 p-0.5"
          />
          <div>
            <span className="text-xl font-serif font-bold tracking-tight block">
              The Girls Kingdom
            </span>
            <span className="text-xs text-rose-200 uppercase tracking-widest font-sans font-semibold">
              School &amp; College Mardan
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-serif font-bold tracking-tight leading-tight">
            Empowering Excellence Through Modern Learning
          </h2>
          <p className="text-rose-100/90 text-sm leading-relaxed font-sans">
            Welcome to the unified digital campus — seamlessly connecting faculty,
            students, academic assessments, and smart evaluation.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <GraduationCap className="w-6 h-6 text-rose-200 mb-2" />
              <p className="text-sm font-serif font-bold">Smart Assessments</p>
              <p className="text-xs text-rose-200/80 font-sans mt-0.5">
                Interactive quizzes &amp; evaluation
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <ShieldCheck className="w-6 h-6 text-rose-200 mb-2" />
              <p className="text-sm font-serif font-bold">Secure Portal</p>
              <p className="text-xs text-rose-200/80 font-sans mt-0.5">
                Strict role-based access control
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-rose-200/70 font-sans">
          © {new Date().getFullYear()} The Girls Kingdom School and College Mardan. All rights reserved.
        </div>
      </div>

      {/* Right side form container */}
      <div className="flex-1 relative flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-hidden bg-[#FAF8F5]">
        {/* Subtle background overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{ backgroundImage: `url('/login-hero.webp')` }}
        />

        <div className="mx-auto w-full max-w-md relative z-10">
          {/* Mobile Header Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img
              src="/logo.png"
              alt="The Girls Kingdom School and College Mardan Logo"
              className="h-11 w-11 object-contain rounded-full shadow-md"
            />
            <div className="text-left">
              <span className="text-lg font-serif font-bold text-[#111827] block leading-tight">
                The Girls Kingdom
              </span>
              <span className="text-[11px] font-sans font-bold text-[#5A0D1A] uppercase tracking-wider">
                School &amp; College Mardan
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-[#EFE5E0]"
          >
            {(title || subtitle) && (
              <div className="mb-6 text-center">
                {title && (
                  <h1 className="text-2xl font-serif font-bold tracking-tight text-[#111827]">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-sm text-[#6B7280] font-sans">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
