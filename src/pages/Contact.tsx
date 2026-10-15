import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { SectionTitle } from '../components/SectionTitle.tsx';
import { ContactForm } from '../components/ContactForm.tsx';
import { InscriptionForm } from '../components/InscriptionForm.tsx';
import { FAQ } from '../components/FAQ.tsx';

export const Contact: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#inscription') {
      const el = document.getElementById('inscription');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="bg-white">
      {/* Fil d'Ariane */}
      <Breadcrumb items={[{ label: 'Contactez-nous' }]} />

      {/* En-tête de page avec fond photographique */}
      <PageHeader
        badge="Écoute, Orientation & Inscription"
        title="Contactez-nous"
        description="Une question sur le programme Pont des Deux Rives ? Une demande d'inscription ? Écrivez-nous, notre équipe vous répond sous 48 h."
        backgroundImage="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1920&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Grille Deux Colonnes : Coordonnées & Formulaire de contact */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Colonne Gauche — Coordonnées officielles */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
                  Siège Administratif
                </span>
                <h2 className="text-2xl font-bold text-[#1B2A5E] mt-1">
                  ProGen Bénin
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Programme « Pont des Deux Rives »
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#4A4A4A] divide-y divide-gray-200">
                <div className="pt-2">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-1">
                    Adresse physique :
                  </strong>
                  <p className="leading-relaxed">
                    Cité Arconville, Lot 643, Parcelle K-A2,<br />
                    Commune d'Abomey-Calavi, République du Bénin
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Boîte Postale : BP 1272 Abomey-Calavi
                  </p>
                </div>

                <div className="pt-4">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-1">
                    Téléphones officiels :
                  </strong>
                  <p>
                    <a href="tel:+2290169740000" className="text-[#1B2A5E] font-bold hover:text-[#E6B325] block text-base">
                      +229 01 69 74 00 00
                    </a>
                    <a href="tel:+22997525168" className="text-xs text-gray-500 hover:underline block">
                      +229 97 52 51 68
                    </a>
                  </p>
                </div>

                <div className="pt-4">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-1">
                    Courriel officiel :
                  </strong>
                  <p>
                    <a href="mailto:progenbenin@gmail.com" className="font-semibold text-[#1B2A5E] hover:text-[#E6B325]">
                      progenbenin@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    contact@progenbenin.org
                  </p>
                </div>

                <div className="pt-4">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-1">
                    Horaires d'ouverture :
                  </strong>
                  <p className="text-xs">
                    Lundi – Vendredi : 08h00 – 17h00 (GMT+1)<br />
                    Permanence d'accueil durant les séjours 24h/24.
                  </p>
                </div>

                <div className="pt-4">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-1">
                    Reconnaissance juridique :
                  </strong>
                  <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded border border-gray-200 text-gray-600">
                    n°2022/3357/DEP-LIT/SG/SAG-Assoc
                  </p>
                </div>

                {/* Réseaux sociaux en liens texte simples */}
                <div className="pt-4">
                  <strong className="text-[#1B2A5E] block text-xs uppercase tracking-wider mb-2">
                    Réseaux & Plateformes :
                  </strong>
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-[#1B2A5E]">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6B325] hover:underline">
                      Facebook
                    </a>
                    <span>•</span>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6B325] hover:underline">
                      LinkedIn
                    </a>
                    <span>•</span>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6B325] hover:underline">
                      Instagram
                    </a>
                    <span>•</span>
                    <a href="https://wa.me/2290169740000" target="_blank" rel="noopener noreferrer" className="hover:text-[#E6B325] hover:underline">
                      WhatsApp direct
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite — Formulaire de contact */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6B325]">
                Formulaire en ligne
              </span>
              <h2 className="text-2xl font-bold text-[#1B2A5E] mt-1">
                Envoyez-nous un message
              </h2>
              <p className="text-sm text-[#4A4A4A] mt-1">
                Notre secrétariat traite les demandes de renseignements, de parrainage et de partenariats sous 48 h ouvrées.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

        {/* Section « Inscription rapide » (ancre #inscription, encadré crème) */}
        <section>
          <InscriptionForm />
        </section>

        {/* Section Carte Google Maps (Iframe niveaux de gris, 300px) */}
        <section className="bg-white">
          <SectionTitle
            subtitle="Localisation"
            title="Où nous trouver au Bénin"
            description="Le siège de ProGen Bénin est établi à Abomey-Calavi (Cité Arconville), à proximité immédiate de Cotonou et de l'embarcadère de Ganvié."
          />

          <div className="rounded-[12px] overflow-hidden border border-[#E5E7EB] shadow-xs">
            <iframe
              title="Carte de localisation ProGen Bénin à Abomey-Calavi"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7275727142647!2d2.3551!3d6.4485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102355c3c0a4e7ab%3A0x6b801452df3c8e42!2sAbomey-Calavi%2C%20B%C3%A9nin!5e0!3m2!1sfr!2s!4v1700000000000!5m2!1sfr!2s"
              width="100%"
              height="300"
              style={{ border: 0, filter: 'grayscale(70%) contrast(1.05)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-2 text-right">
            <a
              href="https://maps.google.com/?q=Abomey-Calavi+Benin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#1B2A5E] hover:text-[#E6B325] inline-flex items-center gap-1"
            >
              <span>Ouvrir dans Google Maps</span>
              <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>

        {/* Section « FAQ » (Accordéon simple) */}
        <section className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-6 sm:p-10">
          <SectionTitle
            subtitle="Foire Aux Questions"
            title="Questions fréquentes"
            description="Tout ce qu'il faut savoir avant de postuler et de préparer votre départ pour le Bénin."
          />
          <div className="mt-8">
            <FAQ />
          </div>
        </section>
      </div>
    </div>
  );
};
