import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  subject: string;
  message: string;
  newsletter_optin: boolean;
  status: 'nouveau' | 'traite' | 'archive';
  internal_note?: string;
  created_at: string;
}

export const ContactMessagesAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRecord | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [msgStatus, setMsgStatus] = useState<string>('nouveau');
  const [updating, setUpdating] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/admin/contact-messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => addToast('Erreur de chargement des messages', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const handleOpenDetail = (item: ContactMessageRecord) => {
    setSelectedMessage(item);
    setInternalNote(item.internal_note || '');
    setMsgStatus(item.status || 'nouveau');
  };

  const handleUpdate = async () => {
    if (!selectedMessage) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${selectedMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: msgStatus,
          internal_note: internalNote,
        }),
      });

      if (!res.ok) throw new Error();
      addToast('Message mis à jour.', 'success');
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: msgStatus as any, internal_note: internalNote } : m))
      );
      setSelectedMessage(null);
    } catch {
      addToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/admin/contact-messages/export`;
  };

  const filtered = messages.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase()) && !m.subject.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Messages de contact ({messages.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Courriels reçus via le formulaire public de contact.
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

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email ou sujet..."
          className="text-xs px-3 py-1.5 border border-gray-300 rounded flex-1 min-w-[200px] outline-none focus:border-[#E6B325]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded outline-none bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="nouveau">Nouveau</option>
          <option value="traite">Traité</option>
          <option value="archive">Archivé</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Chargement des messages...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">Aucun message trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F5] border-b text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Expéditeur</th>
                  <th className="py-3 px-4">Objet</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <strong className="text-[#1B2A5E] block">{item.name}</strong>
                      <span className="text-gray-500 text-[11px]">{item.email}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{item.subject}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{item.message}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.status === 'nouveau'
                          ? 'bg-[#E8F0F8] text-[#2E6DA4]'
                          : item.status === 'traite'
                          ? 'bg-[#E7F3EC] text-[#2E7D5B]'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FDF6E3] hover:text-[#1B2A5E] rounded font-semibold text-[11px]"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Message de contact
                </span>
                <h3 className="text-lg font-bold text-[#1B2A5E]">
                  {selectedMessage.subject}
                </h3>
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="px-3 py-1.5 bg-[#E6B325] text-[#1B2A5E] rounded text-xs font-bold hover:bg-[#d4a21d]"
              >
                Répondre par e-mail
              </a>
            </div>

            <div className="bg-[#F7F7F5] p-3.5 rounded-lg text-xs space-y-1">
              <p><strong>De :</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
              {selectedMessage.phone && <p><strong>Téléphone :</strong> {selectedMessage.phone}</p>}
              {selectedMessage.country && <p><strong>Pays :</strong> {selectedMessage.country}</p>}
              <p><strong>Date :</strong> {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1B2A5E] uppercase tracking-wider block mb-1">
                Contenu du message :
              </span>
              <div className="text-xs text-[#1A1A1A] leading-relaxed bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Statut du message
                </label>
                <select
                  value={msgStatus}
                  onChange={(e) => setMsgStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded bg-white"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="traite">Traité / Répondu</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
                  Note interne d'équipe
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ex. Répondu par email le 15/10 par l'équipe..."
                  className="w-full text-xs px-3 py-2 border rounded outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 border rounded text-xs font-semibold text-gray-700"
              >
                Fermer
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdate}
                className="px-5 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45]"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
