import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFiles, disabled = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave는 자식 요소 진출입에서도 발생하므로 카운터로 추적
  const dragDepth = useRef(0);

  function handleDragEnter(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0) {
      onFiles(files);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      onFiles(files);
    }
    // 같은 파일을 다시 선택해도 onChange가 발화하도록 초기화
    e.target.value = '';
  }

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card p-8 text-center transition-colors',
        'hover:border-primary/60 hover:bg-primary/5',
        'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        isDragging && !disabled && 'border-primary bg-primary/10',
        disabled && 'cursor-not-allowed opacity-60 hover:border-input hover:bg-card',
      )}
      aria-label="이미지 파일 드롭 영역"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <span className="text-2xl" aria-hidden="true">📷</span>
      <span className="text-sm font-medium">
        여기로 이미지를 드래그하거나 클릭해 선택
      </span>
      <span className="text-xs text-muted-foreground">
        PNG · JPG · WebP / 최대 10장 / 장당 10MB
      </span>
      {disabled && (
        <span className="text-xs text-muted-foreground">
          최대 10장까지 추가했습니다. 카드를 비우면 추가할 수 있어요.
        </span>
      )}
    </label>
  );
}
