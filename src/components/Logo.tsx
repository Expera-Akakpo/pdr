import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', className = '', showSubtitle = true }) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#1B2A5E]';
  const subColor = isLight ? 'text-[#E6B325]' : 'text-[#4A4A4A]';
  const iconColor = isLight ? '#E6B325' : '#1B2A5E';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblème ProGen Bénin (Mains & Globe stylisés) */}
      <div className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 border-[#E6B325]/40 bg-white shadow-sm overflow-hidden p-1">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" stroke={iconColor} strokeWidth="3" fill="#FDF6E3" />
          {/* Lignes méridiens du globe */}
          <ellipse cx="50" cy="50" rx="42" ry="24" stroke={iconColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="50" y1="4" x2="50" y2="96" stroke={iconColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="4" y1="50" x2="96" y2="50" stroke={iconColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          {/* Deux mains protectrices et fraternelles tendues vers l'avenir */}
          <path
            d="M26 68 C24 58, 28 44, 34 38 C36 36, 38 38, 38 42 C38 48, 36 54, 38 60 C40 50, 44 38, 48 34 C50 32, 53 34, 52 40 C51 46, 48 54, 50 62 C52 52, 57 42, 62 38 C64 36, 67 38, 65 44 C63 50, 58 60, 60 68 C62 76, 52 82, 40 82 C30 82, 26 76, 26 68 Z"
            fill={iconColor}
          />
          <path
            d="M48 76 C52 70, 60 62, 68 58 C70 56, 73 58, 72 62 C70 68, 66 74, 62 80 C58 84, 52 82, 48 76 Z"
            fill="#E6B325"
          />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span className={`font-bold tracking-tight text-base sm:text-lg leading-tight ${textColor}`}>
          ProGen Bénin
        </span>
        {showSubtitle && (
          <span className={`text-[11px] font-semibold tracking-wider uppercase ${subColor}`}>
            Pont des Deux Rives
          </span>
        )}
      </div>
    </div>
  );
};
