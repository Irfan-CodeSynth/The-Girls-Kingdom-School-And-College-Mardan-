import React from 'react';
import { Card } from '../components/ui';
import { Construction } from 'lucide-react';

export const PlaceholderPage = ({ title = 'Module Coming Soon', stage = 2 }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold tracking-tight text-[#111827]">
          {title}
        </h1>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#EFE5E0] shadow-xs rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#5A0D1A] flex items-center justify-center mb-4 border border-rose-100">
          <Construction className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-lg font-serif font-bold text-[#111827]">
          Stage {stage} Module
        </h3>
        <p className="mt-2 text-sm text-[#6B7280] max-w-md">
          This portal module is being developed sequentially as part of The Girls Kingdom School and College Mardan LMS roadmap.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
