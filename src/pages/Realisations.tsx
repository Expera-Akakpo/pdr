import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { SectionTitle } from '../components/SectionTitle.tsx';
import { RealisationCard } from '../components/RealisationCard.tsx';
import { RealisationDetailModal } from '../components/RealisationDetailModal.tsx';
import { Gallery, GalleryImage } from '../components/Gallery.tsx';
import { Realisation } from '../types';
import { INITIAL_REALISATIONS } from '../server/seedData';

export const Realisations: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>(INITIAL_REALISATIONS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeRealisation, setActiveRealisation] = useState<Realisation | null>(null);

  useEffect(() => {
    fetch('/api/realisations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setRealisations(data);
        }
      })
      .catch(() => {});
  }, []);

  const filters = [
    { id: 'all', label: 'Toutes' },
    { id: 'edition-2025', label: 'Édition 2025' },
    { id: 'edition-2026', label: 'Édition 2026' },
    { id: 'en-cours', label: 'En cours' },
    { id: 'termine', label: 'Terminées' },
  ];

  const filteredRealisations = realisations.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'edition-2025') return r.edition.toLowerCase().includes('2025');
    if (selectedFilter === 'edition-2026') return r.edition.toLowerCase().includes('2026');
    if (selectedFilter === 'en-cours') return r.status === 'en-cours';
    if (selectedFilter === 'termine') return r.status === 'termine';
    return true;
  });

  // Global gallery combining the best photographs
  const globalGalleryImages: GalleryImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      caption: 'Accueil chaleureux de la première volontaire en famille d\'accueil béninoise'
    },
    {
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      caption: 'Animation socio-éducative et sensibilisation avec les écoliers partenaires'
    },
    {
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      caption: 'Visite immersive en pirogue à perche sur le lac Nokoué à Ganvié'
    },
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      caption: 'Étape mémorielle sur la Route des Esclaves face à l\'Océan Atlantique à Ouidah'
    },
    {
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      caption: 'Découverte des bas-reliefs et trônes historiques des Palais Royaux d\'Abomey'
    },
    {
      url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80',
      caption: 'Soirée de clôture interculturelle et remise du certificat officiel de participation'
    }
  ];

  return (
    <div className="bg-white">
      {/* Fil d'Ariane */}
      <Breadcrumb items={[{ label: 'Nos réalisations' }]} />

      {/* En-tête de page avec fond photographique */}
      <PageHeader
        badge="Retours d'Expérience & Impact de Terrain"
        title="Nos réalisations"
        description="Retour en images et en mots sur les actions menées dans le cadre du programme Pont des Deux Rives."
        backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Filtres & Liste des réalisations */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1B2A5E]">
                Sessions & Projets réalisés
              </h2>
              <p className="text-sm text-[#4A4A4A] mt-1">
                Filtrez par statut ou par édition annuelle pour consulter les bilans d'immersion.
              </p>
            </div>

            {/* Boutons texte de filtrage instantané côté client */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    selectedFilter === f.id
                      ? 'bg-[#1B2A5E] text-[#E6B325]'
                      : 'bg-[#F7F7F5] text-[#4A4A4A] hover:bg-[#F2E3C6] hover:text-[#1B2A5E]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grille de cartes réalisation */}
          {filteredRealisations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredRealisations.map((r) => (
                <RealisationCard
                  key={r.id || r.slug}
                  realisation={r}
                  onSelect={(item) => setActiveRealisation(item)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#F7F7F5] border border-gray-200 rounded-lg p-10 text-center text-[#4A4A4A]">
              <p className="font-medium">
                Aucune réalisation ne correspond actuellement à ce filtre.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                L'édition 2026 est actuellement en cours d'ouverture des inscriptions.
              </p>
            </div>
          )}
        </section>

        {/* Section « Galerie globale » (Fond Bleu Marine) */}
        <section className="bg-[#1B2A5E] text-white p-8 sm:p-12 rounded-xl border border-white/10">
          <SectionTitle
            subtitle="Immersion photographique"
            title="Galerie globale du programme"
            description="Moments de vie, chantiers solidaires, rencontres chaleureuses et trésors du Bénin. Cliquez sur une image pour l'agrandir."
            theme="dark"
          />
          <div className="mt-8">
            <Gallery images={globalGalleryImages} columns={3} />
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="bg-[#FDF6E3] border border-[#F2E3C6] p-8 sm:p-10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-[#1B2A5E]">
              Vous souhaitez participer à la prochaine édition ?
            </h3>
            <p className="text-sm text-[#4A4A4A] mt-1">
              Les candidatures pour la prochaine vague de volontariat sont ouvertes.
            </p>
          </div>
          <Link
            to="/contact#inscription"
            className="inline-flex items-center px-6 py-3 rounded-md font-bold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors whitespace-nowrap shadow-sm"
          >
            S'inscrire à l'édition 2026
          </Link>
        </section>
      </div>

      {/* Modal Fiche Détaillée & Galerie de réalisation */}
      <RealisationDetailModal
        realisation={activeRealisation}
        onClose={() => setActiveRealisation(null)}
      />
    </div>
  );
};
