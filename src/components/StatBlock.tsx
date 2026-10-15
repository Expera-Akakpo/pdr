import React from 'react';
import { Stat } from '../types';

interface StatBlockProps {
  stat: Stat;
}

export const StatBlock: React.FC<StatBlockProps> = ({ stat }) => {
  return (
    <div className="bg-[#131F45]/80 border border-white/10 rounded-lg p-5 sm:p-6 text-center">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E6B325] tracking-tight">
        {stat.value}
        {stat.suffix && <span className="text-sm sm:text-lg font-medium text-[#F2E3C6] ml-1">{stat.suffix}</span>}
      </div>
      <div className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300">
        {stat.label}
      </div>
    </div>
  );
};
