import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

interface PartnerItem {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  description: string;
  partner_type: string;
  display_order: number;
  is_published: boolean;
}

export const PartnersAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PartnerItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPartners = () => {
    setLoading(true);
    fetch('/api/admin/partners', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPartners(data);
      })
      .catch(() => addToast('Erreur de chargement des partenaires', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartners();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    const isNew = !editingItem.id;
    const url = isNew ? '/api/admin/partners' : `/api/admin/partners/${editingItem.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error();
      addToast(isNew ? 'Partenaire ajouté.' : 'Partenaire mis à jour.', 'success');
      setEditingItem(null);
      fetchPartners();
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/partners/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Partenaire supprimé.', 'success');
        setPartners((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Gestion des partenaires
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organisations locales et internationales associées au programme.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingItem({
              id: '',
              name: '',
              partner_type: 'Institutionnel',
              description: '',
              display_order: partners.length + 1,
              is_published: true,
            })
          }
          className="px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors"
        >
          + Ajouter un partenaire
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Aucun partenaire enregistré.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Ordre</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">{p.name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.partner_type}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{p.description}</td>
                    <td className="py-3 px-4 text-gray-400">{p.display_order}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold ${p.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                        {p.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingItem(p)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] rounded font-semibold text-[11px]"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
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

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              {editingItem.id ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Nom du partenaire <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex. US-BWAA"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Type de partenaire
                  </label>
                  <input
                    type="text"
                    value={editingItem.partner_type}
                    onChange={(e) => setEditingItem({ ...editingItem, partner_type: e.target.value })}
                    placeholder="Ex. Éducation, Technique..."
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={editingItem.display_order}
                    onChange={(e) => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Courte description du rôle
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Appui éducatif et parrainage..."
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pub-part"
                  checked={editingItem.is_published}
                  onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                  className="rounded text-[#1B2A5E]"
                />
                <label htmlFor="pub-part" className="text-xs font-semibold text-gray-700">
                  Afficher sur le site public
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le partenaire"
        message="Êtes-vous sûr de vouloir supprimer ce partenaire ?"
        itemName={deleteTarget?.name}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
