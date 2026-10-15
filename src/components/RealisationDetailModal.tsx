import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Realisation } from '../types';
import { StatusBadge } from './StatusBadge.tsx';
import { Gallery } from './Gallery.tsx';

interface RealisationDetailModalProps {
  realisation: Realisation | null;
  onClose: () => void;
}

export const RealisationDetailModal: React.FC<RealisationDetailModalProps> = ({ realisation, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (realisation) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [realisation, onClose]);

  if (!realisation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Bouton de fermeture */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E6B325]"
          aria-label="Fermer la réalisation"
        >
          <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Couverture */}
        <div className="relative aspect-[21/9] sm:aspect-[2/1] w-full bg-gray-100">
          <img
            src={realisation.cover_image}
            alt={realisation.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="bg-[#E6B325] text-[#1B2A5E] text-xs font-bold px-3 py-1 rounded-[4px] uppercase tracking-wider">
              {realisation.edition}
            </span>
            <StatusBadge status={realisation.status} />
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs text-gray-500 font-medium block mb-1">
              Date de fin de session : {realisation.date}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A5E]">
              {realisation.title}
            </h2>
          </div>

          {/* Bloc « En bref » (encadré crème) */}
          <div className="bg-[#FDF6E3] border border-[#F2E3C6] rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A5E] mb-3">
              En bref
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block">Édition</span>
                <strong className="text-[#1B2A5E]">{realisation.edition}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Participants</span>
                <strong className="text-[#1B2A5E]">{realisation.participants_count} volontaire</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Durée</span>
                <strong className="text-[#1B2A5E]">1 mois (4 sem.)</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Zones visitées</span>
                <strong className="text-[#1B2A5E]">{realisation.zones?.join(', ') || 'Sud & Centre'}</strong>
              </div>
            </div>
          </div>

          {/* Description longue */}
          <div className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed space-y-4 whitespace-pre-line">
            <p className="font-medium text-[#1A1A1A]">
              {realisation.description}
            </p>
            {realisation.full_description && (
              <p>
                {realisation.full_description}
              </p>
            )}
          </div>

          {/* Section Points forts */}
          {realisation.highlights && realisation.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-[#1B2A5E] uppercase tracking-wider mb-3">
                Points forts de cette édition :
              </h4>
              <ul className="space-y-2">
                {realisation.highlights.map((h, i) => (
                  <li key={i} className="flex items-start text-sm text-[#4A4A4A]">
                    <span className="w-2 h-2 rounded-full bg-[#E6B325] mt-2 mr-3 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Galerie d'images */}
          {realisation.gallery && realisation.gallery.length > 0 && (
            <div className="pt-4 border-t border-[#E5E7EB]">
              <h4 className="text-sm font-bold text-[#1B2A5E] uppercase tracking-wider mb-4">
                Galerie de l'édition ({realisation.gallery.length} photos)
              </h4>
              <Gallery images={realisation.gallery} columns={3} />
            </div>
          )}

          {/* Actions & footer modal */}
          <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded text-sm font-medium text-[#4A4A4A] hover:bg-gray-100"
            >
              Fermer la vue
            </button>
            <Link
              to="/contact#inscription"
              onClick={onClose}
              className="px-6 py-2.5 rounded font-bold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] text-center"
            >
              Participer à la prochaine édition
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
