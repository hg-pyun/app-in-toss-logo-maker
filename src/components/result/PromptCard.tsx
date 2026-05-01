import { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { OpenInButton } from './OpenInButton';
import type { ModeId, ModelId } from '@/types';

interface Props {
  prompt: string;
  mode: ModeId;
  model: ModelId;
  /** 토글 OFF 상태에서는 헤더/모드 라벨을 숨긴다. */
  showModeHeader: boolean;
}

const MODEL_LABEL: Record<ModelId, string> = {
  'gpt-image': 'GPT-Image',
  'nano-banana': 'Nano Banana',
};

const MODE_LABEL_KO: Record<ModeId, string> = {
  light: '라이트 모드',
  dark: '다크 모드',
};

export function PromptCard({ prompt, mode, model, showModeHeader }: Props) {
  const bodyRef = useRef<HTMLPreElement>(null);

  const toastLabel = showModeHeader
    ? `${MODEL_LABEL[model]}용 ${MODE_LABEL_KO[mode]} 프롬프트`
    : `${MODEL_LABEL[model]} 프롬프트`;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      {showModeHeader && (
        <header className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            {mode === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
          </div>
        </header>
      )}
      <pre
        ref={bodyRef}
        className="m-0 flex-1 whitespace-pre-wrap break-words bg-card px-4 py-4 font-mono text-[12.5px] leading-relaxed text-foreground"
      >
        {prompt}
      </pre>
      <footer className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
        <CopyButton prompt={prompt} toastLabel={toastLabel} fallbackTarget={bodyRef.current} />
        <OpenInButton prompt={prompt} model={model} />
      </footer>
    </article>
  );
}
