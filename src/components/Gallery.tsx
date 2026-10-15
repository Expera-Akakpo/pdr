import React, { useState, useEffect } from 'react';

export interface GalleryImage {
  url: string;
  caption?: string;
  title?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ images, columns = 3, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  return (
    <div className={className}>
      <div className={`grid ${colClasses} gap-4 sm:gap-6`}>
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImage(img)}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer border border-[#E5E7EB] shadow-xs hover:shadow-md transition-shadow duration-150"
          >
            <img
              src={img.url}
              alt={img.caption || `Photo ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            {/* Overlay discret au survol */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
              <p className="text-white text-xs font-medium line-clamp-2">
                {img.caption || 'Cliquer pour agrandir'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox simple au clic */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Bouton fermeture */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:-right-12 text-white hover:text-[#E6B325] p-2 focus:outline-none"
              aria-label="Fermer l'aperçu de l'image"
            >
              <svg className="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image agrandie */}
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Aperçu'}
              className="max-h-[75vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
            />

            {/* Légende */}
            {selectedImage.caption && (
              <div className="mt-4 text-center text-white text-sm bg-black/60 px-4 py-2 rounded-md max-w-xl">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
