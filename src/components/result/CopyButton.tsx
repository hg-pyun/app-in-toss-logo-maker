import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard, selectNodeContents } from '@/lib/clipboard';
import { useToast } from '@/components/ui/toast';

interface Props {
  prompt: string;
  /** 토스트에 표시할 컨텍스트 라벨. 예: `GPT-Image용 라이트 모드 프롬프트` 또는 `GPT-Image 프롬프트` */
  toastLabel: string;
  /** 클립보드 fallback 시 select 대상이 되는 노드 (PromptCard 본문) */
  fallbackTarget?: HTMLElement | null;
}

export function CopyButton({ prompt, toastLabel, fallbackTarget }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    };
  }, []);

  const onCopy = async () => {
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopied(true);
      if (timer.current != null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
      showToast(`${toastLabel}이 복사되었어요`);
    } else {
      if (fallbackTarget) selectNodeContents(fallbackTarget);
      showToast('자동 복사가 막혔어요. 텍스트가 선택돼 있으니 ⌘C로 복사하세요.', { variant: 'warn', durationMs: 5000 });
    }
  };

  return (
    <Button type="button" onClick={onCopy} aria-live="polite">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? '복사됨 ✓' : '복사'}
    </Button>
  );
}
