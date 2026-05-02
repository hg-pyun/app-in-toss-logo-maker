import { useCallback, useEffect, useRef, useState } from 'react';
import { processImage } from '@/lib/image/processImage';
import { filename as buildFilename } from '@/lib/image/filename';
import {
  REJECTION_MESSAGES,
  validateBitmapSize,
  validateFileMeta,
} from '@/lib/image/validateFile';
import { MAX_FILES } from '@/lib/image/constants';
import type { PostProcessItem } from '@/components/postprocess/types';

export interface QueueOptions {
  onBatchStart?: (count: number) => void;
  onBatchComplete?: (success: number, failed: number) => void;
  onTooMany?: () => void;
}

export interface QueueApi {
  items: PostProcessItem[];
  addFiles: (files: File[]) => Promise<void>;
  removeItem: (id: string) => void;
  clearAll: () => void;
  retryItem: (id: string) => void;
}

export function usePostProcessQueue(opts: QueueOptions = {}): QueueApi {
  const [items, setItems] = useState<PostProcessItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const optsRef = useRef(opts);
  optsRef.current = opts;

  const isProcessingRef = useRef(false);
  const aliveRef = useRef(true);
  const batchSuccessRef = useRef(0);
  const batchFailedRef = useRef(0);

  const addFiles = useCallback(async (input: File[]) => {
    const current = itemsRef.current;
    const remainingSlots = Math.max(0, MAX_FILES - current.length);
    const accepted = input.slice(0, remainingSlots);
    const overflow = input.slice(remainingSlots);

    if (overflow.length > 0) {
      optsRef.current.onTooMany?.();
    }

    const newItems: PostProcessItem[] = [];

    for (const file of accepted) {
      const metaCheck = validateFileMeta({ type: file.type, size: file.size });
      if (!metaCheck.ok) {
        newItems.push({
          id: crypto.randomUUID(),
          file,
          filename: buildFilename(file.name),
          status: 'rejected',
          error: REJECTION_MESSAGES[metaCheck.reason],
        });
        continue;
      }

      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        newItems.push({
          id: crypto.randomUUID(),
          file,
          filename: buildFilename(file.name),
          status: 'rejected',
          error: REJECTION_MESSAGES['decode-failed'],
        });
        continue;
      }

      const sizeCheck = validateBitmapSize(bitmap.width, bitmap.height);
      if (!sizeCheck.ok) {
        bitmap.close();
        newItems.push({
          id: crypto.randomUUID(),
          file,
          filename: buildFilename(file.name),
          status: 'rejected',
          error: REJECTION_MESSAGES[sizeCheck.reason],
        });
        continue;
      }

      bitmap.close();
      newItems.push({
        id: crypto.randomUUID(),
        file,
        filename: buildFilename(file.name),
        sourceUrl: URL.createObjectURL(file),
        status: 'pending',
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.sourceUrl) URL.revokeObjectURL(target.sourceUrl);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      for (const it of prev) {
        if (it.sourceUrl) URL.revokeObjectURL(it.sourceUrl);
        if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
      }
      return [];
    });
  }, []);

  const retryItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && it.status === 'failed'
          ? { ...it, status: 'pending', error: undefined }
          : it,
      ),
    );
  }, []);

  // 처리 루프: items 변화 시 pending 있는지 확인, 없거나 이미 돌고 있으면 무시.
  // 한 번 시작된 루프는 items 상태 변화로 취소되지 않는다 — items 변화는 루프 *내부*에서
  // 일어나는 부산물이므로, useEffect cleanup으로 in-flight 작업을 죽이면 setItems(done)이
  // 막혀 카드가 영원히 'processing'에 머무는 버그 발생.
  // 진짜 취소 신호는 컴포넌트 언마운트(aliveRef = false)뿐.
  useEffect(() => {
    if (isProcessingRef.current) return;
    if (!items.some((it) => it.status === 'pending')) return;

    isProcessingRef.current = true;

    (async () => {
      const initialPending = itemsRef.current.filter((it) => it.status === 'pending').length;
      batchSuccessRef.current = 0;
      batchFailedRef.current = 0;
      optsRef.current.onBatchStart?.(initialPending);

      while (aliveRef.current) {
        const next = itemsRef.current.find((it) => it.status === 'pending');
        if (!next) break;

        setItems((prev) =>
          prev.map((it) => (it.id === next.id ? { ...it, status: 'processing' } : it)),
        );

        let bitmap: ImageBitmap | null = null;
        try {
          bitmap = await createImageBitmap(next.file, { imageOrientation: 'from-image' });
          const out = await processImage({ bitmap });
          if (aliveRef.current) {
            const resultUrl = URL.createObjectURL(out.blob);
            setItems((prev) =>
              prev.map((it) =>
                it.id === next.id
                  ? {
                      ...it,
                      status: 'done',
                      resultBlob: out.blob,
                      resultUrl,
                      flags: out.flags,
                    }
                  : it,
              ),
            );
            batchSuccessRef.current++;
          }
        } catch (e) {
          if (aliveRef.current) {
            const message =
              e instanceof Error && e.message === 'CANVAS_TO_BLOB_NULL'
                ? '메모리가 부족해요. 다른 카드를 비우거나 작은 이미지로 다시 시도해 주세요.'
                : '처리 중 오류가 발생했어요.';
            setItems((prev) =>
              prev.map((it) =>
                it.id === next.id ? { ...it, status: 'failed', error: message } : it,
              ),
            );
            batchFailedRef.current++;
          }
        } finally {
          bitmap?.close();
        }

        // 1프레임 양보 — 다음 아이템 처리 전 메인 스레드 풀어줌
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }

      if (aliveRef.current) {
        optsRef.current.onBatchComplete?.(batchSuccessRef.current, batchFailedRef.current);
      }
      batchSuccessRef.current = 0;
      batchFailedRef.current = 0;
      isProcessingRef.current = false;
    })();
  }, [items]);

  // mount/unmount 라이프사이클: StrictMode dev에서도 안전하게 aliveRef 토글.
  // (StrictMode는 의도적으로 effect cleanup을 한 번 더 실행하므로 ref 초기값에 의존하면 안 됨.)
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const it of itemsRef.current) {
        if (it.sourceUrl) URL.revokeObjectURL(it.sourceUrl);
        if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
      }
    };
  }, []);

  return { items, addFiles, removeItem, clearAll, retryItem };
}
