import { describe, expect, it } from 'vitest';
import { validateFileMeta, validateBitmapSize } from './validateFile';

describe('validateFileMeta', () => {
  it('PNG accepted', () => {
    expect(validateFileMeta({ type: 'image/png', size: 1024 })).toEqual({ ok: true });
  });

  it('JPEG accepted', () => {
    expect(validateFileMeta({ type: 'image/jpeg', size: 1024 })).toEqual({ ok: true });
  });

  it('WebP accepted', () => {
    expect(validateFileMeta({ type: 'image/webp', size: 1024 })).toEqual({ ok: true });
  });

  it('HEIC rejected (unsupported-mime)', () => {
    expect(validateFileMeta({ type: 'image/heic', size: 1024 })).toEqual({
      ok: false,
      reason: 'unsupported-mime',
    });
  });

  it('GIF rejected (unsupported-mime)', () => {
    expect(validateFileMeta({ type: 'image/gif', size: 1024 })).toEqual({
      ok: false,
      reason: 'unsupported-mime',
    });
  });

  it('SVG rejected (unsupported-mime)', () => {
    expect(validateFileMeta({ type: 'image/svg+xml', size: 1024 })).toEqual({
      ok: false,
      reason: 'unsupported-mime',
    });
  });

  it('빈 MIME 거부', () => {
    expect(validateFileMeta({ type: '', size: 1024 })).toEqual({
      ok: false,
      reason: 'unsupported-mime',
    });
  });

  it('정확히 10MB는 통과 (경계)', () => {
    expect(validateFileMeta({ type: 'image/png', size: 10 * 1024 * 1024 })).toEqual({ ok: true });
  });

  it('10MB + 1바이트는 거부', () => {
    expect(validateFileMeta({ type: 'image/png', size: 10 * 1024 * 1024 + 1 })).toEqual({
      ok: false,
      reason: 'file-too-large',
    });
  });
});

describe('validateBitmapSize', () => {
  it('정확히 4096×4096은 통과 (경계)', () => {
    expect(validateBitmapSize(4096, 4096)).toEqual({ ok: true });
  });

  it('4097 폭은 거부', () => {
    expect(validateBitmapSize(4097, 1024)).toEqual({
      ok: false,
      reason: 'pixel-too-large',
    });
  });

  it('4097 높이는 거부', () => {
    expect(validateBitmapSize(1024, 4097)).toEqual({
      ok: false,
      reason: 'pixel-too-large',
    });
  });

  it('일반적인 1024×1024 통과', () => {
    expect(validateBitmapSize(1024, 1024)).toEqual({ ok: true });
  });

  it('비정사각 통과', () => {
    expect(validateBitmapSize(1920, 1080)).toEqual({ ok: true });
  });
});
