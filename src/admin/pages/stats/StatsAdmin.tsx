import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface StatItem {
  id: string;
  label: string;
  value: string;
  suffix: string;
  display_order: number;
}

export const StatsAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStats(data);
      })
      .catch(() => addToast('Erreur de chargement des statistiques', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stats/${editingStat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingStat),
      });

      if (!res.ok) throw new Error();
      addToast('Chiffre clé mis à jour.', 'success');
      setEditingStat(null);
      fetchStats();
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
          Statistiques & Chiffres clés
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Modifiez les grands indicateurs affichés en jaune/or dans la section chiffres clés de l'accueil.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Position #{stat.display_order}
                </span>
                <div className="text-3xl font-extrabold text-[#1B2A5E]">
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-semibold text-[#E6B325] ml-1">{stat.suffix}</span>}
                </div>
                <h3 className="font-semibold text-xs text-gray-700 mt-2">
                  {stat.label}
                </h3>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingStat(stat)}
                  className="w-full py-1.5 bg-[#FDF6E3] hover:bg-[#F2E3C6] text-[#1B2A5E] rounded text-xs font-semibold text-center"
                >
                  Modifier ce chiffre
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingStat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              Modifier l'indicateur
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Libellé de l'indicateur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStat.label}
                  onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                  placeholder="Ex. Durée du programme"
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Valeur principale <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStat.value}
                    onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                    placeholder="Ex. 1"
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                    Suffixe / Unité
                  </label>
                  <input
                    type="text"
                    value={editingStat.suffix || ''}
                    onChange={(e) => setEditingStat({ ...editingStat, suffix: e.target.value })}
                    placeholder="Ex. mois (4 sem.)"
                    className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingStat(null)}
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
