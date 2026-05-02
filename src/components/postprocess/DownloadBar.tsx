import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { filename as buildFilename } from '@/lib/image/filename';
import { buildZip, timestampForFilename, triggerBlobDownload } from '@/lib/zip';
import type { PostProcessItem } from './types';

interface DownloadBarProps {
  items: PostProcessItem[];
  onClearAll: () => void;
  onDownloaded: () => void;
}

export function DownloadBar({ items, onClearAll, onDownloaded }: DownloadBarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const completed = items.filter(
    (it): it is PostProcessItem & { resultBlob: Blob } =>
      it.status === 'done' && !!it.resultBlob,
  );

  if (items.length === 0) return null;

  const successCount = completed.length;
  const canDownload = successCount > 0 && !isDownloading;

  async function handleDownload() {
    if (completed.length === 0) return;
    setIsDownloading(true);
    try {
      // 다운로드 시점에 충돌 회피하여 파일명 확정
      const usedNames: string[] = [];
      const named = completed.map((it) => {
        const name = buildFilename(it.file.name, usedNames);
        usedNames.push(name);
        return { name, blob: it.resultBlob };
      });

      if (named.length === 1) {
        triggerBlobDownload(named[0].blob, named[0].name);
      } else {
        const zipBlob = await buildZip(named);
        triggerBlobDownload(zipBlob, `app-in-toss-logos-600-${timestampForFilename()}.zip`);
      }
      onDownloaded();
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        onClick={handleDownload}
        disabled={!canDownload}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {isDownloading
          ? successCount === 1
            ? '준비 중…'
            : 'ZIP 묶는 중…'
          : successCount <= 1
            ? 'PNG 다운로드'
            : `ZIP 다운로드 (${successCount}개)`}
      </Button>

      <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" className="gap-2 text-muted-foreground">
            <Trash2 className="h-4 w-4" />
            모두 비우기
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <p className="text-sm">정말 모두 비울까요? 결과는 복구할 수 없어요.</p>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                onClearAll();
              }}
            >
              모두 비우기
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
