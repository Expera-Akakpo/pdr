import React from 'react';
import { Link } from 'react-router-dom';
import defaultHeroImage from '../assets/images/pont_deux_rives_hero_1792059615449.jpg';

interface HeroProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  intro?: string;
}

export const Hero: React.FC<HeroProps> = ({
  backgroundImage,
  title,
  subtitle,
  intro,
}) => {
  const resolvedImage = backgroundImage || defaultHeroImage;

  return (
    <section className="relative text-white overflow-hidden py-20 sm:py-24 lg:py-32 border-b-4 border-[#E6B325] min-h-[600px] flex items-center justify-center">
      {/* 1. Image de fond photographique pleine largeur (Pont des Deux Rives au Bénin) */}
      <img
        src={resolvedImage}
        alt="Pont des Deux Rives — Immersion et découverte au Bénin"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 ease-out"
        loading="eager"
      />

      {/* 2. Voile cinématographique transparent : laisse transparaître la vraie photographie tout en assurant une lisibilité optimale */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#131F45]/90 via-[#1B2A5E]/40 to-black/35" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* 3. Badge discret indiquant la scène photographique */}
      <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131F45]/80 backdrop-blur-md text-xs text-white/90 border border-[#E6B325]/40 shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#E6B325] animate-pulse" />
        <span>Bénin • Pont des Deux Rives & Pirogues sur la lagune</span>
      </div>

      {/* 4. Contenu textuel */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Titre H1 avec drop-shadow fort pour contraster sur l'image */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
            {title ? (
              title
            ) : (
              <>
                Pont des <span className="text-[#E6B325] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Deux Rives</span>
              </>
            )}
          </h1>

          {/* Sous-titre en jaune/or, bien contrasté */}
          <p className="text-[#E6B325] text-base sm:text-xl font-bold uppercase tracking-[0.12em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {subtitle || "Un voyage d'apprentissage et de citoyenneté interculturelle"}
          </p>

          {/* Paragraphe d'introduction officiel avec contraste renforcé */}
          <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed font-medium max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/15 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none p-3 sm:p-0 rounded-lg">
            {intro ||
              "Pont des Deux Rives allie : engagement social, découverte interculturelle, famille d'accueil et visites touristiques. Un voyage d'apprentissage et d'ouverture au monde."}
          </p>

          {/* Deux boutons d'action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/programmes"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-md font-bold text-base bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors duration-150 shadow-xl hover:shadow-2xl"
            >
              Découvrir le programme
            </Link>
            <Link
              to="/contact#inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-md font-semibold text-base border-2 border-white bg-black/25 hover:bg-white text-white hover:text-[#1B2A5E] transition-all duration-150 backdrop-blur-sm shadow-xl"
            >
              S'inscrire
            </Link>
          </div>

          {/* Mention officielle discrète */}
          <div className="pt-6 text-xs text-gray-200 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            Porté par l'ONG Prochaine Génération Bénin (ProGen Bénin) • Reconnaissance officielle n°2022/3357/DEP-LIT/SG/SAG-Assoc
          </div>
        </div>
      </div>
    </section>
  );
};
