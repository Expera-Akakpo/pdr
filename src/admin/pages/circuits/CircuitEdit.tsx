import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { SimpleEditor } from '../../components/SimpleEditor.tsx';
import { MediaUploader, MediaItem } from '../../components/MediaUploader.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { ADMIN_BASE_PATH } from '../../config';

export const CircuitEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    region: 'sud',
    city: '',
    duration: '1 journée',
    description: '',
    full_description: '',
    highlights: ['Visite guidée'],
    cover_image: '',
    gallery: [] as MediaItem[],
    display_order: 1,
    published: true,
  });

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: isNew && (!prev.slug || prev.slug === autoSlug.slice(0, -1)) ? autoSlug : prev.slug,
    }));
  };

  useEffect(() => {
    if (!isNew && id) {
      fetch(`/api/admin/circuits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setFormData({
              title: data.title || '',
              slug: data.slug || '',
              region: data.region || 'sud',
              city: data.city || '',
              duration: data.duration || '1 journée',
              description: data.description || '',
              full_description: data.full_description || '',
              highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : [''],
              cover_image: data.cover_image || '',
              gallery: Array.isArray(data.gallery) ? data.gallery.map((g: any) => typeof g === 'string' ? { url: g } : g) : [],
              display_order: data.display_order || 1,
              published: data.published !== false,
            });
          }
        })
        .catch(() => addToast('Erreur de chargement', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.city) {
      addToast('Le titre et la ville sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      highlights: formData.highlights.filter((h) => h.trim().length > 0),
      gallery: formData.gallery.map((g) => g.url),
    };

    const url = isNew ? '/api/admin/circuits' : `/api/admin/circuits/${id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addToast(isNew ? 'Circuit créé avec succès.' : 'Circuit mis à jour.', 'success');
      navigate(`${ADMIN_BASE_PATH}/circuits`);
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/admin/circuits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Circuit supprimé.', 'success');
        navigate(`${ADMIN_BASE_PATH}/circuits`);
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-500">Chargement du circuit...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Link
            to={`${ADMIN_BASE_PATH}/circuits`}
            className="text-xs text-[#1B2A5E] hover:underline font-semibold block mb-1"
          >
            ← Retour aux circuits
          </Link>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            {isNew ? 'Nouveau circuit touristique' : `Modifier : ${formData.title}`}
          </h2>
        </div>

        {!isNew && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1.5 rounded text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100"
          >
            Supprimer
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Titre du circuit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex. Ganvié — La cité lacustre"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Slug URL
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="ganvie-cite-lacustre"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Région <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none bg-white"
            >
              <option value="sud">Sud (Littoral/Atlantique/Ouémé)</option>
              <option value="centre">Centre (Zou/Collines)</option>
              <option value="nord">Nord</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Ville / Lieu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ex. Ganvié (Lac Nokoué)"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Durée indicative
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex. 1 journée, 2 jours..."
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Ordre d'affichage
            </label>
            <input
              type="number"
              min="0"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Description courte
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Courte description de présentation pour les cartes..."
            className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
          />
        </div>

        <div>
          <SimpleEditor
            label="Description patrimoniale et culturelle complète"
            value={formData.full_description}
            onChange={(val) => setFormData({ ...formData, full_description: val })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider">
              Points forts du circuit
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, ''] })}
              className="text-xs text-[#1B2A5E] font-semibold hover:underline"
            >
              + Ajouter un point fort
            </button>
          </div>
          <div className="space-y-2">
            {formData.highlights.map((h, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const next = [...formData.highlights];
                    next[idx] = e.target.value;
                    setFormData({ ...formData, highlights: next });
                  }}
                  placeholder="Ex. Traversée en pirogue traditionnelle..."
                  className="flex-1 text-xs px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = [...formData.highlights];
                    next.splice(idx, 1);
                    setFormData({ ...formData, highlights: next });
                  }}
                  className="text-xs text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <MediaUploader
          label="Photo principale du circuit (16/9)"
          value={formData.cover_image}
          onChange={(url) => setFormData({ ...formData, cover_image: url })}
          allowGallery={true}
          galleryValue={formData.gallery}
          onGalleryChange={(gallery) => setFormData({ ...formData, gallery })}
        />

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-[#1A1A1A]">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded text-[#1B2A5E] focus:ring-[#E6B325]"
            />
            <span>Publier sur la page des circuits touristiques</span>
          </label>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(`${ADMIN_BASE_PATH}/circuits`)}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#1B2A5E] text-white rounded text-xs font-bold hover:bg-[#131F45] disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Supprimer le circuit"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce circuit ?"
        itemName={formData.title}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
