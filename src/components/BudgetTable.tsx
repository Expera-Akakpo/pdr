import React from 'react';
import { Link } from 'react-router-dom';

export const BudgetTable: React.FC = () => {
  const budgetItems = [
    { label: 'Inscription', detail: 'Frais administratifs & dossier', cost: '50 $' },
    { label: 'Logement', detail: 'Hébergement en famille d\'accueil (30 jours × 40 $)', cost: '1 200 $' },
    { label: 'Transport', detail: 'Déplacements & véhicule dédié (30 jours × 34 $)', cost: '1 020 $' },
    { label: 'Restauration', detail: 'Pension complète / 2 repas par jour (30 jours × 30 $)', cost: '900 $' },
    { label: 'Frais de visites', detail: 'Forfait entrées sites touristiques & guides', cost: '200 $' },
    { label: 'Imprévus', detail: 'Marge de sécurité & rafraîchissements', cost: '169 $' },
  ];

  return (
    <div className="bg-[#1B2A5E] text-white rounded-xl p-6 sm:p-10 shadow-lg border border-[#E6B325]/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
            Transparence & Engagement
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Budget et frais de participation
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Séjour complet de 4 semaines (30 jours d'immersion humaine et touristique au Bénin)
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs uppercase text-gray-300 block">Total estimé</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-[#E6B325]">
            3 539 $
          </span>
          <span className="text-xs text-gray-300 block mt-0.5">
            (ou équivalent 1 436 400 FCFA selon barème indicatif)
          </span>
        </div>
      </div>

      {/* Tableau structuré */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/20 text-[#E6B325] text-xs uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 font-semibold">Libellé</th>
              <th scope="col" className="py-3 px-4 font-semibold">Détail des prestations</th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">Coût</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {budgetItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">
                  {item.label}
                </td>
                <td className="py-3.5 px-4 text-gray-300">
                  {item.detail}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-[#E6B325] text-base whitespace-nowrap">
                  {item.cost}
                </td>
              </tr>
            ))}
            <tr className="bg-white/10 font-bold">
              <td className="py-4 px-4 text-white text-base" colSpan={2}>
                Total général pour 1 mois
              </td>
              <td className="py-4 px-4 text-right text-xl text-[#E6B325]">
                3 539 $
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note et CTA */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-gray-300 italic max-w-xl">
          * Le coût total peut varier selon la durée effective du séjour, la provenance et les options choisies. Contactez ProGen Bénin pour obtenir un devis personnalisé adapté à votre profil.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center px-4 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors whitespace-nowrap"
        >
          Demander un devis personnalisé
        </Link>
      </div>
    </div>
  );
};
