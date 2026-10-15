import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Qui peut participer au programme Pont des Deux Rives ?',
      answer: 'Le programme est ouvert en priorité aux jeunes de 16 à 30 ans, issus de la diaspora béninoise ou volontaires internationaux du monde entier désireux de vivre une immersion citoyenne, humaine et solidaire au Bénin.'
    },
    {
      question: 'Quelle est la durée du séjour ?',
      answer: 'Le séjour standard s\'étend sur 1 mois (4 semaines / 30 jours). Des formules adaptées peuvent être étudiées sur demande pour des groupes constitués ou des séjours universitaires de 2 à 3 semaines.'
    },
    {
      question: 'Le programme est-il ouvert aux mineurs ?',
      answer: 'Oui, les jeunes de 16 à 17 ans peuvent participer sous réserve d\'une autorisation parentale écrite, d\'un dossier complet et de l\'encadrement renforcé assuré par ProGen Bénin et la famille d\'accueil.'
    },
    {
      question: 'Quels sont les frais à prévoir ?',
      answer: 'Le budget indicatif tout compris (logement en famille, 2 repas/jour, transports terrestres, visites touristiques et frais de dossier) est estimé à environ 3 539 $ (soit 1 436 400 FCFA). Les billets d\'avion internationaux et l\'assurance rapatriement restent à la charge du participant.'
    },
    {
      question: 'Comment se déroule l\'hébergement en famille d\'accueil ?',
      answer: 'Vous êtes logé(e) au sein d\'une famille béninoise rigoureusement sélectionnée et conventionnée par ProGen Bénin à Abomey-Calavi ou environs. Vous disposez d\'un espace personnel privatif sécurisé et partagez les repas ainsi que la vie quotidienne de la maisonnée.'
    },
    {
      question: 'Quelle est la langue de communication ?',
      answer: 'Le français est la langue officielle de travail et d\'échange au quotidien. Dès la deuxième semaine, une initiation pratique aux salutations et formules courantes en langue nationale fon est assurée pour faciliter les liens avec la communauté.'
    },
    {
      question: 'Faut-il un visa pour le Bénin ?',
      answer: 'Pour la majorité des ressortissants étrangers, un e-Visa touristique officiel est facilement délivré en ligne en quelques jours sur le portail gouvernemental béninois (evisa.gouv.bj). Notre équipe vous assiste dans toutes les démarches administratives.'
    },
    {
      question: 'Le programme est-il accessible aux personnes en situation de handicap ?',
      answer: 'ProGen Bénin étudie chaque candidature avec attention afin d\'adapter au mieux l\'hébergement en famille et les circuits selon les contraintes de mobilité. Nous vous invitons à nous contacter directement pour préparer au mieux votre accueil.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {faqs.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border rounded-lg transition-colors overflow-hidden ${
              isOpen ? 'border-[#E6B325] bg-white shadow-xs' : 'border-[#E5E7EB] bg-[#F7F7F5]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-bold text-[#1B2A5E] pr-4">
                {item.question}
              </span>
              <span className="ml-2 flex-shrink-0 text-[#1B2A5E]">
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 stroke-current ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-[#4A4A4A] leading-relaxed border-t border-[#F2E3C6]/60 bg-white">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
