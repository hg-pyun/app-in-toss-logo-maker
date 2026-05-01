import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptCard } from './PromptCard';
import { FillExampleButton } from '@/components/form/FillExampleButton';
import { buildPrompt } from '@/lib/prompt/buildPrompt';
import type { FormState, ModelId } from '@/types';

interface Props {
  form: FormState;
  model: ModelId;
  onModelChange: (next: ModelId) => void;
  onFillExample: () => void;
}

export function ResultPanel({ form, model, onModelChange, onFillExample }: Props) {
  const nameFilled = form.name.trim().length > 0;

  const lightPrompt = useMemo(
    () => (nameFilled ? buildPrompt({ ...form, model, mode: 'light' }) : ''),
    [form, model, nameFilled],
  );
  const darkPrompt = useMemo(
    () => (nameFilled ? buildPrompt({ ...form, model, mode: 'dark' }) : ''),
    [form, model, nameFilled],
  );

  if (!nameFilled) {
    return <EmptyState onFillExample={onFillExample} />;
  }

  const showBoth = form.showBothModes;

  return (
    <div className="space-y-4">
      <Tabs value={model} onValueChange={(v) => onModelChange(v as ModelId)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="gpt-image">GPT-Image</TabsTrigger>
            <TabsTrigger value="nano-banana">Nano Banana</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="gpt-image" className="space-y-4">
          <CardSet
            light={lightPrompt}
            dark={darkPrompt}
            showBoth={showBoth}
            model="gpt-image"
          />
        </TabsContent>
        <TabsContent value="nano-banana" className="space-y-4">
          <CardSet
            light={lightPrompt}
            dark={darkPrompt}
            showBoth={showBoth}
            model="nano-banana"
          />
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        두 모델 모두 보통 1024 이상으로 출력합니다. 600x600은 다운로드 후 직접 리사이즈해 주세요.
      </p>
    </div>
  );
}

function CardSet({
  light,
  dark,
  showBoth,
  model,
}: {
  light: string;
  dark: string;
  showBoth: boolean;
  model: ModelId;
}) {
  if (showBoth) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <PromptCard prompt={light} mode="light" model={model} showModeHeader />
        <PromptCard prompt={dark} mode="dark" model={model} showModeHeader />
      </div>
    );
  }
  return (
    <div className="max-w-[640px]">
      <PromptCard prompt={light} mode="light" model={model} showModeHeader={false} />
    </div>
  );
}

function EmptyState({ onFillExample }: { onFillExample: () => void }) {
  return (
    <div className="space-y-4">
      <article className="flex flex-col overflow-hidden rounded-lg border border-dashed bg-card/50">
        <pre className="m-0 whitespace-pre-wrap break-words px-4 py-4 font-mono text-[12.5px] leading-relaxed text-muted-foreground">{`Create a square 1:1 mini-app icon, designed for 600x600 export.
Subject: 가계부 미니앱, 간단한 수입/지출 기록
Keywords: clean, trustworthy, warm
Style: Flat Geometric — clean geometric shapes, vector-friendly, ...
Composition: a single centered symbol filling 70% of the canvas, ...
Background: bright, soft, off-white-leaning composition with gentle depth.
Palette: built around Mint (#00C2A8), with harmonious supporting tones ...
Mood: clean, trustworthy, warm, modern, friendly, ...
Constraints: no text, no letters, no numbers, ...
Output: 1:1 square, opaque background, ready for 600x600 export.`}</pre>
      </article>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">앱 이름을 입력하면 프롬프트가 만들어집니다.</p>
        <div className="w-full max-w-xs">
          <FillExampleButton onClick={onFillExample} />
        </div>
      </div>
    </div>
  );
}
