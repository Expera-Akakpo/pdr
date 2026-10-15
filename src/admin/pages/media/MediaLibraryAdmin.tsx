import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';

interface MediaRecord {
  id: string;
  filename: string;
  original_name?: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url?: string;
  uploader_name?: string;
  created_at: string;
}

export const MediaLibraryAdmin: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaRecord | null>(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch('/api/admin/media', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMediaList(data);
      })
      .catch(() => addToast('Erreur de chargement des médias', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 50 * 1024 * 1024) {
      addToast('Fichier trop volumineux (max 50 Mo).', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast('Média ajouté avec succès à la bibliothèque.', 'success');
      fetchMedia();
    } catch (err: any) {
      addToast(err.message || 'Erreur lors du téléversement.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/media/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Fichier supprimé de la médiathèque.', 'success');
        setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    addToast('URL copiée dans le presse-papier !', 'info');
  };

  const filtered = mediaList.filter((m) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      m.filename.toLowerCase().includes(term) ||
      (m.original_name && m.original_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            Médiathèque ({mediaList.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Photographies, documents et médias réutilisables dans les différents modules.
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2 rounded text-xs font-bold bg-[#1B2A5E] text-white hover:bg-[#131F45] transition-colors self-start sm:self-auto flex items-center space-x-2">
          <span>{uploading ? 'Envoi...' : '+ Téléverser un fichier'}</span>
          <input
            type="file"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer les médias par nom..."
          className="text-xs px-3 py-1.5 border border-gray-300 rounded w-full sm:w-80 outline-none focus:border-[#E6B325]"
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Chargement de la médiathèque...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border text-xs text-gray-400">
          Aucun média trouvé. Téléversez votre premier fichier ci-dessus.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-2xs flex flex-col justify-between group">
              <div className="aspect-square w-full rounded overflow-hidden bg-gray-50 flex items-center justify-center mb-2 relative">
                {item.mime_type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.original_name || item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl text-gray-400 font-bold uppercase">
                    {item.mime_type.split('/')[1] || 'DOC'}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#1A1A1A] truncate" title={item.original_name || item.filename}>
                  {item.original_name || item.filename}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {(item.size_bytes / 1024).toFixed(0)} Ko
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => copyUrl(item.url)}
                  className="text-[#1B2A5E] font-semibold hover:underline"
                >
                  Copier l'URL
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le fichier"
        message="Êtes-vous certain de vouloir supprimer ce fichier de la médiathèque ?"
        itemName={deleteTarget?.original_name || deleteTarget?.filename}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
