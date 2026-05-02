import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { loadJSON, removeKey, saveJSON } from '@/lib/storage';

const STORAGE_KEY = 'postprocess.dismissNotice';

export function SynthIdNotice() {
  const [dismissed, setDismissed] = useState<boolean>(() =>
    loadJSON<boolean>(STORAGE_KEY, false),
  );

  function dismiss() {
    setDismissed(true);
    saveJSON(STORAGE_KEY, true);
  }

  function reopen() {
    setDismissed(false);
    removeKey(STORAGE_KEY);
  }

  if (dismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={reopen}
          aria-label="안내 다시 보기"
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="h-3.5 w-3.5" />
          안내 다시 보기
        </button>
      </div>
    );
  }

  return (
    <section
      role="region"
      aria-label="이미지 후처리 안내"
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <div className="flex-1 text-sm leading-relaxed">
          <h3 className="font-medium text-slate-900">
            이 도구는 가시 워터마크 영역만 처리합니다
          </h3>
          <ul className="mt-2 space-y-1 text-xs">
            <li>
              Gemini가 함께 삽입하는 보이지 않는 SynthID 워터마크는 제거되지 않으며, 결과물이 AI 생성 이미지라는 사실은 변하지 않습니다.
            </li>
            <li>본인이 소유하거나 사용 권한이 있는 이미지에만 사용하세요.</li>
            <li>각 모델의 이용약관과 결과물 정책을 따르는 책임은 사용자에게 있습니다.</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="안내 닫기"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
