import { TARGET_SIZE } from './constants';
import { cropToSquare } from './cropToSquare';
import { applyInpaintWatermark } from './inpaintWatermark';
import { resizeTo600 } from './resizeTo600';

export interface ProcessImageInput {
  bitmap: ImageBitmap;
}

export interface ProcessImageOutput {
  blob: Blob;
  flags: {
    croppedToSquare: boolean;
    upscaled: boolean;
  };
}

export async function processImage({ bitmap }: ProcessImageInput): Promise<ProcessImageOutput> {
  const W = bitmap.width;
  const H = bitmap.height;

  // 5.1 정사각 보정
  const { sx, sy, S } = cropToSquare(W, H);
  const cropped = document.createElement('canvas');
  cropped.width = S;
  cropped.height = S;
  const cctx = cropped.getContext('2d');
  if (!cctx) throw new Error('CANVAS_2D_UNAVAILABLE');
  cctx.drawImage(bitmap, sx, sy, S, S, 0, 0, S, S);
  const croppedToSquare = W !== H;

  // 5.2 인페인팅 (우하단)
  applyInpaintWatermark(cropped);

  // 5.3 600x600 리사이즈
  const { upscaled } = resizeTo600(S);
  const resized = document.createElement('canvas');
  resized.width = TARGET_SIZE;
  resized.height = TARGET_SIZE;
  const rctx = resized.getContext('2d');
  if (!rctx) throw new Error('CANVAS_2D_UNAVAILABLE');
  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = 'high';
  rctx.drawImage(cropped, 0, 0, TARGET_SIZE, TARGET_SIZE);

  // PNG 인코딩
  const blob = await canvasToBlob(resized);

  return {
    blob,
    flags: { croppedToSquare, upscaled },
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('CANVAS_TO_BLOB_NULL'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}
