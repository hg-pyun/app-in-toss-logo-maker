import { useEffect, useState } from 'react';
import { FormPanel } from '@/components/form/FormPanel';
import { ResultPanel } from '@/components/result/ResultPanel';
import { ToastProvider } from '@/components/ui/toast';
import { useFormState } from '@/hooks/useFormState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function App() {
  const { form, model, setModel, update, reset, fillExample } = useFormState();
  const debounced = useDebouncedValue(form, 150);
  const [activeForm, setActiveForm] = useState(form);

  useEffect(() => {
    setActiveForm(debounced);
  }, [debounced]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8 md:px-6 md:py-10">
          <section className="space-y-6 md:pr-2" aria-label="입력 폼">
            <FormPanel
              form={form}
              update={update}
              onReset={reset}
            />
          </section>
          <section className="md:sticky md:top-6 md:self-start" aria-label="결과 영역">
            <ResultPanel
              form={activeForm}
              model={model}
              onModelChange={setModel}
              onFillExample={fillExample}
            />
          </section>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

function Header() {
  return (
    <header className="border-b bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary" aria-hidden="true" />
          <div>
            <h1 className="text-base font-semibold leading-none">인앱토스 로고 메이커</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              GPT-Image · Gemini Nano Banana 용 영어 프롬프트 생성기
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card/30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground md:px-6">
        <span>Made for in-Toss mini-app makers</span>
        <a
          href="https://github.com/hg-pyun/app-in-toss-logo-maker"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
