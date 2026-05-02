import { TARGET_SIZE } from './constants';

export interface ResizeTo600Result {
  upscaled: boolean;
  targetSize: number;
}

export function resizeTo600(S: number): ResizeTo600Result {
  return {
    upscaled: S < TARGET_SIZE,
    targetSize: TARGET_SIZE,
  };
}

export function applyResizeTo600(
  source: HTMLCanvasElement,
): { canvas: HTMLCanvasElement; upscaled: boolean } {
  const S = source.width;
  const { upscaled } = resizeTo600(S);
  const out = document.createElement('canvas');
  out.width = TARGET_SIZE;
  out.height = TARGET_SIZE;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('CANVAS_2D_UNAVAILABLE');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, TARGET_SIZE, TARGET_SIZE);
  return { canvas: out, upscaled };
}
