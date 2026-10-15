import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

interface TestimonialItem {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  photo_url?: string;
  edition: string;
  display_order: number;
  is_published: boolean;
}

export const TestimonialsAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/admin/testimonials', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => addToast('Erreur de chargement des témoignages', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    const isNew = !editingItem.id;
    const url = isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${editingItem.id}`;
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
      addToast(isNew ? 'Témoignage ajouté.' : 'Témoignage mis à jour.', 'success');
      setEditingItem(null);
      fetchItems();
    } catch {
      addToast('Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Témoignage supprimé.', 'success');
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
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
            Gestion des témoignages
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Retours d'expérience des participants et des familles d'accueil béninoises.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingItem({
              id: '',
              author_name: '',
              author_role: 'Volontaire',
              content: '',
              edition: 'Édition 2025',
              display_order: items.length + 1,
              is_published: true,
            })
          }
          className="px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors"
        >
          + Ajouter un témoignage
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Aucun témoignage enregistré.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Qualité / Rôle</th>
                  <th className="py-3 px-4">Édition</th>
                  <th className="py-3 px-4">Extrait</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">{item.author_name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.author_role}</td>
                    <td className="py-3 px-4 text-gray-500">{item.edition}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{item.content}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold ${item.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] rounded font-semibold text-[11px]"
                      >
                        Modifier
                      </button>
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

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              {editingItem.id ? 'Modifier le témoignage' : 'Nouveau témoignage'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Nom ou attribution de l'auteur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.author_name}
                  onChange={(e) => setEditingItem({ ...editingItem, author_name: e.target.value })}
                  placeholder="Ex. [Témoignage à venir — participant(e), 2025]"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Rôle / Qualité
                  </label>
                  <input
                    type="text"
                    value={editingItem.author_role}
                    onChange={(e) => setEditingItem({ ...editingItem, author_role: e.target.value })}
                    placeholder="Volontaire internationale"
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Édition concernée
                  </label>
                  <input
                    type="text"
                    value={editingItem.edition}
                    onChange={(e) => setEditingItem({ ...editingItem, edition: e.target.value })}
                    placeholder="Édition 2025"
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Contenu du témoignage <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  placeholder="Ce mois passé au Bénin restera à jamais gravé..."
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pub-test"
                  checked={editingItem.is_published}
                  onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                  className="rounded text-[#1B2A5E]"
                />
                <label htmlFor="pub-test" className="text-xs font-semibold text-gray-700">
                  Afficher sur la page d'accueil (Publié)
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
        title="Supprimer le témoignage"
        message="Êtes-vous sûr de vouloir supprimer ce témoignage ?"
        itemName={deleteTarget?.author_name}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
