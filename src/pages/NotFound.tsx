import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
          Erreur 404
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1B2A5E]">
          Page introuvable
        </h1>
        <p className="text-sm text-[#4A4A4A] leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée. Vous pouvez retourner à la page d'accueil ou consulter nos programmes de volontariat.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-md font-semibold text-sm bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/programmes"
            className="w-full sm:w-auto px-6 py-2.5 rounded-md font-semibold text-sm border border-[#1B2A5E] text-[#1B2A5E] hover:bg-[#FDF6E3] transition-colors"
          >
            Nos programmes
          </Link>
        </div>
      </div>
    </div>
  );
};
