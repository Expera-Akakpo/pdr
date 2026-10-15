import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface ProgramWeekItem {
  id: string;
  week_number: number;
  title: string;
  description: string;
  highlights: string[];
  display_order: number;
}

export const ProgramWeeksAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [weeks, setWeeks] = useState<ProgramWeekItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState<ProgramWeekItem | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchWeeks = () => {
    setLoading(true);
    fetch('/api/admin/program-weeks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWeeks(data);
      })
      .catch(() => addToast('Erreur de chargement des semaines.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeeks();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeek) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/program-weeks/${editingWeek.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingWeek.title,
          description: editingWeek.description,
          highlights: editingWeek.highlights.filter((h) => h.trim().length > 0),
          week_number: editingWeek.week_number,
          display_order: editingWeek.display_order,
        }),
      });

      if (!res.ok) throw new Error();
      addToast(`Semaine ${editingWeek.week_number} mise à jour avec succès.`, 'success');
      setEditingWeek(null);
      fetchWeeks();
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
          Programme — Chronogramme des 4 semaines
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Modifiez le titre, le résumé pédagogique et les activités prévues pour chaque semaine d'immersion.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {weeks.map((week) => (
            <div key={week.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-md bg-[#1B2A5E] text-[#E6B325] font-bold flex items-center justify-center text-xs">
                    S{week.week_number}
                  </span>
                  <h3 className="font-bold text-sm text-[#1B2A5E]">{week.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingWeek(week)}
                  className="px-3 py-1.5 bg-[#FDF6E3] hover:bg-[#F2E3C6] text-[#1B2A5E] rounded text-xs font-semibold"
                >
                  Modifier cette semaine
                </button>
              </div>

              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                {week.description}
              </p>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Activités clés & ateliers :
                </span>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {week.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6B325] mt-1.5 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition d'une semaine */}
      {editingWeek && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A5E] mb-4">
              Modifier la Semaine {editingWeek.week_number}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Titre de la semaine
                </label>
                <input
                  type="text"
                  required
                  value={editingWeek.title}
                  onChange={(e) => setEditingWeek({ ...editingWeek, title: e.target.value })}
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Description générale
                </label>
                <textarea
                  rows={3}
                  value={editingWeek.description}
                  onChange={(e) => setEditingWeek({ ...editingWeek, description: e.target.value })}
                  className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider">
                    Activités & Points clés
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingWeek({ ...editingWeek, highlights: [...editingWeek.highlights, ''] })}
                    className="text-xs text-[#1B2A5E] font-semibold hover:underline"
                  >
                    + Ajouter une activité
                  </button>
                </div>
                <div className="space-y-2">
                  {editingWeek.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const next = [...editingWeek.highlights];
                          next[idx] = e.target.value;
                          setEditingWeek({ ...editingWeek, highlights: next });
                        }}
                        className="flex-1 text-xs px-3 py-1.5 border rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...editingWeek.highlights];
                          next.splice(idx, 1);
                          setEditingWeek({ ...editingWeek, highlights: next });
                        }}
                        className="text-xs text-red-600 px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingWeek(null)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
