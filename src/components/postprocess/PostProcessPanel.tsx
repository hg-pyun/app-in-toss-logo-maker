import { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { ResultGrid } from './ResultGrid';
import { DownloadBar } from './DownloadBar';
import { SynthIdNotice } from './SynthIdNotice';
import { PreviewModal } from './PreviewModal';
import { MAX_FILES } from '@/lib/image/constants';
import { REJECTION_MESSAGES } from '@/lib/image/validateFile';
import { useToast } from '@/components/ui/toast';
import { usePostProcessQueue } from '@/hooks/usePostProcessQueue';

export function PostProcessPanel() {
  const { showToast } = useToast();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const onTooMany = useCallback(() => {
    showToast(REJECTION_MESSAGES['too-many'], { variant: 'warn' });
  }, [showToast]);

  const onBatchStart = useCallback(
    (count: number) => {
      if (count > 0) showToast(`${count}개 이미지 처리를 시작했어요.`);
    },
    [showToast],
  );

  const onBatchComplete = useCallback(
    (success: number, failed: number) => {
      if (success === 0 && failed === 0) return;
      if (failed === 0) {
        showToast(`${success}개 완료했어요.`);
      } else if (success === 0) {
        showToast(`${failed}개 실패했어요.`, { variant: 'warn' });
      } else {
        showToast(`${success}개 완료, ${failed}개 실패했어요.`, { variant: 'warn' });
      }
    },
    [showToast],
  );

  const queue = usePostProcessQueue({ onTooMany, onBatchStart, onBatchComplete });

  const completed = queue.items.filter((it) => it.status === 'done' && it.resultUrl);
  const previewIndex = previewId
    ? completed.findIndex((it) => it.id === previewId)
    : -1;

  const handlePreview = useCallback(
    (id: string) => {
      const target = queue.items.find((it) => it.id === id);
      if (target?.status === 'done' && target.resultUrl) setPreviewId(id);
    },
    [queue.items],
  );

  const atMaxCapacity = queue.items.length >= MAX_FILES;

  return (
    <div className="space-y-4">
      <SynthIdNotice />
      <DropZone onFiles={queue.addFiles} disabled={atMaxCapacity} />
      <ResultGrid
        items={queue.items}
        onRemove={queue.removeItem}
        onRetry={queue.retryItem}
        onPreview={handlePreview}
      />
      <DownloadBar
        items={queue.items}
        onClearAll={queue.clearAll}
        onDownloaded={() => showToast('다운로드를 시작했어요.')}
      />
      {previewIndex >= 0 && (
        <PreviewModal
          items={completed}
          initialIndex={previewIndex}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}
