import React from 'react';
import { Realisation } from '../types';
import { StatusBadge } from './StatusBadge.tsx';

interface RealisationCardProps {
  realisation: Realisation;
  onSelect: (realisation: Realisation) => void;
}

export const RealisationCard: React.FC<RealisationCardProps> = ({ realisation, onSelect }) => {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col h-full">
      {/* Couverture 16/9 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={realisation.cover_image}
          alt={realisation.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-[#E6B325] text-[#1B2A5E] text-[11px] font-bold px-2.5 py-1 rounded-[4px] uppercase tracking-wider shadow-xs">
          {realisation.edition}
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={realisation.status} />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{realisation.date}</span>
            {realisation.participants_count > 0 && (
              <span className="font-medium text-[#1B2A5E]">
                {realisation.participants_count} {realisation.participants_count > 1 ? 'participants' : 'volontaire internationale'}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-[#1B2A5E] mb-2 leading-snug">
            {realisation.title}
          </h3>

          <p className="text-sm text-[#4A4A4A] line-clamp-3 leading-relaxed mb-4">
            {realisation.description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {realisation.zones?.join(', ')}
          </span>
          <button
            type="button"
            onClick={() => onSelect(realisation)}
            className="inline-flex items-center text-xs font-bold text-[#1B2A5E] hover:text-[#E6B325] transition-colors py-1.5 px-3 rounded bg-[#F7F7F5] hover:bg-[#FDF6E3]"
          >
            <span>Voir la galerie & fiche</span>
            <svg className="w-3.5 h-3.5 ml-1 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
