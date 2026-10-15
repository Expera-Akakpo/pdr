import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { MediaUploader } from '../../components/MediaUploader.tsx';

interface PilarItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export const PilarsAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [pilars, setPilars] = useState<PilarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPilar, setEditingPilar] = useState<PilarItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPilars = () => {
    setLoading(true);
    fetch('/api/admin/pilars', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPilars(data);
      })
      .catch(() => addToast('Erreur de chargement des piliers', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPilars();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPilar) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pilars/${editingPilar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingPilar.title,
          description: editingPilar.description,
          image_url: editingPilar.image_url,
          display_order: editingPilar.display_order,
        }),
      });

      if (!res.ok) throw new Error();
      addToast('Pilier mis à jour.', 'success');
      setEditingPilar(null);
      fetchPilars();
    } catch {
      addToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#1B2A5E]">
          Les 3 Piliers du programme
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Gérez les trois axes fondamentaux affichés sur la page d'accueil avec leurs visuels ronds cerclés d'or.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilars.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 rounded-full border-2 border-[#E6B325] overflow-hidden p-1">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[#1B2A5E] text-center mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-[#4A4A4A] leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setEditingPilar(p)}
                  className="px-3.5 py-1.5 bg-[#FDF6E3] hover:bg-[#F2E3C6] text-[#1B2A5E] rounded text-xs font-semibold"
                >
                  Modifier ce pilier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPilar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              Modifier le pilier : {editingPilar.title}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Titre du pilier
                </label>
                <input
                  type="text"
                  required
                  value={editingPilar.title}
                  onChange={(e) => setEditingPilar({ ...editingPilar, title: e.target.value })}
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPilar.description}
                  onChange={(e) => setEditingPilar({ ...editingPilar, description: e.target.value })}
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <MediaUploader
                label="Image du pilier (format rond)"
                value={editingPilar.image_url}
                onChange={(url) => setEditingPilar({ ...editingPilar, image_url: url })}
              />

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPilar(null)}
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
    </div>
  );
};
