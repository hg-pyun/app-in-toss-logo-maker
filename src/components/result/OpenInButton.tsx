import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/clipboard';
import { useToast } from '@/components/ui/toast';
import type { ModelId } from '@/types';

interface Props {
  prompt: string;
  model: ModelId;
}

export function OpenInButton({ prompt, model }: Props) {
  const { showToast } = useToast();

  const onClick = async () => {
    // 1) 먼저 클립보드 복사 (사용자 제스처 컨텍스트)
    await copyToClipboard(prompt);

    // 2) 새 탭 열기
    const url =
      model === 'gpt-image'
        ? `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
        : 'https://gemini.google.com/app';
    window.open(url, '_blank', 'noopener,noreferrer');

    // 3) 안내 토스트
    if (model === 'gpt-image') {
      showToast('ChatGPT 탭이 열렸어요. 자동으로 입력되지 않으면 ⌘V로 붙여넣으세요.');
    } else {
      showToast('Gemini 탭이 열렸어요. 프롬프트가 클립보드에 있으니 ⌘V로 붙여넣으세요.');
    }
  };

  return (
    <Button type="button" variant="outline" onClick={onClick}>
      <ExternalLink className="h-4 w-4" />
      {model === 'gpt-image' ? 'Open in ChatGPT' : 'Open in Gemini'}
    </Button>
  );
}
