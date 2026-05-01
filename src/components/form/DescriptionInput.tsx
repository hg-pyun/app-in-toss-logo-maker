import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function DescriptionInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="app-desc">한 줄 설명</Label>
      <Textarea
        id="app-desc"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: 간단한 수입/지출 기록"
        rows={2}
      />
    </div>
  );
}
