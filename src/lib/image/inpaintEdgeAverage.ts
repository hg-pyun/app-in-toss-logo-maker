import { EDGE_BAND_PX } from './constants';

/**
 * 우하단 patchSize×patchSize 영역을 채울 픽셀 버퍼를 생성한다.
 * - 좌측 바깥 bandWidth 픽셀 컬럼 띠 → 가로 평균으로 1픽셀 컬럼 → 패치 가로 stretch (결과 A)
 * - 상단 바깥 bandWidth 픽셀 행 띠 → 세로 평균으로 1픽셀 행 → 패치 세로 stretch (결과 B)
 * - A와 B를 픽셀 단위 산술 평균하여 반환
 *
 * 패치 안쪽 픽셀(워터마크 영역)은 절대 읽지 않는다 — 워터마크 색이 결과로 새어들지 않도록.
 */
export function inpaintEdgeAverage(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  patchSize: number,
  bandWidth: number = EDGE_BAND_PX,
): Uint8ClampedArray {
  const P = patchSize;
  const W = width;
  const H = height;
  const BAND = bandWidth;

  if (P + BAND > W || P + BAND > H) {
    throw new Error('PATCH_BAND_EXCEEDS_BUFFER');
  }
  if (P <= 0 || BAND <= 0) {
    throw new Error('INVALID_PATCH_OR_BAND');
  }

  const patchX = W - P;
  const patchY = H - P;

  // Step 1: 좌측 BAND픽셀 띠를 가로로 평균하여 1픽셀 컬럼 생성 (P개 행)
  const leftColumn = new Uint8ClampedArray(P * 4);
  for (let y = 0; y < P; y++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (let dx = 0; dx < BAND; dx++) {
      const px = patchX - BAND + dx;
      const py = patchY + y;
      const idx = (py * W + px) * 4;
      r += pixels[idx];
      g += pixels[idx + 1];
      b += pixels[idx + 2];
      a += pixels[idx + 3];
    }
    const o = y * 4;
    leftColumn[o] = Math.round(r / BAND);
    leftColumn[o + 1] = Math.round(g / BAND);
    leftColumn[o + 2] = Math.round(b / BAND);
    leftColumn[o + 3] = Math.round(a / BAND);
  }

  // Step 2: 상단 BAND픽셀 띠를 세로로 평균하여 1픽셀 행 생성 (P개 열)
  const topRow = new Uint8ClampedArray(P * 4);
  for (let x = 0; x < P; x++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (let dy = 0; dy < BAND; dy++) {
      const px = patchX + x;
      const py = patchY - BAND + dy;
      const idx = (py * W + px) * 4;
      r += pixels[idx];
      g += pixels[idx + 1];
      b += pixels[idx + 2];
      a += pixels[idx + 3];
    }
    const o = x * 4;
    topRow[o] = Math.round(r / BAND);
    topRow[o + 1] = Math.round(g / BAND);
    topRow[o + 2] = Math.round(b / BAND);
    topRow[o + 3] = Math.round(a / BAND);
  }

  // Step 3: 좌측 컬럼(stretch 결과 A)과 상단 행(stretch 결과 B)을 픽셀 평균
  const patch = new Uint8ClampedArray(P * P * 4);
  for (let y = 0; y < P; y++) {
    for (let x = 0; x < P; x++) {
      const patchIdx = (y * P + x) * 4;
      const lcIdx = y * 4;
      const trIdx = x * 4;
      patch[patchIdx] = Math.round((leftColumn[lcIdx] + topRow[trIdx]) / 2);
      patch[patchIdx + 1] = Math.round((leftColumn[lcIdx + 1] + topRow[trIdx + 1]) / 2);
      patch[patchIdx + 2] = Math.round((leftColumn[lcIdx + 2] + topRow[trIdx + 2]) / 2);
      patch[patchIdx + 3] = Math.round((leftColumn[lcIdx + 3] + topRow[trIdx + 3]) / 2);
    }
  }

  return patch;
}
