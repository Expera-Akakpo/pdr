import React, { useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Rédigez la description détaillée...',
  minHeight = '180px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef<boolean>(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt('Entrez l\'URL du lien (ex: https://...) :');
    if (url) {
      exec('createLink', url);
    }
  };

  const formatBlock = (tag: string) => {
    exec('formatBlock', tag);
  };

  return (
    <div className="space-y-1 text-left">
      {label && (
        <label className="block text-xs font-bold text-[#1B2A5E] uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      <div className="border border-[#E5E7EB] rounded-md overflow-hidden bg-white focus-within:border-[#E6B325] focus-within:ring-1 focus-within:ring-[#E6B325]">
        {/* Toolbar sobre */}
        <div className="bg-[#F7F7F5] border-b border-[#E5E7EB] px-3 py-1.5 flex flex-wrap items-center gap-1 text-xs text-[#1B2A5E]">
          <button
            type="button"
            onClick={() => exec('bold')}
            className="p-1 px-2 font-bold hover:bg-white rounded"
            title="Gras"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="p-1 px-2 italic font-serif hover:bg-white rounded"
            title="Italique"
          >
            I
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => formatBlock('<h2>')}
            className="p-1 px-2 font-bold hover:bg-white rounded"
            title="Titre de niveau 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => formatBlock('<h3>')}
            className="p-1 px-2 font-bold hover:bg-white rounded"
            title="Titre de niveau 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => formatBlock('<p>')}
            className="p-1 px-2 hover:bg-white rounded"
            title="Paragraphe normal"
          >
            Texte
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="p-1 px-2 hover:bg-white rounded"
            title="Liste à puces"
          >
            • Liste
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="p-1 px-2 hover:bg-white rounded"
            title="Liste numérotée"
          >
            1. Liste
          </button>
          <button
            type="button"
            onClick={() => formatBlock('<blockquote>')}
            className="p-1 px-2 hover:bg-white rounded font-serif italic"
            title="Citation"
          >
            “ Citation
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleLink}
            className="p-1 px-2 hover:bg-white rounded underline"
            title="Insérer un lien"
          >
            Lien
          </button>
        </div>

        {/* Zone éditable */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="p-3.5 text-sm text-[#1A1A1A] leading-relaxed outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        />
      </div>
      <p className="text-[11px] text-gray-500">
        Mise en forme sobre : gras, italique, titres H2/H3, listes et citations.
      </p>
    </div>
  );
};
