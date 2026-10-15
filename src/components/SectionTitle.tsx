import React from 'react';

interface SectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  theme?: 'light' | 'dark';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  subtitle,
  title,
  description,
  align = 'left',
  className = '',
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const isCenter = align === 'center';

  return (
    <div className={`mb-10 sm:mb-12 ${isCenter ? 'text-center' : 'text-left'} ${className}`}>
      {subtitle && (
        <span className="inline-block text-[#E6B325] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
          {subtitle}
        </span>
      )}
      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1B2A5E]'}`}>
        {title}
      </h2>
      <div className={`w-16 h-1 bg-[#E6B325] mt-3 mb-4 ${isCenter ? 'mx-auto' : ''}`} />
      {description && (
        <p className={`text-base sm:text-lg max-w-3xl leading-relaxed ${isCenter ? 'mx-auto' : ''} ${isDark ? 'text-gray-300' : 'text-[#4A4A4A]'}`}>
          {description}
        </p>
      )}
    </div>
  );
};
