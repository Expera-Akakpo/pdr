import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

export interface MediaItem {
  id?: string;
  url: string;
  caption?: string;
  role?: 'couverture' | 'galerie' | 'video' | 'document';
  originalName?: string;
}

interface MediaUploaderProps {
  label?: string;
  value: string; // single URL (for cover)
  onChange: (url: string) => void;
  galleryValue?: MediaItem[];
  onGalleryChange?: (items: MediaItem[]) => void;
  allowGallery?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label = 'Image de couverture',
  value,
  onChange,
  galleryValue = [],
  onGalleryChange,
  allowGallery = false,
}) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File, isGallery: boolean = false) => {
    if (file.size > 50 * 1024 * 1024) {
      addToast('Le fichier dépasse la taille maximale autorisée de 50 Mo.', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      if (isGallery && onGalleryChange) {
        onGalleryChange([
          ...galleryValue,
          {
            url: data.url,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            role: 'galerie',
            originalName: file.name,
          },
        ]);
        addToast('Fichier ajouté à la galerie.', 'success');
      } else {
        onChange(data.url);
        addToast('Image de couverture enregistrée.', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Échec de l\'envoi du fichier.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], false);
    }
  };

  const removeGalleryItem = (index: number) => {
    if (!onGalleryChange) return;
    const next = [...galleryValue];
    next.splice(index, 1);
    onGalleryChange(next);
  };

  const updateCaption = (index: number, caption: string) => {
    if (!onGalleryChange) return;
    const next = [...galleryValue];
    next[index] = { ...next[index], caption };
    onGalleryChange(next);
  };

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
          {label}
        </label>

        {/* Prévisualisation de l'image principale */}
        {value ? (
          <div className="relative border border-[#E5E7EB] rounded-lg p-3 bg-white flex items-center space-x-4">
            <img
              src={value}
              alt="Aperçu"
              className="w-20 h-20 object-cover rounded-md border"
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border rounded focus:border-[#E6B325] outline-none"
                placeholder="URL de l'image..."
              />
              <span className="text-[11px] text-gray-400 mt-1 block truncate">
                {value}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-xs text-red-600 hover:bg-red-50 rounded"
              title="Supprimer cette image"
            >
              ✕ Retirer
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-[#E6B325] bg-[#FDF6E3]' : 'border-gray-300 bg-[#F7F7F5]'
            }`}
          >
            <div className="space-y-2">
              <p className="text-xs text-[#4A4A4A]">
                Glissez-déposez un fichier ici ou
              </p>
              <label className="inline-block cursor-pointer px-4 py-2 bg-white border border-[#1B2A5E] text-[#1B2A5E] text-xs font-bold rounded hover:bg-[#1B2A5E] hover:text-white transition-colors">
                {uploading ? 'Téléversement...' : 'Parcourir les fichiers'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], false);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-gray-500">
                Formats acceptés : JPG, PNG, WEBP (Max 50 Mo)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Galerie optionnelle */}
      {allowGallery && onGalleryChange && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#1B2A5E] uppercase tracking-wider">
              Galerie photos ({galleryValue.length})
            </span>
            <label className="cursor-pointer text-xs font-semibold text-[#1B2A5E] hover:text-[#E6B325] underline">
              + Ajouter une photo à la galerie
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((f) => handleFileUpload(f, true));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {galleryValue.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {galleryValue.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 border p-2 rounded bg-white">
                  <img src={item.url} alt="" className="w-12 h-12 object-cover rounded" />
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => updateCaption(idx, e.target.value)}
                    placeholder="Légende..."
                    className="flex-1 text-xs px-2 py-1 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    className="text-xs text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
