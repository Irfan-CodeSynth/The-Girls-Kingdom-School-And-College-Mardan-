import React from 'react';
import { motion } from 'motion/react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex space-x-1 border-b border-[#EFE5E0] bg-white rounded-t-2xl px-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              relative px-4 py-3 text-sm font-bold transition-colors focus:outline-none flex items-center gap-2 cursor-pointer
              ${isActive ? 'text-[#5A0D1A]' : 'text-[#6B7280] hover:text-[#111827]'}
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  ml-1 px-2 py-0.5 text-xs rounded-full font-bold
                  ${isActive ? 'bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0]' : 'bg-gray-100 text-gray-600'}
                `}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A0D1A]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
