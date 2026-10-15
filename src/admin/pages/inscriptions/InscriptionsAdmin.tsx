import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface InscriptionRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  age?: number;
  motivation?: string;
  status: 'nouveau' | 'en_revision' | 'accepte' | 'refuse';
  internal_note?: string;
  created_at: string;
}

export const InscriptionsAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [inscriptions, setInscriptions] = useState<InscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InscriptionRecord | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [itemStatus, setItemStatus] = useState<string>('nouveau');
  const [updating, setUpdating] = useState(false);

  const fetchInscriptions = () => {
    setLoading(true);
    fetch('/api/admin/inscriptions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInscriptions(data);
      })
      .catch(() => addToast('Erreur de chargement des inscriptions', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInscriptions();
  }, [token]);

  const handleOpenDetail = (item: InscriptionRecord) => {
    setSelectedItem(item);
    setInternalNote(item.internal_note || '');
    setItemStatus(item.status || 'nouveau');
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/inscriptions/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: itemStatus,
          internal_note: internalNote,
        }),
      });

      if (!res.ok) throw new Error();
      addToast('Dossier mis à jour.', 'success');
      setInscriptions((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, status: itemStatus as any, internal_note: internalNote } : i))
      );
      setSelectedItem(null);
    } catch {
      addToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/admin/inscriptions/export`;
  };

  const filtered = inscriptions.filter((i) => {
    const fullName = `${i.first_name} ${i.last_name}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase()) && !i.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Demandes d'inscription ({inscriptions.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Candidatures reçues pour les prochaines sessions d'immersion au Bénin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-[#1B2A5E] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Exporter en CSV</span>
          <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou email..."
          className="text-xs px-3 py-1.5 border border-gray-300 rounded flex-1 min-w-[200px] outline-none focus:border-[#E6B325]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded outline-none bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="nouveau">Nouveau</option>
          <option value="en_revision">En révision</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
      </div>

      {/* Tableau des inscriptions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement des dossiers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Aucune candidature trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Candidat</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Pays</th>
                  <th className="py-3 px-4">Âge</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date dépôt</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">
                      {item.first_name} {item.last_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.email}</td>
                    <td className="py-3 px-4 text-gray-600">{item.country}</td>
                    <td className="py-3 px-4 text-gray-500">{item.age || '-'} ans</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.status === 'nouveau'
                          ? 'bg-[#E8F0F8] text-[#2E6DA4]'
                          : item.status === 'en_revision'
                          ? 'bg-[#FBF0E2] text-[#C97A2B]'
                          : item.status === 'accepte'
                          ? 'bg-[#E7F3EC] text-[#2E7D5B]'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] hover:text-[#1B2A5E] rounded font-semibold text-[11px]"
                      >
                        Voir dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détail Inscription */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Dossier de candidature
                </span>
                <h3 className="text-lg font-bold text-[#1B2A5E]">
                  {selectedItem.first_name} {selectedItem.last_name}
                </h3>
              </div>
              <a
                href={`mailto:${selectedItem.email}?subject=Votre candidature au programme Pont des Deux Rives`}
                className="px-3 py-1.5 bg-[#E6B325] text-[#1B2A5E] rounded text-xs font-bold hover:bg-[#d4a21d]"
              >
                Envoyer un e-mail
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F7F5] p-4 rounded-lg">
              <div>
                <span className="text-gray-400 block font-semibold">Email</span>
                <span className="text-[#1B2A5E] font-medium">{selectedItem.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Téléphone / WhatsApp</span>
                <span className="text-[#1B2A5E] font-medium">{selectedItem.phone || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Pays de résidence</span>
                <span className="text-[#1B2A5E] font-medium">{selectedItem.country}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Âge</span>
                <span className="text-[#1B2A5E] font-medium">{selectedItem.age || '-'} ans</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1B2A5E] uppercase tracking-wider block mb-1">
                Motivations déclarées :
              </span>
              <p className="text-xs text-[#4A4A4A] leading-relaxed bg-[#FDF6E3] p-3 rounded border border-[#F2E3C6] whitespace-pre-wrap">
                {selectedItem.motivation || 'Aucun texte de motivation renseigné.'}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Changer le statut du dossier
                </label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded bg-white"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_revision">En révision (contact en cours)</option>
                  <option value="accepte">Accepté pour la session</option>
                  <option value="refuse">Refusé / Non éligible</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Note interne d'équipe (confidentielle)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ex. Entretien téléphonique prévu mardi à 14h..."
                  className="w-full text-xs px-3 py-2 border rounded outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border rounded text-xs font-semibold text-gray-700"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
              >
                {updating ? 'Mise à jour...' : 'Sauvegarder le dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
