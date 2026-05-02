import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PostProcessItem } from './types';

interface PreviewModalProps {
  items: PostProcessItem[];
  initialIndex: number;
  onClose: () => void;
}

export function PreviewModal({ items, initialIndex, onClose }: PreviewModalProps) {
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, items.length - 1)),
  );

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  if (items.length === 0) return null;
  const current = items[index];
  if (!current?.resultUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`이미지 미리보기: ${current.filename}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="이전 이미지"
        disabled={index === 0}
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <img
        src={current.resultUrl}
        alt={current.filename}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-md bg-white shadow-2xl"
      />

      <button
        type="button"
        aria-label="다음 이미지"
        disabled={index >= items.length - 1}
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <p className="absolute bottom-4 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
        {current.filename} ({index + 1} / {items.length})
      </p>
    </div>
  );
}
