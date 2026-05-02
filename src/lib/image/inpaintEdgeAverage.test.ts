import { describe, expect, it } from 'vitest';
import { inpaintEdgeAverage } from './inpaintEdgeAverage';

function makeSolidImage(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a: number = 255,
): Uint8ClampedArray {
  const px = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    px[i * 4] = r;
    px[i * 4 + 1] = g;
    px[i * 4 + 2] = b;
    px[i * 4 + 3] = a;
  }
  return px;
}

describe('inpaintEdgeAverage', () => {
  it('단색 입력: 패치도 같은 단색', () => {
    const W = 20;
    const H = 20;
    const P = 10;
    const px = makeSolidImage(W, H, 100, 150, 200);
    const patch = inpaintEdgeAverage(px, W, H, P, 3);

    expect(patch.length).toBe(P * P * 4);
    for (let i = 0; i < P * P; i++) {
      expect(patch[i * 4]).toBe(100);
      expect(patch[i * 4 + 1]).toBe(150);
      expect(patch[i * 4 + 2]).toBe(200);
      expect(patch[i * 4 + 3]).toBe(255);
    }
  });

  it('Uint8ClampedArray 반환, 길이 = P×P×4', () => {
    const px = makeSolidImage(20, 20, 0, 0, 0);
    const patch = inpaintEdgeAverage(px, 20, 20, 10, 3);
    expect(patch).toBeInstanceOf(Uint8ClampedArray);
    expect(patch.length).toBe(10 * 10 * 4);
  });

  it('패치 + 띠가 버퍼를 초과하면 throw', () => {
    const px = makeSolidImage(10, 10, 0, 0, 0);
    expect(() => inpaintEdgeAverage(px, 10, 10, 9, 3)).toThrow('PATCH_BAND_EXCEEDS_BUFFER');
  });

  it('P 또는 BAND가 0 이하면 throw', () => {
    const px = makeSolidImage(20, 20, 0, 0, 0);
    expect(() => inpaintEdgeAverage(px, 20, 20, 0, 3)).toThrow('INVALID_PATCH_OR_BAND');
    expect(() => inpaintEdgeAverage(px, 20, 20, 10, 0)).toThrow('INVALID_PATCH_OR_BAND');
  });

  it('패치 영역 안쪽 픽셀은 결과에 영향 없음 (워터마크 격리)', () => {
    // 20×20: 우하단 10×10 패치 영역에 빨강(워터마크 시뮬레이션), 외부 영역은 초록.
    // 결과 패치는 초록 계열이어야 함 — 빨강이 절대 새어들면 안 됨.
    const W = 20;
    const H = 20;
    const P = 10;
    const px = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const inPatch = x >= W - P && y >= H - P;
        px[idx] = inPatch ? 255 : 0;
        px[idx + 1] = inPatch ? 0 : 255;
        px[idx + 2] = 0;
        px[idx + 3] = 255;
      }
    }
    const patch = inpaintEdgeAverage(px, W, H, P, 3);
    for (let i = 0; i < P * P; i++) {
      expect(patch[i * 4]).toBe(0); // R = 0 (워터마크 빨강 격리)
      expect(patch[i * 4 + 1]).toBe(255); // G = 255
      expect(patch[i * 4 + 3]).toBe(255);
    }
  });

  it('가로 그라디언트: 패치 색이 컬럼별로 변화', () => {
    // 좌→우로 R 채널이 0~W-1까지 증가하는 그라디언트.
    // 상단 띠 샘플링이 패치 컬럼별로 다른 R을 읽어와야 함.
    const W = 30;
    const H = 30;
    const P = 15;
    const px = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        px[idx] = Math.round((x / (W - 1)) * 255);
        px[idx + 1] = 0;
        px[idx + 2] = 0;
        px[idx + 3] = 255;
      }
    }
    const patch = inpaintEdgeAverage(px, W, H, P, 3);

    // 패치의 각 행에서 좌→우로 R이 증가해야 함.
    const row0Start = patch[0]; // patch[0][0].r
    const row0End = patch[(P - 1) * 4]; // patch[0][P-1].r
    expect(row0End).toBeGreaterThan(row0Start);
  });
});
