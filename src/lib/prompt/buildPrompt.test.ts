import { describe, expect, it } from 'vitest';
import { buildPrompt } from './buildPrompt';
import type { PromptArgs } from '@/types';

const base: PromptArgs = {
  name: '가계부 미니앱',
  description: '간단한 수입/지출 기록',
  keywords: ['clean', 'trustworthy', 'warm'],
  paletteId: 'mint',
  styleId: 'flat-geometric',
  showBothModes: true,
  model: 'gpt-image',
  mode: 'light',
};

describe('buildPrompt', () => {
  it('포함되어야 할 모든 슬롯이 한 줄씩 들어간다 (GPT-Image · Light · 모든 입력)', () => {
    const out = buildPrompt(base);
    expect(out).toContain('Create a square 1:1 mini-app icon');
    expect(out).toContain('Subject: 가계부 미니앱, 간단한 수입/지출 기록');
    expect(out).toContain('Keywords: clean, trustworthy, warm');
    expect(out).toContain('Style: Flat Geometric — clean geometric shapes');
    expect(out).toContain('Composition: a single centered symbol filling 70%');
    expect(out).toContain('Background: bright, soft, off-white-leaning');
    expect(out).toContain('Palette: built around Mint (#00C2A8)');
    expect(out).toContain('Mood: clean, trustworthy, warm, modern, friendly');
    expect(out).toContain('Output: 1:1 square, fully opaque edge-to-edge background');
    expect(out).not.toContain('Render once.');
  });

  it('Dark 모드는 Background 라인이 다크 톤으로 바뀐다', () => {
    const out = buildPrompt({ ...base, mode: 'dark' });
    expect(out).toContain('Background: deep, low-key composition');
    expect(out).not.toContain('Background: bright, soft, off-white-leaning');
  });

  it('Nano Banana 모델은 어조·출력 표기·끝 라인이 다르다', () => {
    const out = buildPrompt({ ...base, model: 'nano-banana' });
    expect(out).toContain('Generate a single square mini-app icon image');
    expect(out).toContain(
      'Aspect ratio: 1:1. Solid opaque background filling the entire 600x600 frame edge-to-edge.',
    );
    expect(out).toContain('Use sharp 90° corners.');
    expect(out).toContain('Render once. Do not produce variants.');
    expect(out).not.toContain('Output: 1:1 square, fully opaque edge-to-edge background, ready');
  });

  it('설명이 비면 Subject는 이름만 출력한다', () => {
    const out = buildPrompt({ ...base, description: '' });
    expect(out).toContain('Subject: 가계부 미니앱\n');
    expect(out).not.toContain(', 간단한');
  });

  it('키워드 0개면 Keywords 라인이 생략되고 Mood 기본값이 들어간다', () => {
    const out = buildPrompt({ ...base, keywords: [] });
    expect(out).not.toMatch(/^Keywords:/m);
    expect(out).toContain(
      'Mood: modern, friendly, modern, friendly, suitable for a Korean fintech mini-app surface.',
    );
  });

  it('키워드 정규화: 공백 trim, 빈 문자열 제거', () => {
    const out = buildPrompt({ ...base, keywords: ['  clean ', '', '  '] });
    expect(out).toContain('Keywords: clean');
    expect(out).toContain('Mood: clean, modern, friendly');
  });

  it('팔레트 미선택이면 Palette 라인이 자유 선택 문장으로 바뀐다', () => {
    const out = buildPrompt({ ...base, paletteId: null });
    expect(out).toContain('Palette: choose harmonious tones that match the style.');
    expect(out).not.toContain('Palette: built around');
  });

  it('스타일이 바뀌면 Style 라인 라벨/디테일이 바뀐다', () => {
    const out = buildPrompt({ ...base, styleId: 'pixel-retro' });
    expect(out).toContain('Style: Pixel/Retro — low-resolution pixel art');
  });

  it('Light/Dark/모델 모든 조합에서 배경이 반드시 존재하고 600x600 프레임을 가장자리까지 채운다는 지시가 들어간다', () => {
    const combos: Array<Pick<PromptArgs, 'mode' | 'model'>> = [
      { mode: 'light', model: 'gpt-image' },
      { mode: 'dark', model: 'gpt-image' },
      { mode: 'light', model: 'nano-banana' },
      { mode: 'dark', model: 'nano-banana' },
    ];
    for (const combo of combos) {
      const out = buildPrompt({ ...base, ...combo });
      // Background 라인 자체에 "반드시 존재 + 600x600 edge-to-edge" 명시
      expect(out).toMatch(
        /Background:.*background must always exist behind the logo and completely cover the entire 600x600 frame edge-to-edge/,
      );
      // Composition 라인에도 edge-to-edge full-bleed 강조
      expect(out).toContain(
        'layered on top of a fully opaque background that bleeds edge-to-edge across the entire 600x600 frame',
      );
      // Constraints 라인에도 투명/크롭/여백 금지 재확인
      expect(out).toMatch(
        /background must always be present behind the logo and fully cover the 600x600 frame — never transparent, never cropped/,
      );
    }
  });

  it('전체 라인 수는 10~14줄 범위다 (모든 입력)', () => {
    const out = buildPrompt(base);
    const lines = out.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(10);
    expect(lines.length).toBeLessThanOrEqual(14);
  });
});
