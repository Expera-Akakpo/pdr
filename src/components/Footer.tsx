import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo.tsx';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1B2A5E] text-white border-t-4 border-[#E6B325]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Colonne 1 : Logo & Baseline */}
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="text-[#E6B325] text-xs font-semibold uppercase tracking-wider">
              Un voyage d'apprentissage et de citoyenneté interculturelle
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Une initiative de l'ONG Prochaine Génération Bénin (ProGen Bénin). Promouvoir le droit à une éducation de qualité pour tous les enfants et l'autonomisation durable des communautés.
            </p>
            <div className="pt-2 text-xs text-gray-300">
              <span className="font-semibold text-white">N° de reconnaissance :</span><br />
              n°2022/3357/DEP-LIT/SG/SAG-Assoc
            </div>
          </div>

          {/* Colonne 2 : Plan du site */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold border-b border-[#E6B325]/40 pb-2">
              Plan du site
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-[#E6B325] transition-colors duration-150">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/programmes" className="hover:text-[#E6B325] transition-colors duration-150">
                  Nos programmes
                </Link>
              </li>
              <li>
                <Link to="/circuits" className="hover:text-[#E6B325] transition-colors duration-150">
                  Circuits touristiques
                </Link>
              </li>
              <li>
                <Link to="/realisations" className="hover:text-[#E6B325] transition-colors duration-150">
                  Nos réalisations
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#E6B325] transition-colors duration-150">
                  Contactez-nous & Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Coordonnées ProGen Bénin */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold border-b border-[#E6B325]/40 pb-2">
              Coordonnées officielles
            </h4>
            <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
              <p>
                <strong className="text-white">Siège :</strong><br />
                Cité Arconville, Lot 643, Parcelle K-A2, Abomey-Calavi, République du Bénin
              </p>
              <p>
                <strong className="text-white">Boîte Postale :</strong> BP 1272 Abomey-Calavi
              </p>
              <p>
                <strong className="text-white">Téléphones :</strong><br />
                <a href="tel:+2290169740000" className="hover:text-[#E6B325] block">
                  +229 01 69 74 00 00
                </a>
                <a href="tel:+22997525168" className="hover:text-[#E6B325] block text-xs text-gray-400">
                  +229 97 52 51 68
                </a>
              </p>
              <p>
                <strong className="text-white">Courriel :</strong><br />
                <a href="mailto:progenbenin@gmail.com" className="text-[#E6B325] hover:underline">
                  progenbenin@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Colonne 4 : Mentions légales & Lien retour */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold border-b border-[#E6B325]/40 pb-2">
              Cadre & Partenariats
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Programme de volontourisme éthique, solidaire et supervisé. Ouvert aux volontaires internationaux et à la diaspora désireuse d'agir utilement.
            </p>
            <div className="pt-2">
              <a
                href="https://progenbenin.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-medium text-[#E6B325] hover:underline"
              >
                <span>Retour au site principal de ProGen Bénin</span>
                <svg className="w-3.5 h-3.5 ml-1 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            <div className="pt-2 text-xs text-gray-400">
              Horaires d'accueil : Lun - Ven (08h00 - 17h00 GMT+1)
            </div>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-300 gap-4">
          <p>
            © 2026 ProGen Bénin — Pont des Deux Rives. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/contact" className="hover:text-white">Mentions légales</Link>
            <Link to="/contact" className="hover:text-white">Confidentialité</Link>
            <Link to="/contact#inscription" className="text-[#E6B325] font-semibold hover:underline">Candidatures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
