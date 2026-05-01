import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function AppNameInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="app-name">
        앱 이름 <span className="text-destructive">*</span>
      </Label>
      <Input
        id="app-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: 가계부 미니앱"
        autoComplete="off"
        required
      />
    </div>
  );
}
