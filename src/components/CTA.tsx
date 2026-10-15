import React from 'react';
import { Link } from 'react-router-dom';

interface CTAProps {
  title?: string;
  subtitle?: string;
}

export const CTA: React.FC<CTAProps> = ({
  title = "Prêt(e) à vivre l'expérience Pont des Deux Rives ?",
  subtitle = "Les inscriptions pour la prochaine vague sont ouvertes. Rejoignez une communauté solidaire et engagée."
}) => {
  return (
    <section className="bg-[#E6B325] text-[#1B2A5E] py-14 sm:py-16 border-t-2 border-b-2 border-[#1B2A5E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#1B2A5E]/80">
          Rejoignez l'aventure
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B2A5E] max-w-2xl mx-auto tracking-tight">
          {title}
        </h2>
        <p className="text-base sm:text-lg font-medium text-[#131F45] max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/contact#inscription"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-md font-bold text-sm bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors shadow-sm"
          >
            S'inscrire maintenant
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-md font-bold text-sm border-2 border-[#1B2A5E] text-[#1B2A5E] hover:bg-[#1B2A5E] hover:text-white transition-colors"
          >
            Poser une question
          </Link>
        </div>
      </div>
    </section>
  );
};
