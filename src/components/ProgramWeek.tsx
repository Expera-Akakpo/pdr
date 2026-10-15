import React, { useState } from 'react';
import { ProgramWeek as ProgramWeekType } from '../types';

interface ProgramWeekProps {
  weeks: ProgramWeekType[];
}

export const ProgramWeek: React.FC<ProgramWeekProps> = ({ weeks }) => {
  const [openWeek, setOpenWeek] = useState<number | null>(1); // Open week 1 by default

  const toggleWeek = (weekNumber: number) => {
    setOpenWeek(openWeek === weekNumber ? null : weekNumber);
  };

  return (
    <div className="space-y-4">
      {weeks.map((week) => {
        const isOpen = openWeek === week.week_number;
        return (
          <div
            key={week.id || week.week_number}
            className={`border rounded-lg transition-colors duration-150 overflow-hidden ${
              isOpen ? 'border-[#E6B325] bg-white shadow-sm' : 'border-[#E5E7EB] bg-[#F7F7F5]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleWeek(week.week_number)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center space-x-4">
                <span className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  isOpen ? 'bg-[#1B2A5E] text-[#E6B325]' : 'bg-[#E5E7EB] text-[#1B2A5E]'
                }`}>
                  S{week.week_number}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1B2A5E]">
                    {week.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] mt-0.5 line-clamp-1">
                    {week.description}
                  </p>
                </div>
              </div>

              {/* Functional chevron icon */}
              <div className="ml-4 flex-shrink-0 text-[#1B2A5E]">
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 stroke-current ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#F2E3C6]/60 bg-white">
                <p className="text-sm sm:text-base text-[#1A1A1A] font-medium mb-4">
                  {week.description}
                </p>
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#1B2A5E] uppercase tracking-wider">
                    Activités & Points clés de la semaine :
                  </h4>
                  <ul className="space-y-2">
                    {week.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[#4A4A4A] leading-relaxed">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#E6B325] mt-2 mr-3 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
