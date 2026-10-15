import React from 'react';
import { Circuit } from '../types';
import { RegionBadge } from './StatusBadge.tsx';

interface CircuitCardProps {
  circuit: Circuit;
  onSelect: (circuit: Circuit) => void;
}

export const CircuitCard: React.FC<CircuitCardProps> = ({ circuit, onSelect }) => {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col h-full">
      {/* Image de couverture 16/9 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={circuit.cover_image}
          alt={circuit.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <RegionBadge region={circuit.region} />
        </div>
        <div className="absolute bottom-3 right-3 bg-[#1B2A5E]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px] backdrop-blur-sm">
          {circuit.duration}
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-medium text-[#4A4A4A] mb-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#E6B325] stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{circuit.city}</span>
          </div>

          <h3 className="text-lg font-bold text-[#1B2A5E] mb-2 leading-snug">
            {circuit.title}
          </h3>

          <p className="text-sm text-[#4A4A4A] line-clamp-3 leading-relaxed mb-4">
            {circuit.description}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {circuit.highlights?.length ? `${circuit.highlights.length} points forts` : 'Inclus au programme'}
          </span>
          <button
            type="button"
            onClick={() => onSelect(circuit)}
            className="inline-flex items-center text-xs font-bold text-[#1B2A5E] hover:text-[#E6B325] transition-colors py-1 px-2.5 rounded bg-[#F7F7F5] hover:bg-[#FDF6E3]"
          >
            <span>Découvrir</span>
            <svg className="w-3.5 h-3.5 ml-1 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
