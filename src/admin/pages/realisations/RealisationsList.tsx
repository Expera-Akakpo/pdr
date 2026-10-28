import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { ADMIN_BASE_PATH } from '../../config';

interface RealisationAdminItem {
  id: string;
  title: string;
  edition: string;
  status: 'en-cours' | 'termine' | 'a-venir';
  date: string;
  participants_count: number;
  published: boolean;
}

export const RealisationsList: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<RealisationAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEdition, setFilterEdition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<RealisationAdminItem | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/admin/realisations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => addToast('Erreur de chargement des réalisations', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/realisations/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Réalisation supprimée avec succès.', 'success');
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      } else {
        throw new Error();
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterEdition !== 'all' && item.edition !== filterEdition) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const editions = Array.from(new Set(items.map((i) => i.edition).filter(Boolean)));

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Gestion des réalisations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Sessions et bilans d'immersion du programme Pont des Deux Rives.
          </p>
        </div>

        <Link
          to={`${ADMIN_BASE_PATH}/realisations/new`}
          className="px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors self-start sm:self-auto"
        >
          + Ajouter une réalisation
        </Link>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre..."
          className="text-xs px-3 py-1.5 border border-gray-300 rounded flex-1 min-w-[200px] outline-none focus:border-[#E6B325]"
        />

        <select
          value={filterEdition}
          onChange={(e) => setFilterEdition(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded outline-none bg-white"
        >
          <option value="all">Toutes les éditions</option>
          {editions.map((ed) => (
            <option key={ed} value={ed}>{ed}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded outline-none bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="termine">Terminé</option>
          <option value="en-cours">En cours</option>
          <option value="a-venir">À venir</option>
        </select>

        {(search || filterEdition !== 'all' || filterStatus !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterEdition('all');
              setFilterStatus('all');
            }}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau de liste */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Chargement des réalisations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-gray-500">
              Aucune réalisation ne correspond à ces critères.
            </p>
            <Link
              to={`${ADMIN_BASE_PATH}/realisations/new`}
              className="inline-block text-xs font-bold text-[#1B2A5E] hover:underline"
            >
              + Créer la première réalisation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Titre</th>
                  <th className="py-3 px-4">Édition</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Visibilité</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.edition}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.status === 'termine'
                          ? 'bg-[#E7F3EC] text-[#2E7D5B]'
                          : item.status === 'en-cours'
                          ? 'bg-[#E8F0F8] text-[#2E6DA4]'
                          : 'bg-[#FBF0E2] text-[#C97A2B]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold ${item.published !== false ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.published !== false ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`${ADMIN_BASE_PATH}/realisations/${item.id}/edit`}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] hover:text-[#1B2A5E] rounded font-semibold text-[11px]"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-semibold text-[11px]"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la réalisation"
        message="Êtes-vous certain de vouloir supprimer cette réalisation ? Cette action est irréversible."
        itemName={deleteTarget?.title}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
