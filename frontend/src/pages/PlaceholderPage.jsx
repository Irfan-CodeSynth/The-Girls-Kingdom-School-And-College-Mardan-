import React from 'react';
import { Card } from '../components/ui';
import { Construction } from 'lucide-react';

export const PlaceholderPage = ({ title = 'Module Coming Soon', stage = 2 }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          {title}
        </h1>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 border border-primary-100 dark:border-primary-900">
          <Construction className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          Stage {stage} Module
        </h3>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 max-w-md">
          This portal module is being developed sequentially as part of The Girls Kingdom School and College Mardan LMS roadmap.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
