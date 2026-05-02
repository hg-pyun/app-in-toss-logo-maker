import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type AppTabValue = 'prompt' | 'postprocess';

interface AppTabsProps {
  value: AppTabValue;
  onValueChange: (value: AppTabValue) => void;
  children: ReactNode;
}

export function AppTabs({ value, onValueChange, children }: AppTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as AppTabValue)}
      className="w-full"
    >
      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="prompt"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              프롬프트 생성
            </TabsTrigger>
            <TabsTrigger
              value="postprocess"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              이미지 후처리
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      {children}
    </Tabs>
  );
}
