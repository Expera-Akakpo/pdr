import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_BASE_PATH } from '../config.ts';

interface DashboardData {
  counts: {
    realisations: number;
    circuits: number;
    newInscriptions7d: number;
    unreadMessages: number;
    activeSubscribers: number;
  };
  recentActivities: Array<{
    id: string;
    action: string;
    entity: string;
    details: any;
    created_at: string;
    admin_name?: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Chargement des indicateurs du tableau de bord...
      </div>
    );
  }

  const counts = data?.counts || {
    realisations: 0,
    circuits: 0,
    newInscriptions7d: 0,
    unreadMessages: 0,
    activeSubscribers: 0,
  };

  return (
    <div className="space-y-8 text-left">
      {/* Salutation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-[#1B2A5E]">
            Tableau de bord
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Bienvenue, <strong>{user?.name}</strong>. Voici l'état actuel des données de votre programme.
          </p>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-2.5">
          <Link
            to={`${ADMIN_BASE_PATH}/realisations/new`}
            className="px-3.5 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors"
          >
            + Nouvelle réalisation
          </Link>
          <Link
            to={`${ADMIN_BASE_PATH}/circuits/new`}
            className="px-3.5 py-2 rounded text-xs font-bold bg-[#E6B325] text-[#1B2A5E] hover:bg-[#d4a21d] transition-colors"
          >
            + Nouveau circuit
          </Link>
        </div>
      </div>

      {/* Cartes de statistiques (4 à 5 cartes) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Réalisations
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1B2A5E] mt-1 block">
            {counts.realisations}
          </span>
          <Link to={`${ADMIN_BASE_PATH}/realisations`} className="text-[11px] text-[#E6B325] font-semibold hover:underline mt-2 inline-block">
            Gérer →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Circuits actifs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1B2A5E] mt-1 block">
            {counts.circuits}
          </span>
          <Link to={`${ADMIN_BASE_PATH}/circuits`} className="text-[11px] text-[#E6B325] font-semibold hover:underline mt-2 inline-block">
            Gérer →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Inscriptions (7j)
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#2E7D5B] mt-1 block">
            {counts.newInscriptions7d}
          </span>
          <Link to={`${ADMIN_BASE_PATH}/inscriptions`} className="text-[11px] text-[#E6B325] font-semibold hover:underline mt-2 inline-block">
            Consulter →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Messages non traités
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#C97A2B] mt-1 block">
            {counts.unreadMessages}
          </span>
          <Link to={`${ADMIN_BASE_PATH}/messages`} className="text-[11px] text-[#E6B325] font-semibold hover:underline mt-2 inline-block">
            Traiter →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Abonnés newsletter
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1B2A5E] mt-1 block">
            {counts.activeSubscribers}
          </span>
          <Link to={`${ADMIN_BASE_PATH}/newsletter`} className="text-[11px] text-[#E6B325] font-semibold hover:underline mt-2 inline-block">
            Voir liste →
          </Link>
        </div>
      </div>

      {/* Grille : Dernières activités & Liens rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tableau Dernières Activités */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1B2A5E]">
              Dernières activités enregistrées
            </h3>
            <span className="text-[11px] text-gray-400">10 dernières actions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act) => (
                <div key={act.id} className="p-3.5 sm:px-5 flex items-center justify-between text-xs hover:bg-[#F7F7F5]">
                  <div>
                    <span className="font-semibold text-[#1B2A5E] uppercase text-[10px] bg-gray-100 px-1.5 py-0.5 rounded mr-2">
                      {act.action}
                    </span>
                    <span className="font-medium text-[#1A1A1A] capitalize">{act.entity}</span>
                    {act.details?.title && (
                      <span className="text-gray-500 ml-1.5 italic">« {act.details.title} »</span>
                    )}
                  </div>
                  <div className="text-right text-gray-400 text-[11px] whitespace-nowrap ml-4">
                    <span>{act.admin_name || 'Admin'}</span> • <span>{new Date(act.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-400">
                Aucune activité récente pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Encadré d'actions rapides et raccourcis */}
        <div className="bg-[#FDF6E3] rounded-xl border border-[#F2E3C6] p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#1B2A5E]">
            Raccourcis de gestion
          </h3>
          <p className="text-xs text-[#4A4A4A] leading-relaxed">
            Accédez directement aux opérations clés du programme Pont des Deux Rives :
          </p>
          <div className="space-y-2 text-xs">
            <Link
              to={`${ADMIN_BASE_PATH}/inscriptions`}
              className="block p-3 rounded-lg bg-white border border-[#F2E3C6] font-semibold text-[#1B2A5E] hover:border-[#1B2A5E] transition-colors"
            >
              📋 Gérer les candidatures d'inscription
            </Link>
            <Link
              to={`${ADMIN_BASE_PATH}/circuits`}
              className="block p-3 rounded-lg bg-white border border-[#F2E3C6] font-semibold text-[#1B2A5E] hover:border-[#1B2A5E] transition-colors"
            >
              🗺️ Mettre à jour les 10 circuits touristiques
            </Link>
            <Link
              to={`${ADMIN_BASE_PATH}/programme`}
              className="block p-3 rounded-lg bg-white border border-[#F2E3C6] font-semibold text-[#1B2A5E] hover:border-[#1B2A5E] transition-colors"
            >
              📅 Modifier le déroulement des 4 semaines
            </Link>
            <Link
              to={`${ADMIN_BASE_PATH}/medias`}
              className="block p-3 rounded-lg bg-white border border-[#F2E3C6] font-semibold text-[#1B2A5E] hover:border-[#1B2A5E] transition-colors"
            >
              🖼️ Bibliothèque de médias et téléversements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
