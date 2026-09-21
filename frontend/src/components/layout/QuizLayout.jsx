import React from 'react';
import { Outlet } from 'react-router';

export const QuizLayout = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 flex flex-col">
      {/* Minimal clean header */}
      <header className="h-14 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="The Girls Kingdom School and College Mardan Logo"
            className="h-7 w-7 object-contain rounded-full"
          />
          <span className="text-sm font-semibold text-surface-900 dark:text-white">
            The Girls Kingdom School and College Mardan — Online Quiz System
          </span>
        </div>
        <div className="text-xs text-surface-400">
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
