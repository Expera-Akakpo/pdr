import React, { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200">
        <h3 className="text-lg font-bold text-[#1B2A5E] mb-2">
          {title}
        </h3>

        <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">
          {message}
        </p>

        {itemName && (
          <div className="bg-[#F7F7F5] border border-gray-200 px-3 py-2 rounded text-xs font-semibold text-[#1A1A1A] mb-5 break-words">
            « {itemName} »
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-[#4A4A4A] hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-xs font-bold text-white transition-colors ${
              isDestructive
                ? 'bg-[#991B1B] hover:bg-[#7F1D1D]'
                : 'bg-[#1B2A5E] hover:bg-[#131F45]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
