import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STYLES } from '@/lib/prompt/styles';
import type { StyleId } from '@/types';

interface Props {
  value: StyleId;
  onChange: (next: StyleId) => void;
}

export function StyleSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="style-select">로고 스타일</Label>
      <Select value={value} onValueChange={(v) => onChange(v as StyleId)}>
        <SelectTrigger id="style-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STYLES.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex flex-col">
                <span className="font-medium">{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.koDescription}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
