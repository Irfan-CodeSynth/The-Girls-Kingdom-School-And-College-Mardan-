import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck, BookOpen } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-900">
      {/* Top right theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-surface-600" />
        )}
      </button>

      {/* Left side decorative branding banner (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="The Girls Kingdom School and College Mardan Logo"
            className="h-12 w-12 object-contain rounded-full shadow-lg ring-2 ring-white/30 bg-white/10 p-0.5"
          />
          <div>
            <span className="text-xl font-bold tracking-tight block">
              The Girls Kingdom
            </span>
            <span className="text-xs text-primary-200 uppercase tracking-widest font-medium">
              School & College Mardan
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Empowering Excellence Through Modern Learning
          </h2>
          <p className="text-primary-100/90 text-sm leading-relaxed">
            Welcome to the unified digital campus — seamlessly connecting faculty,
            students, academic assessments, and smart evaluation.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <GraduationCap className="w-6 h-6 text-primary-200 mb-2" />
              <p className="text-sm font-semibold">Smart Assessments</p>
              <p className="text-xs text-primary-200/80">
                Interactive quizzes & auto-grading
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-6 h-6 text-primary-200 mb-2" />
              <p className="text-sm font-semibold">Secure Portal</p>
              <p className="text-xs text-primary-200/80">
                Strict role-based access control
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-primary-200/70">
          © {new Date().getFullYear()} The Girls Kingdom School and College Mardan. All rights reserved.
        </div>
      </div>

      {/* Right side form container */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img
              src="/logo.png"
              alt="The Girls Kingdom School and College Mardan Logo"
              className="h-11 w-11 object-contain rounded-full shadow-md"
            />
            <div className="text-left">
              <span className="text-lg font-bold text-surface-900 dark:text-white block leading-tight">
                The Girls Kingdom
              </span>
              <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                School & College Mardan
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-surface-900 p-8 rounded-2xl shadow-xl shadow-surface-200/50 dark:shadow-none border border-surface-200/80 dark:border-surface-800"
          >
            {(title || subtitle) && (
              <div className="mb-6 text-center">
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
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
