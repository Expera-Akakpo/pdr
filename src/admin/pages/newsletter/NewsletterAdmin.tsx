import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface SubscriberItem {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  created_at: string;
}

export const NewsletterAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = () => {
    setLoading(true);
    fetch('/api/admin/newsletter', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubscribers(data);
      })
      .catch(() => addToast('Erreur de chargement des abonnés', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubs();
  }, [token]);

  const toggleActive = async (item: SubscriberItem) => {
    try {
      const res = await fetch(`/api/admin/newsletter/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      });

      if (!res.ok) throw new Error();
      addToast(item.is_active ? 'Abonné désactivé.' : 'Abonné réactivé.', 'success');
      setSubscribers((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch {
      addToast('Erreur de mise à jour.', 'error');
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/admin/newsletter/export`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Abonnés newsletter ({subscribers.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Liste de diffusion des personnes inscrites aux actualités du programme.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-[#1B2A5E] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Exporter les adresses en CSV</span>
          <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Aucun abonné enregistré pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Adresse e-mail</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-[#1B2A5E]">{item.email}</td>
                    <td className="py-3 px-4 text-gray-600">{item.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${item.is_active ? 'bg-[#E7F3EC] text-[#2E7D5B]' : 'bg-gray-100 text-gray-400'}`}>
                        {item.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                          item.is_active
                            ? 'bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {item.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
