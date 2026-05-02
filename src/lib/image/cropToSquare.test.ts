import { describe, expect, it } from 'vitest';
import { cropToSquare } from './cropToSquare';

describe('cropToSquare', () => {
  it('정사각 입력: offset 0, S = 변 길이', () => {
    expect(cropToSquare(100, 100)).toEqual({ sx: 0, sy: 0, S: 100 });
  });

  it('가로 긴 입력: 좌우 균등 크롭', () => {
    expect(cropToSquare(200, 100)).toEqual({ sx: 50, sy: 0, S: 100 });
  });

  it('세로 긴 입력: 상하 균등 크롭', () => {
    expect(cropToSquare(100, 200)).toEqual({ sx: 0, sy: 50, S: 100 });
  });

  it('홀수 차이: round 적용', () => {
    // (201 - 100) / 2 = 50.5 → 51
    expect(cropToSquare(201, 100)).toEqual({ sx: 51, sy: 0, S: 100 });
  });

  it('Gemini 1024² 출력: 크롭 없음', () => {
    expect(cropToSquare(1024, 1024)).toEqual({ sx: 0, sy: 0, S: 1024 });
  });

  it('비정사각 모바일 사진 (4032x3024): 가로 긴 입력', () => {
    // S = 3024, sx = (4032 - 3024) / 2 = 504
    expect(cropToSquare(4032, 3024)).toEqual({ sx: 504, sy: 0, S: 3024 });
  });
});
