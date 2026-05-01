import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
  value: boolean;
  onChange: (next: boolean) => void;
}

export function DarkModeToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-input bg-card p-3">
      <div className="space-y-0.5">
        <Label htmlFor="dark-toggle" className="text-sm">다크 / 라이트 동시 노출</Label>
        <p className="text-xs text-muted-foreground">
          켜면 라이트·다크 두 프롬프트 카드를 함께 보여줍니다.
        </p>
      </div>
      <Switch
        id="dark-toggle"
        checked={value}
        onCheckedChange={onChange}
        aria-label="다크 모드 동시 노출 토글"
      />
    </div>
  );
}
