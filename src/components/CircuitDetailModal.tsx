import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Circuit } from '../types';
import { RegionBadge } from './StatusBadge.tsx';

interface CircuitDetailModalProps {
  circuit: Circuit | null;
  onClose: () => void;
}

export const CircuitDetailModal: React.FC<CircuitDetailModalProps> = ({ circuit, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (circuit) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [circuit, onClose]);

  if (!circuit) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Bouton de fermeture */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E6B325]"
          aria-label="Fermer la fiche détaillée"
        >
          <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Couverture */}
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          <img
            src={circuit.cover_image}
            alt={circuit.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <RegionBadge region={circuit.region} />
          </div>
          <div className="absolute bottom-4 left-4 bg-[#1B2A5E]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-[4px] backdrop-blur-sm">
            Ville / Territoire : {circuit.city} • Durée : {circuit.duration}
          </div>
        </div>

        {/* Corps */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
              Circuit touristique & patrimonial
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A5E] mt-1">
              {circuit.title}
            </h2>
          </div>

          <div className="prose prose-sm sm:prose text-[#4A4A4A] leading-relaxed">
            <p className="text-base font-medium text-[#1A1A1A]">
              {circuit.description}
            </p>
            {circuit.full_description && (
              <p className="mt-3">
                {circuit.full_description}
              </p>
            )}
          </div>

          {/* Points forts */}
          {circuit.highlights && circuit.highlights.length > 0 && (
            <div className="bg-[#FDF6E3] rounded-lg p-5 border border-[#F2E3C6]">
              <h4 className="text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-3">
                Points forts de la visite :
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#1A1A1A]">
                {circuit.highlights.map((h, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conditions & Inclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4A4A4A] bg-[#F7F7F5] p-4 rounded-lg">
            <div>
              <span className="font-bold text-[#1B2A5E] block mb-1">Inclus au programme :</span>
              Transport en véhicule sécurisé, accompagnement par un guide local, entrées des sites historiques.
            </div>
            <div>
              <span className="font-bold text-[#1B2A5E] block mb-1">Conseils pratiques :</span>
              Tenue respectueuse recommandée, chapeau/casquette, hydratation régulière, respect des consignes coutumières.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Circuit intégré dans les séjours de 1 à 4 semaines.
            </span>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-[#4A4A4A] hover:bg-gray-100"
              >
                Fermer
              </button>
              <Link
                to="/contact#inscription"
                onClick={onClose}
                className="px-5 py-2 rounded font-semibold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] text-center flex-1 sm:flex-none"
              >
                S'inscrire au programme
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
