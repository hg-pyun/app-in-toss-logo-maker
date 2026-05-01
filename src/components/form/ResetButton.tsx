import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  disabled: boolean;
  onConfirm: () => void;
}

export function ResetButton({ disabled, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} className="text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          초기화
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <p className="text-sm">
          입력한 내용과 저장된 상태를 모두 비워요.
          <br />
          정말 초기화할까요?
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            초기화
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
