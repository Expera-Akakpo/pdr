import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { ADMIN_BASE_PATH } from '../../config.ts';

interface CircuitAdminItem {
  id: string;
  title: string;
  region: 'sud' | 'centre' | 'nord';
  city: string;
  duration: string;
  published: boolean;
  display_order: number;
}

export const CircuitsList: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [circuits, setCircuits] = useState<CircuitAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<CircuitAdminItem | null>(null);

  const fetchCircuits = () => {
    setLoading(true);
    fetch('/api/admin/circuits', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCircuits(data);
      })
      .catch(() => addToast('Erreur de chargement des circuits', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCircuits();
  }, [token]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/circuits/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Circuit supprimé avec succès.', 'success');
        setCircuits((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      } else {
        throw new Error();
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = circuits.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.city.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterRegion !== 'all' && c.region !== filterRegion) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Gestion des circuits touristiques
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            10 circuits patrimoniaux, culturels et écotouristiques au Bénin.
          </p>
        </div>

        <Link
          to={`${ADMIN_BASE_PATH}/circuits/new`}
          className="px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors self-start sm:self-auto"
        >
          + Ajouter un circuit
        </Link>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou ville..."
          className="text-xs px-3 py-1.5 border border-gray-300 rounded flex-1 min-w-[200px] outline-none focus:border-[#E6B325]"
        />

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded outline-none bg-white"
        >
          <option value="all">Toutes les régions</option>
          <option value="sud">Région Sud</option>
          <option value="centre">Région Centre</option>
          <option value="nord">Région Nord</option>
        </select>

        {(search || filterRegion !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterRegion('all');
            }}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement des circuits...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-gray-500">Aucun circuit ne correspond.</p>
            <Link
              to={`${ADMIN_BASE_PATH}/circuits/new`}
              className="inline-block text-xs font-bold text-[#1B2A5E] hover:underline"
            >
              + Créer un nouveau circuit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Titre</th>
                  <th className="py-3 px-4">Région</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4">Ordre</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">
                      {c.title}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        c.region === 'sud'
                          ? 'bg-[#1B2A5E] text-white'
                          : c.region === 'centre'
                          ? 'bg-[#E6B325] text-[#1B2A5E]'
                          : 'bg-[#F2E3C6] text-[#1B2A5E]'
                      }`}>
                        {c.region}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.city}</td>
                    <td className="py-3 px-4 text-gray-500">{c.duration}</td>
                    <td className="py-3 px-4 text-gray-400">{c.display_order}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold ${c.published !== false ? 'text-green-600' : 'text-gray-400'}`}>
                        {c.published !== false ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`${ADMIN_BASE_PATH}/circuits/${c.id}/edit`}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] hover:text-[#1B2A5E] rounded font-semibold text-[11px]"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
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
        title="Supprimer le circuit"
        message="Êtes-vous certain de vouloir supprimer ce circuit ?"
        itemName={deleteTarget?.title}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
