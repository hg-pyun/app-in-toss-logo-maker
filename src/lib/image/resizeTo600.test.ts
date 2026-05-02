import { describe, expect, it } from 'vitest';
import { resizeTo600 } from './resizeTo600';

describe('resizeTo600', () => {
  it('정확히 600: upscale 플래그 없음', () => {
    expect(resizeTo600(600)).toEqual({ upscaled: false, targetSize: 600 });
  });

  it('600 초과 (다운스케일): upscale 플래그 없음', () => {
    expect(resizeTo600(1024)).toEqual({ upscaled: false, targetSize: 600 });
  });

  it('600 미만 (업스케일): upscale 플래그 set', () => {
    expect(resizeTo600(400)).toEqual({ upscaled: true, targetSize: 600 });
  });

  it('599 (경계 바로 아래): upscale 플래그 set', () => {
    expect(resizeTo600(599)).toEqual({ upscaled: true, targetSize: 600 });
  });
});
