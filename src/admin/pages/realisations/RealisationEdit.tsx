import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { SimpleEditor } from '../../components/SimpleEditor.tsx';
import { MediaUploader, MediaItem } from '../../components/MediaUploader.tsx';
import { ConfirmModal } from '../../components/ConfirmModal.tsx';
import { ADMIN_BASE_PATH } from '../../config.ts';

export const RealisationEdit: React.FC = () => {
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
    edition: 'Édition 2026',
    status: 'termine',
    date: new Date().toISOString().split('T')[0],
    description: '',
    full_description: '',
    highlights: ['Immersion en famille d\'accueil'],
    participants_count: 1,
    zones: ['Abomey-Calavi'],
    cover_image: '',
    gallery: [] as MediaItem[],
    published: true,
  });

  // Slug auto-generation
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
      fetch(`/api/admin/realisations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setFormData({
              title: data.title || '',
              slug: data.slug || '',
              edition: data.edition || 'Édition 2025',
              status: data.status || 'termine',
              date: data.date ? data.date.split('T')[0] : '',
              description: data.description || '',
              full_description: data.full_description || '',
              highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : [''],
              participants_count: data.participants_count || 1,
              zones: Array.isArray(data.zones) ? data.zones : ['Abomey-Calavi'],
              cover_image: data.cover_image || '',
              gallery: Array.isArray(data.gallery) ? data.gallery : [],
              published: data.published !== false,
            });
          }
        })
        .catch(() => addToast('Erreur de chargement', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew, token]);

  const handleSubmit = async (e: React.FormEvent, forcePublish?: boolean) => {
    e.preventDefault();
    if (!formData.title) {
      addToast('Le titre est requis.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      published: forcePublish !== undefined ? forcePublish : formData.published,
      highlights: formData.highlights.filter((h) => h.trim().length > 0),
    };

    const url = isNew ? '/api/admin/realisations' : `/api/admin/realisations/${id}`;
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

      addToast(isNew ? 'Réalisation créée avec succès.' : 'Modifications enregistrées.', 'success');
      navigate(`${ADMIN_BASE_PATH}/realisations`);
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    try {
      const res = await fetch(`/api/admin/realisations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Réalisation supprimée.', 'success');
        navigate(`${ADMIN_BASE_PATH}/realisations`);
      }
    } catch {
      addToast('Erreur lors de la suppression.', 'error');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-500">Chargement de la réalisation...</div>;
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <Link
            to={`${ADMIN_BASE_PATH}/realisations`}
            className="text-xs text-[#1B2A5E] hover:underline font-semibold block mb-1"
          >
            ← Retour à la liste
          </Link>
          <h2 className="text-xl font-bold text-[#1B2A5E]">
            {isNew ? 'Nouvelle réalisation' : `Modifier : ${formData.title}`}
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

      <form onSubmit={(e) => handleSubmit(e)} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Titre & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Titre de la session / réalisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex. Première édition du programme — 2025"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Identifiant URL (Slug)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="premiere-edition-2025"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Édition, Statut, Date, Participants */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Édition
            </label>
            <input
              type="text"
              value={formData.edition}
              onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
              placeholder="Édition 2025"
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none bg-white"
            >
              <option value="termine">Terminé</option>
              <option value="en-cours">En cours</option>
              <option value="a-venir">À venir</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Date de session
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
              Participants
            </label>
            <input
              type="number"
              min="1"
              value={formData.participants_count}
              onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value, 10) || 1 })}
              className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
            />
          </div>
        </div>

        {/* Description courte */}
        <div>
          <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
            Description courte (résumé d'accroche)
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Court résumé de 2 à 3 phrases..."
            className="w-full text-sm px-3 py-2 border rounded focus:border-[#E6B325] outline-none"
          />
        </div>

        {/* Description complète (SimpleEditor) */}
        <div>
          <SimpleEditor
            label="Description détaillée & Récit d'immersion"
            value={formData.full_description}
            onChange={(val) => setFormData({ ...formData, full_description: val })}
          />
        </div>

        {/* Points forts répétables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider">
              Points forts & Acquis
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
                  placeholder="Ex. Visite guidée des Palais Royaux d'Abomey..."
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

        {/* Media Uploader (Couverture + Galerie) */}
        <MediaUploader
          label="Photo de couverture (16/9 recommandée)"
          value={formData.cover_image}
          onChange={(url) => setFormData({ ...formData, cover_image: url })}
          allowGallery={true}
          galleryValue={formData.gallery}
          onGalleryChange={(gallery) => setFormData({ ...formData, gallery })}
        />

        {/* Publier / Brouillon */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-[#1A1A1A]">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded text-[#1B2A5E] focus:ring-[#E6B325]"
            />
            <span>Publier immédiatement sur le site public</span>
          </label>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(`${ADMIN_BASE_PATH}/realisations`)}
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
        title="Supprimer la réalisation"
        message="Êtes-vous sûr de vouloir supprimer définitivement cette réalisation ?"
        itemName={formData.title}
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
