import React from 'react';
import { Outlet } from 'react-router';

export const QuizLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111827] flex flex-col">
      {/* Minimal clean header */}
      <header className="h-14 border-b border-[#EFE5E0] bg-white px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="The Girls Kingdom School and College Mardan Logo"
            className="h-8 w-8 object-contain rounded-full shadow-xs"
          />
          <span className="text-sm font-serif font-bold text-[#111827]">
            The Girls Kingdom School and College Mardan — Online Quiz Portal
          </span>
        </div>
        <div className="text-xs text-[#5A0D1A] font-bold tracking-wider uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
          Distraction-Free Mode
        </div>
      </header>

      {/* Main quiz taking content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default QuizLayout;
