import React, { useEffect } from 'react';

const PosterModal = ({ src, title, open, onClose }: { src: string; title?: string; open: boolean; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative max-w-5xl w-full h-full md:h-auto bg-transparent">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-60 rounded bg-black/50 text-white px-3 py-1 text-sm"
          aria-label="Close poster"
        >
          Close
        </button>

        <div className="flex items-center justify-center">
          <img src={src} alt={title || 'Poster'} className="max-h-[80vh] w-auto object-contain rounded shadow-lg" />
        </div>

        <div className="mt-3 flex justify-center gap-3">
          <a href={src} download className="rounded bg-white/10 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
            Download Poster
          </a>
          <a href={src} target="_blank" rel="noreferrer" className="rounded bg-white/10 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5">
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default PosterModal;
