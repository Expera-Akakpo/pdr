import React from 'react';
import defaultHeroWebp from '../assets/images/pont_deux_rives_hero_1792059615449.webp';
import defaultHeroJpg from '../assets/images/pont_deux_rives_hero_1792059615449.jpg';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  description,
  backgroundImage,
}) => {
  const resolvedImage = backgroundImage || defaultHeroWebp;

  return (
    <div className="relative text-white py-14 sm:py-20 overflow-hidden border-b-4 border-[#E6B325]">
      {/* Image photographique d'arrière-plan */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none">
        {!backgroundImage && <source type="image/webp" srcSet={defaultHeroWebp} />}
        <img
          src={resolvedImage}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = defaultHeroJpg;
          }}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* Filtre dégradé subtil laissant transparaître la photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A5E]/85 via-[#1B2A5E]/70 to-[#131F45]/80" />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Contenu textuel */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {badge && (
          <span className="text-[#E6B325] text-xs sm:text-sm font-bold uppercase tracking-wider block mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]">
          {title}
        </h1>
        {description && (
          <p className="mt-3.5 text-base sm:text-lg text-white/95 max-w-3xl leading-relaxed font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
