import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { SectionTitle } from '../components/SectionTitle.tsx';
import { CircuitCard } from '../components/CircuitCard.tsx';
import { CircuitDetailModal } from '../components/CircuitDetailModal.tsx';
import { Circuit, CircuitRegion } from '../types';
import { INITIAL_CIRCUITS } from '../server/seedData.ts';

export const Circuits: React.FC = () => {
  const [circuits, setCircuits] = useState<Circuit[]>(INITIAL_CIRCUITS);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeCircuit, setActiveCircuit] = useState<Circuit | null>(null);

  useEffect(() => {
    fetch('/api/circuits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCircuits(data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredCircuits = circuits.filter((c) => {
    if (selectedRegion === 'all') return true;
    return c.region === selectedRegion;
  });

  return (
    <div className="bg-white">
      {/* Fil d'Ariane */}
      <Breadcrumb items={[{ label: 'Circuits touristiques' }]} />

      {/* En-tête de page avec fond photographique */}
      <PageHeader
        badge="Patrimoine, Mémoire & Écotourisme"
        title="Circuits touristiques"
        description="Le Bénin regorge de sites historiques, culturels et naturels exceptionnels. Le programme Pont des Deux Rives vous fait découvrir les plus beaux trésors du pays, du sud au centre."
        backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Filtres & Grille des 10 circuits */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1B2A5E]">
                Nos 10 étapes et circuits incontournables
              </h2>
              <p className="text-sm text-[#4A4A4A] mt-1">
                Explorez chaque étape en détail pour connaître les points forts et la durée de visite.
              </p>
            </div>

            {/* Filtres de région réactifs */}
            <div className="inline-flex rounded-md border border-[#E5E7EB] p-1 bg-[#F7F7F5] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded ${
                  selectedRegion === 'all'
                    ? 'bg-[#1B2A5E] text-white shadow-2xs'
                    : 'text-[#4A4A4A] hover:text-[#1B2A5E]'
                }`}
              >
                Toutes les régions ({circuits.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('sud')}
                className={`px-3 py-1.5 text-xs font-semibold rounded ${
                  selectedRegion === 'sud'
                    ? 'bg-[#1B2A5E] text-white shadow-2xs'
                    : 'text-[#4A4A4A] hover:text-[#1B2A5E]'
                }`}
              >
                Sud
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('centre')}
                className={`px-3 py-1.5 text-xs font-semibold rounded ${
                  selectedRegion === 'centre'
                    ? 'bg-[#E6B325] text-[#1B2A5E] shadow-2xs'
                    : 'text-[#4A4A4A] hover:text-[#1B2A5E]'
                }`}
              >
                Centre
              </button>
            </div>
          </div>

          {/* Grille responsive 3 colonnes desktop, 2 tablette, 1 mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCircuits.map((circuit) => (
              <CircuitCard
                key={circuit.id || circuit.slug}
                circuit={circuit}
                onSelect={(c) => setActiveCircuit(c)}
              />
            ))}
          </div>
        </section>

        {/* BLOC « Nos itinéraires types » (Fond Crème) */}
        <section className="bg-[#FDF6E3] border border-[#F2E3C6] rounded-xl p-8 sm:p-10">
          <SectionTitle
            subtitle="Parcours suggérés"
            title="Nos trois itinéraires types"
            description="Des parcours équilibrés conçus pour rythmer votre séjour d'immersion au Bénin."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#1B2A5E] bg-[#E6B325] px-2.5 py-1 rounded inline-block uppercase tracking-wider mb-3">
                7 Jours
              </span>
              <h3 className="text-lg font-bold text-[#1B2A5E] mb-2">
                Itinéraire Sud
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">
                Plongée dans la culture lacustre et mémorielle : Cotonou moderne, navigation à Ganvié, Route des Esclaves à Ouidah et détente à Grand-Popo.
              </p>
              <div className="text-xs text-gray-500 font-medium">
                Villes : Cotonou • Ganvié • Ouidah • Grand-Popo
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#1B2A5E] bg-[#E6B325] px-2.5 py-1 rounded inline-block uppercase tracking-wider mb-3">
                7 Jours
              </span>
              <h3 className="text-lg font-bold text-[#1B2A5E] mb-2">
                Itinéraire Centre
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">
                Au cœur des royaumes historiques et des métiers d'art : le grand marché de Bohicon, les Palais Royaux d'Abomey (UNESCO), tissage à Djidja et sculpture à Saclo.
              </p>
              <div className="text-xs text-gray-500 font-medium">
                Villes : Bohicon • Abomey • Djidja • Saclo
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#F2E3C6] shadow-2xs">
              <span className="text-xs font-bold text-[#1B2A5E] bg-[#E6B325] px-2.5 py-1 rounded inline-block uppercase tracking-wider mb-3">
                14 Jours
              </span>
              <h3 className="text-lg font-bold text-[#1B2A5E] mb-2">
                Itinéraire Combiné (Sud + Centre)
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">
                La grande traversée culturelle alliant la côte atlantique, les cités royales de l'intérieur et les villages communautaires ruraux.
              </p>
              <div className="text-xs text-gray-500 font-medium">
                Parcours complet : Sud + Centre
              </div>
            </div>
          </div>
        </section>

        {/* BLOCS Ce qui est inclus / Ce qui n'est pas inclus */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#E7F3EC] border border-[#2E7D5B]/30 rounded-xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#2E7D5B] mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5B] mr-2" />
              Ce qui est inclus dans nos circuits
            </h3>
            <ul className="space-y-2.5 text-sm text-[#1A1A1A]">
              <li className="flex items-start">
                <span className="text-[#2E7D5B] font-bold mr-2">✓</span>
                Transport sur place en véhicule dédié sécurisé
              </li>
              <li className="flex items-start">
                <span className="text-[#2E7D5B] font-bold mr-2">✓</span>
                Guide francophone / anglophone agréé
              </li>
              <li className="flex items-start">
                <span className="text-[#2E7D5B] font-bold mr-2">✓</span>
                Tous les droits d'entrée sur les sites touristiques et musées
              </li>
              <li className="flex items-start">
                <span className="text-[#2E7D5B] font-bold mr-2">✓</span>
                Repas pendant les excursions (selon l'itinéraire retenu)
              </li>
              <li className="flex items-start">
                <span className="text-[#2E7D5B] font-bold mr-2">✓</span>
                Hébergement en famille d'accueil ou campement selon le circuit
              </li>
            </ul>
          </div>

          <div className="bg-[#FBF0E2] border border-[#C97A2B]/30 rounded-xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#C97A2B] mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C97A2B] mr-2" />
              Ce qui n'est pas inclus
            </h3>
            <ul className="space-y-2.5 text-sm text-[#1A1A1A]">
              <li className="flex items-start">
                <span className="text-[#C97A2B] font-bold mr-2">✗</span>
                Billets d'avion internationaux aller-retour
              </li>
              <li className="flex items-start">
                <span className="text-[#C97A2B] font-bold mr-2">✗</span>
                Assurance voyage et rapatriement individuelle obligatoire
              </li>
              <li className="flex items-start">
                <span className="text-[#C97A2B] font-bold mr-2">✗</span>
                Dépenses personnelles et souvenirs artisanaux
              </li>
              <li className="flex items-start">
                <span className="text-[#C97A2B] font-bold mr-2">✗</span>
                Frais d'e-Visa touristique et vaccins requis (fièvre jaune)
              </li>
            </ul>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="bg-[#1B2A5E] text-white p-8 sm:p-12 rounded-xl text-center space-y-4 border border-[#E6B325]/40">
          <h3 className="text-2xl sm:text-3xl font-bold">
            Envie de découvrir le Bénin autrement ?
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Chaque circuit touristique est intégré harmonieusement aux activités bénévoles et à l'immersion familiale.
          </p>
          <div className="pt-2">
            <Link
              to="/contact#inscription"
              className="inline-flex items-center px-7 py-3 rounded-md font-bold text-sm bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors"
            >
              Rejoindre le programme Pont des Deux Rives
            </Link>
          </div>
        </section>
      </div>

      {/* Modal Fiche Détaillée */}
      <CircuitDetailModal
        circuit={activeCircuit}
        onClose={() => setActiveCircuit(null)}
      />
    </div>
  );
};
