import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  values: string[];
  onChange: (next: string[]) => void;
}

const MAX = 5;

function normalize(input: string): string {
  return input.trim();
}

export function KeywordChips({ values, onChange }: Props) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const tokens = raw
      .split(',')
      .map(normalize)
      .filter(Boolean);
    if (tokens.length === 0) return;
    const lower = new Set(values.map((v) => v.toLowerCase()));
    const merged = [...values];
    for (const t of tokens) {
      if (merged.length >= MAX) break;
      const k = t.toLowerCase();
      if (lower.has(k)) continue;
      merged.push(t);
      lower.add(k);
    }
    onChange(merged);
    setDraft('');
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      e.preventDefault();
      remove(values.length - 1);
    }
  };

  const atMax = values.length >= MAX;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor="kw-input">키워드</Label>
        <span className="text-xs text-muted-foreground">{values.length} / {MAX}</span>
      </div>
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        role="list"
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            role="listitem"
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            {v}
            <button
              type="button"
              aria-label={`키워드 삭제: ${v}`}
              onClick={() => remove(i)}
              className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          id="kw-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && commit(draft)}
          placeholder={atMax ? '최대 5개까지 입력 가능' : '예: clean, trustworthy, warm'}
          disabled={atMax}
          className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent p-0 px-1 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        영문 권장 (예: clean, trustworthy, warm). 한글 입력도 가능하지만 모델 해석이 불안정할 수 있어요.
      </p>
    </div>
  );
}
