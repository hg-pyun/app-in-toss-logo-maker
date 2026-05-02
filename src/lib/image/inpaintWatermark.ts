import { EDGE_BAND_PX, WATERMARK_PATCH_RATIO } from './constants';
import { inpaintEdgeAverage } from './inpaintEdgeAverage';

export function applyInpaintWatermark(canvas: HTMLCanvasElement): void {
  const S = canvas.width;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('CANVAS_2D_UNAVAILABLE');

  const P = Math.round(S * WATERMARK_PATCH_RATIO);
  const sampleSize = P + EDGE_BAND_PX;

  const subImage = ctx.getImageData(S - sampleSize, S - sampleSize, sampleSize, sampleSize);

  const patch = inpaintEdgeAverage(subImage.data, sampleSize, sampleSize, P, EDGE_BAND_PX);

  const patchImageData = ctx.createImageData(P, P);
  patchImageData.data.set(patch);
  ctx.putImageData(patchImageData, S - P, S - P);
}
