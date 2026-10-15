import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { SectionTitle } from '../components/SectionTitle.tsx';
import { ProgramWeek } from '../components/ProgramWeek.tsx';
import { BudgetTable } from '../components/BudgetTable.tsx';
import { ProgramWeek as ProgramWeekType } from '../types';
import { INITIAL_WEEKS } from '../server/seedData.ts';

export const Programs: React.FC = () => {
  const [weeks, setWeeks] = useState<ProgramWeekType[]>(INITIAL_WEEKS);

  useEffect(() => {
    fetch('/api/programs')
      .then((res) => res.json())
      .then((data) => {
        if (data.weeks && data.weeks.length > 0) {
          setWeeks(data.weeks);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="bg-white">
      {/* Fil d'Ariane */}
      <Breadcrumb items={[{ label: 'Nos programmes' }]} />

      {/* En-tête de page avec fond photographique */}
      <PageHeader
        badge="Volontourisme & Citoyenneté Internationale"
        title="Le programme Pont des Deux Rives"
        description="Un mois complet d'immersion culturelle, d'hébergement en famille d'accueil et d'action civique bénévole au cœur du Bénin."
        backgroundImage="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1920&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* BLOC 1 — Présentation générale */}
        <section className="max-w-4xl">
          <SectionTitle
            subtitle="Vue d'ensemble"
            title="Une passerelle humaine et engagée entre les peuples"
          />
          <blockquote className="border-l-4 border-[#E6B325] pl-6 text-lg sm:text-xl italic text-[#1B2A5E] bg-[#FDF6E3] p-5 rounded-r-lg font-medium leading-relaxed">
            « Pont des Deux Rives est une initiative portée par ProGen Bénin qui vise à créer un lien fort entre les peuples à travers un parcours unique de volontourisme. Ce programme se veut une véritable immersion humaine, sociale et culturelle. »
          </blockquote>
          <p className="mt-6 text-[#4A4A4A] text-base leading-relaxed">
            Conçu dans l'esprit des Objectifs de Développement Durable (ODD) des Nations Unies, le projet réunit la découverte active du patrimoine matériel et immatériel béninois avec la contribution directe à des initiatives locales d'éducation, de santé et d'émancipation communautaire.
          </p>
        </section>

        {/* BLOC 2 — Objectifs (Fond Crème, Encadré) */}
        <section className="bg-[#FDF6E3] border border-[#F2E3C6] rounded-xl p-8 sm:p-10">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
              Cadre d'intervention
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A5E] mt-1">
              Objectifs généraux et spécifiques
            </h2>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] mb-8 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A5E] mb-2">
              Objectif général
            </h3>
            <p className="text-base sm:text-lg text-[#1A1A1A] font-medium leading-relaxed">
              Favoriser le rapprochement des cultures, la promotion du développement durable et l'éducation à la citoyenneté mondiale chez les jeunes.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B2A5E] mb-4">
              Objectifs spécifiques :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Offrir aux enfants et aux jeunes vivant hors du Bénin l'opportunité de découvrir la richesse culturelle du pays et de s'engager dans des initiatives locales concrètes.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Favoriser le dialogue interculturel et la création de liens durables entre les jeunes du Bénin et ceux d'autres pays.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Sensibiliser les participants aux enjeux de développement durable et les encourager à s'impliquer dans des actions concrètes.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Développer chez les participants un sentiment d'engagement citoyen et de responsabilité active vis-à-vis du monde.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BLOC 3 — Déroulement du programme (4 semaines) */}
        <section>
          <SectionTitle
            subtitle="Chronogramme pédagogique"
            title="Déroulement des 4 semaines d'activités"
            description="Chaque semaine combine harmonieusement découverte des patrimoines, vie communautaire, apprentissages pratiques et engagement bénévole."
          />
          <div className="mt-8">
            <ProgramWeek weeks={weeks} />
          </div>
        </section>

        {/* BLOC 4 — Résultats attendus */}
        <section className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-8 sm:p-10">
          <SectionTitle
            subtitle="Impacts mesurables"
            title="Résultats attendus à l'issue du séjour"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-5 rounded-lg border border-[#E5E7EB]">
              <span className="text-[#E6B325] text-xl font-bold block mb-2">01</span>
              <h4 className="text-sm font-bold text-[#1B2A5E] mb-1">Compréhension culturelle</h4>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                Une meilleure compréhension de la culture béninoise, des traditions ancestrales et de leurs valeurs d'hospitalité.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E5E7EB]">
              <span className="text-[#E6B325] text-xl font-bold block mb-2">02</span>
              <h4 className="text-sm font-bold text-[#1B2A5E] mb-1">Amitiés durables</h4>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                Des liens d'amitié profonds et pérennes tissés avec les familles d'accueil et les jeunes pairs béninois.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E5E7EB]">
              <span className="text-[#E6B325] text-xl font-bold block mb-2">03</span>
              <h4 className="text-sm font-bold text-[#1B2A5E] mb-1">Conscience ODD</h4>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                Une prise de conscience accrue de l'importance du développement durable et de la nécessité d'un monde plus juste.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E5E7EB]">
              <span className="text-[#E6B325] text-xl font-bold block mb-2">04</span>
              <h4 className="text-sm font-bold text-[#1B2A5E] mb-1">Citoyenneté active</h4>
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                Un sentiment renforcé d'engagement citoyen et de responsabilité individuelle et collective vis-à-vis du monde.
              </p>
            </div>
          </div>
        </section>

        {/* BLOC 5 — Suivi et évaluation */}
        <section className="bg-white border-l-4 border-[#1B2A5E] bg-[#FDF6E3]/60 p-6 sm:p-8 rounded-r-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B2A5E]">
            Méthodologie de suivi
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1B2A5E] mt-1 mb-3">
            Suivi et évaluation continue du programme
          </h3>
          <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
            L'évaluation du programme s'effectue tout au long du mois à travers des observations comportementales et de participation, des entretiens individuels réguliers avec l'équipe pédagogique, ainsi que des questionnaires rigoureux de satisfaction soumis au participant et à sa famille d'accueil (vie quotidienne, scolarité, sécurité, intégration et relations).
          </p>
          <p className="mt-3 text-sm text-[#4A4A4A] leading-relaxed">
            Un rapport d'évaluation formel est rédigé à la clôture de chaque session afin d'identifier les enseignements clés et de mesurer l'impact durable du projet sur les participants et les communautés hôtes.
          </p>
        </section>

        {/* BLOC 6 — Budget et frais de participation */}
        <section>
          <BudgetTable />
        </section>

        {/* BLOC 7 — Calendrier de la prochaine vague (Encadré Crème) */}
        <section className="bg-[#FDF6E3] border-2 border-[#E6B325] rounded-xl p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B2A5E]">
                Sessions & Cohortes
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1B2A5E] mt-1">
                Calendrier de la prochaine vague
              </h3>
              <p className="text-sm text-[#4A4A4A] mt-1">
                Les places sont limitées afin de garantir une immersion familiale personnalisée et sécurisée.
              </p>
            </div>
            <Link
              to="/contact#inscription"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md font-bold text-sm bg-[#1B2A5E] text-[#E6B325] hover:bg-[#131F45] transition-colors whitespace-nowrap shadow-sm"
            >
              Postuler à cette session
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg border border-[#F2E3C6]">
              <span className="text-xs text-gray-500 uppercase block font-semibold">Ouverture</span>
              <strong className="text-base text-[#1B2A5E]">25 Novembre 2025</strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#F2E3C6]">
              <span className="text-xs text-gray-500 uppercase block font-semibold">Clôture des dépôts</span>
              <strong className="text-base text-[#1B2A5E]">10 Décembre 2025</strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#F2E3C6]">
              <span className="text-xs text-gray-500 uppercase block font-semibold">Début de session</span>
              <strong className="text-base text-[#1B2A5E]">15 Décembre 2025</strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#F2E3C6]">
              <span className="text-xs text-gray-500 uppercase block font-semibold">Clôture & bilan</span>
              <strong className="text-base text-[#1B2A5E]">15 Janvier 2026</strong>
            </div>
          </div>
        </section>

        {/* BLOC 8 — Partenaires du programme */}
        <section className="bg-white border-t border-[#E5E7EB] pt-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Partenaires officiels du programme
          </h4>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            ProGen Bénin, US-BWAA, BeninviEducation, Magic récré, AppStates, Collectivités territoriales et Mairies d'arrondissements partenaires.
          </p>
        </section>

        {/* BLOC 9 — Appel à l'action */}
        <section className="bg-[#1B2A5E] text-white p-8 sm:p-12 rounded-xl border-2 border-[#E6B325] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white">
              Prêt(e) à participer à cette immersion ?
            </h3>
            <p className="text-sm text-gray-300">
              Déposez votre candidature dès maintenant ou consultez le dossier complet de présentation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/contact#inscription"
              className="w-full sm:w-auto px-6 py-3 rounded-md font-bold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] text-center"
            >
              S'inscrire à la prochaine vague
            </Link>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto px-6 py-3 rounded-md font-semibold text-sm border border-white text-white hover:bg-white/10 text-center"
            >
              Imprimer / Enregistrer en PDF
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
