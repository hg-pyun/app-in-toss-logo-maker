import { ResultCard } from './ResultCard';
import type { PostProcessItem } from './types';

interface ResultGridProps {
  items: PostProcessItem[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onPreview: (id: string) => void;
}

export function ResultGrid({ items, onRemove, onRetry, onPreview }: ResultGridProps) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <ResultCard
          key={item.id}
          item={item}
          onRemove={() => onRemove(item.id)}
          onRetry={() => onRetry(item.id)}
          onPreview={() => onPreview(item.id)}
        />
      ))}
    </div>
  );
}
