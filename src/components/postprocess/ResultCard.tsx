import { Loader2, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostProcessItem, PostProcessStatus } from './types';

interface ResultCardProps {
  item: PostProcessItem;
  onRemove: () => void;
  onRetry: () => void;
  onPreview: () => void;
}

export function ResultCard({ item, onRemove, onRetry, onPreview }: ResultCardProps) {
  const isRejected = item.status === 'rejected';
  const isProcessing = item.status === 'processing';
  const isDone = item.status === 'done';
  const isFailed = item.status === 'failed';
  const showAfter = isDone && item.resultUrl;

  return (
    <article
      className="relative flex flex-col gap-3 rounded-lg border bg-card p-3"
      aria-label={`${item.file.name}, ${statusLabel(item.status)}`}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 z-10 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`카드 제거: ${item.file.name}`}
      >
        <X className="h-4 w-4" />
      </button>

      <header className="pr-7">
        <p className="truncate text-xs font-medium" title={item.file.name}>
          {item.file.name}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Thumbnail label="Before" url={item.sourceUrl} dimmed={isRejected} />
        {showAfter ? (
          <button
            type="button"
            onClick={onPreview}
            className="group relative aspect-square w-full overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${item.filename} 미리보기`}
          >
            <img
              src={item.resultUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              After
            </span>
          </button>
        ) : (
          <Placeholder label="After" processing={isProcessing} />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={item.status} />
        {item.flags?.croppedToSquare && <FlagBadge>정사각 크롭됨</FlagBadge>}
        {item.flags?.upscaled && <FlagBadge>업스케일됨</FlagBadge>}
      </div>

      {item.error && (
        <p className="text-xs leading-snug text-destructive">{item.error}</p>
      )}

      {isFailed && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-3 w-3" />
          재시도
        </button>
      )}
    </article>
  );
}

function Thumbnail({
  label,
  url,
  dimmed,
}: {
  label: string;
  url?: string;
  dimmed?: boolean;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
      {url ? (
        <img
          src={url}
          alt=""
          className={cn('h-full w-full object-cover', dimmed && 'opacity-50')}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          미리보기 없음
        </div>
      )}
      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {label}
      </span>
    </div>
  );
}

function Placeholder({ label, processing }: { label: string; processing: boolean }) {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center rounded-md bg-muted">
      {processing ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (
        <span className="text-[10px] text-muted-foreground">대기</span>
      )}
      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: PostProcessStatus }) {
  const styles: Record<PostProcessStatus, string> = {
    pending: 'bg-muted text-foreground',
    processing: 'bg-blue-100 text-blue-900',
    done: 'bg-emerald-100 text-emerald-900',
    failed: 'bg-red-100 text-red-900',
    rejected: 'bg-amber-100 text-amber-900',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        styles[status],
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function FlagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
      {children}
    </span>
  );
}

function statusLabel(status: PostProcessStatus): string {
  switch (status) {
    case 'pending':
      return '대기';
    case 'processing':
      return '처리 중…';
    case 'done':
      return '완료';
    case 'failed':
      return '실패';
    case 'rejected':
      return '거부됨';
  }
}
