import { Label } from '@/components/ui/label';
import { PALETTES } from '@/lib/prompt/palettes';
import { cn } from '@/lib/utils';
import type { PaletteId } from '@/types';

interface Props {
  value: PaletteId | null;
  onChange: (next: PaletteId | null) => void;
}

export function PalettePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>브랜드 컬러 팔레트</Label>
      <div role="radiogroup" aria-label="브랜드 컬러 팔레트" className="grid grid-cols-4 gap-2">
        {PALETTES.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${p.label} ${p.hex}`}
              onClick={() => onChange(selected ? null : p.id)}
              className={cn(
                'group flex flex-col items-center gap-1.5 rounded-md border p-2 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected ? 'border-primary ring-2 ring-primary/30' : 'border-input hover:border-foreground/30',
              )}
            >
              <span
                className="h-7 w-7 rounded-md border border-black/5 shadow-sm"
                style={{ backgroundColor: p.hex }}
                aria-hidden="true"
              />
              <span className="leading-tight">{p.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {value ? '한 번 더 누르면 선택을 해제해요.' : '미선택 시 AI가 스타일에 맞춰 결정합니다.'}
      </p>
    </div>
  );
}
