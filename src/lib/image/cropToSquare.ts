export interface CropToSquareResult {
  sx: number;
  sy: number;
  S: number;
}

export function cropToSquare(W: number, H: number): CropToSquareResult {
  const S = Math.min(W, H);
  const sx = Math.round((W - S) / 2);
  const sy = Math.round((H - S) / 2);
  return { sx, sy, S };
}

export function applyCropToSquare(
  source: ImageBitmap | HTMLCanvasElement,
  W: number,
  H: number,
): HTMLCanvasElement {
  const { sx, sy, S } = cropToSquare(W, H);
  const out = document.createElement('canvas');
  out.width = S;
  out.height = S;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('CANVAS_2D_UNAVAILABLE');
  ctx.drawImage(source, sx, sy, S, S, 0, 0, S, S);
  return out;
}
