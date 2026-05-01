import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClick: () => void;
}

export function FillExampleButton({ onClick }: Props) {
  return (
    <Button type="button" variant="secondary" onClick={onClick} className="w-full">
      <Sparkles className="h-4 w-4" />
      예시로 채우기
    </Button>
  );
}
