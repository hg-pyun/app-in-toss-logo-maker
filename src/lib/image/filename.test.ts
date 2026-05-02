import { describe, expect, it } from 'vitest';
import { filename } from './filename';

describe('filename', () => {
  it('확장자 제거 + -600.png 접미사', () => {
    expect(filename('logo.png', [])).toBe('logo-600.png');
  });

  it('대소문자 보존', () => {
    expect(filename('IMG_4821.JPG', [])).toBe('IMG_4821-600.png');
  });

  it('한글 파일명 + 괄호 처리', () => {
    expect(filename('사진 (1).webp', [])).toBe('사진 (1)-600.png');
  });

  it('첫 번째 충돌 시 (2) 카운터 부여', () => {
    expect(filename('logo.png', ['logo-600.png'])).toBe('logo-600 (2).png');
  });

  it('연속 충돌 시 카운터 증가', () => {
    expect(filename('logo.png', ['logo-600.png', 'logo-600 (2).png'])).toBe('logo-600 (3).png');
  });

  it('카운터 시퀀스 갭은 채워서 사용', () => {
    // (3)이 있어도 (2)가 비어있으면 (2) 우선
    expect(filename('logo.png', ['logo-600.png', 'logo-600 (3).png'])).toBe('logo-600 (2).png');
  });

  it('확장자 없는 입력', () => {
    expect(filename('noext', [])).toBe('noext-600.png');
  });

  it('다중 점 (.tar.gz): 마지막 확장자만 제거', () => {
    expect(filename('archive.tar.gz', [])).toBe('archive.tar-600.png');
  });

  it('dot으로 시작하는 파일은 확장자 없음으로 처리', () => {
    expect(filename('.hidden', [])).toBe('.hidden-600.png');
  });

  it('existingNames 미전달 시 기본값으로 동작', () => {
    expect(filename('logo.png')).toBe('logo-600.png');
  });
});
