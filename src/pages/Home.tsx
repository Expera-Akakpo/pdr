import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero.tsx';
import { SectionTitle } from '../components/SectionTitle.tsx';
import { PilarCard } from '../components/PilarCard.tsx';
import { StatBlock } from '../components/StatBlock.tsx';
import { TestimonialCard } from '../components/TestimonialCard.tsx';
import { PartnerLogo } from '../components/PartnerLogo.tsx';
import { CTA } from '../components/CTA.tsx';
import { Pilar, Stat, Testimonial, Partner } from '../types';
import {
  INITIAL_PILARS,
  INITIAL_STATS,
  INITIAL_TESTIMONIALS,
  INITIAL_PARTNERS,
} from '../server/seedData.ts';

export const Home: React.FC = () => {
  const [pilars, setPilars] = useState<Pilar[]>(INITIAL_PILARS);
  const [stats, setStats] = useState<Stat[]>(INITIAL_STATS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch live data from backend API with fallback resilience
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') setSettings(data);
      })
      .catch(() => {});

    fetch('/api/programs')
      .then((res) => res.json())
      .then((data) => {
        if (data.pilars && data.pilars.length > 0) setPilars(data.pilars);
      })
      .catch(() => {});

    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setStats(data);
      })
      .catch(() => {});

    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch(() => {});

    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPartners(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* 1. HÉROS */}
      <Hero
        backgroundImage={settings.hero_image || '/images/hero-pont-des-deux-rives.jpg'}
        title={settings.hero_title}
        subtitle={settings.hero_subtitle}
        intro={settings.hero_intro}
      />

      {/* 2. LES TROIS PILIERS DU PROGRAMME (Fond Crème) */}
      <section className="bg-[#FDF6E3] py-16 sm:py-20 border-b border-[#F2E3C6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Fondements du programme"
            title="Les trois piliers de l'expérience"
            description="Le programme Pont des Deux Rives repose sur une articulation équilibrée entre solidarité active, immersion humaine en famille et découverte du riche patrimoine béninois."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {pilars.map((p, idx) => (
              <PilarCard
                key={p.id || idx}
                title={p.title}
                description={p.description}
                imageUrl={p.image_url}
                orderNumber={idx + 1}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/programmes"
              className="inline-flex items-center text-sm font-bold text-[#1B2A5E] hover:text-[#E6B325] transition-colors"
            >
              <span>Découvrir le déroulement complet des 4 semaines</span>
              <svg className="w-4 h-4 ml-1.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. À QUI S'ADRESSE LE PROGRAMME ? (Fond Blanc) */}
      <section className="bg-white py-16 sm:py-20 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Public & Candidats"
            title="À qui s'adresse le programme ?"
            description="Une opportunité d'ouverture humaine adaptée aussi bien aux ressortissants d'origine béninoise qu'aux volontaires du monde entier."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-10">
            {/* Colonne Diaspora */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-8 hover:border-[#1B2A5E] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-[#1B2A5E] mb-3">
                La diaspora béninoise
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed mb-4">
                Renouez avec vos racines, découvrez les réalités de terrain de vos aïeux et contribuez activement au développement socio-éducatif de votre pays d'origine par le transfert de compétences et le partage fraternel.
              </p>
              <ul className="space-y-2 text-sm text-[#4A4A4A]">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] mr-2" />
                  Transmission intergénérationnelle et reconnexion culturelle
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] mr-2" />
                  Engagement citoyen auprès des écoles et centres locaux
                </li>
              </ul>
            </div>

            {/* Colonne Touristes et Volontaires Internationaux */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-8 hover:border-[#1B2A5E] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#1B2A5E] text-[#E6B325] flex items-center justify-center font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-[#1B2A5E] mb-3">
                Les touristes et volontaires internationaux
              </h3>
              <p className="text-base text-[#4A4A4A] leading-relaxed mb-4">
                Découvrez le Bénin autrement, par une immersion humaine, sociale et culturelle loin des circuits aseptisés. Partagez le quotidien d'une famille chaleureuse et mettez vos savoir-faire au service d'initiatives tangibles.
              </p>
              <ul className="space-y-2 text-sm text-[#4A4A4A]">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] mr-2" />
                  Immersion familiale authentique et sécurisée
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] mr-2" />
                  Visite approfondie des hauts lieux d'histoire et de mémoire
                </li>
              </ul>
            </div>
          </div>

          {/* Mention spéciale */}
          <div className="mt-8 bg-[#FDF6E3] border-l-4 border-[#E6B325] p-5 rounded-r-lg">
            <p className="text-sm sm:text-base font-semibold text-[#1B2A5E]">
              📌 Mention spéciale : « Ouvert en priorité aux jeunes de 16 à 30 ans, curieux, engagés et ouverts au monde. »
            </p>
          </div>
        </div>
      </section>

      {/* 4. CHIFFRES CLÉS (Fond Bleu Marine) */}
      <section className="bg-[#1B2A5E] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Repères et données"
            title="Les chiffres clés du programme"
            description="Une organisation cadrée, pilotée par une équipe associative engagée depuis 2022 pour l'éducation et la jeunesse."
            theme="dark"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10">
            {stats.map((s, idx) => (
              <StatBlock key={s.id || idx} stat={s} />
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            * Suivi d'impact conforme aux Objectifs de Développement Durable des Nations Unies (ODD 4, 10 et 17).
          </div>
        </div>
      </section>

      {/* 5. POURQUOI NOUS CHOISIR ? (Fond Crème) */}
      <section className="bg-[#FDF6E3] py-16 sm:py-20 border-b border-[#F2E3C6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Nos garanties"
            title="Pourquoi choisir Pont des Deux Rives ?"
            description="Cinq engagements d'exigence pour assurer un voyage d'apprentissage éthique, sécurisé et inoubliable."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
            <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#E6B325] uppercase tracking-wider block mb-2">01</span>
              <h4 className="text-base font-bold text-[#1B2A5E] mb-2">Immersion authentique</h4>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                Hébergement soigné au sein de familles béninoises sélectionnées et conventionnées.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#E6B325] uppercase tracking-wider block mb-2">02</span>
              <h4 className="text-base font-bold text-[#1B2A5E] mb-2">Engagement concret</h4>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                Participation directe à des projets communautaires réels : santé, écoles et hygiène.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#E6B325] uppercase tracking-wider block mb-2">03</span>
              <h4 className="text-base font-bold text-[#1B2A5E] mb-2">Découverte culturelle</h4>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                Initiation à la langue fon, artisanat traditionnel, musique, cuisine et festivals locaux.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#E6B325] uppercase tracking-wider block mb-2">04</span>
              <h4 className="text-base font-bold text-[#1B2A5E] mb-2">Accompagnement complet</h4>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                Accueil personnalisé dès l'aéroport, briefing pédagogique, encadrement 24h/24 et suivi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#E6B325] uppercase tracking-wider block mb-2">05</span>
              <h4 className="text-base font-bold text-[#1B2A5E] mb-2">Réseau international</h4>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                Échanges fraternels durables avec des volontaires et partenaires venus de multiples pays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NOS PARTENAIRES (Fond Blanc) */}
      <section className="bg-white py-16 sm:py-20 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Alliances et Coopération"
            title="Nos partenaires institutionnels et locaux"
            description="Le programme Pont des Deux Rives est réalisé en partenariat avec des organisations locales et internationales."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mt-10">
            {partners.map((partner, idx) => (
              <PartnerLogo key={partner.id || idx} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. TÉMOIGNAGES (Fond Bleu Marine) */}
      <section className="bg-[#1B2A5E] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            subtitle="Retours d'expérience"
            title="La voix de nos participants et familles"
            description="Des témoignages sincères qui illustrent la portée humaine et transformatrice de chaque session d'immersion."
            theme="dark"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={t.id || idx} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. APPEL À L'ACTION FINAL (Fond Jaune/Or) */}
      <CTA />
    </div>
  );
};
