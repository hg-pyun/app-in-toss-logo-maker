import type { ModeId, PromptArgs } from '@/types';
import { getStyle } from './styles';
import { getPalette } from './palettes';
import { getModelVariant } from './modelVariants';

const BG_DIRECTION: Record<ModeId, string> = {
  light:
    'bright, soft, off-white-leaning composition with gentle depth. The background must always exist behind the logo and completely cover the entire 600x600 frame edge-to-edge, with no transparent areas, no white margins, no padding, and no empty space.',
  dark:
    'deep, low-key composition (charcoal/midnight family) with subtle inner glow. The background must always exist behind the logo and completely cover the entire 600x600 frame edge-to-edge, with no transparent areas, no margins, no padding, and no empty space.',
};

const COMPOSITION_LINE =
  'Composition: a single centered symbol filling 70% of the canvas, layered on top of a fully opaque background that bleeds edge-to-edge across the entire 600x600 frame, sharp 90° square corners, no transparency, no border padding, no margins.';

const MOOD_TAIL = 'modern, friendly, suitable for a Korean fintech mini-app surface.';

/**
 * 입력 → 영어 프롬프트 텍스트.
 * 빈 필드 / 가변 키워드 / 팔레트 미선택 처리는 SPEC §5.4에 따른다.
 */
export function buildPrompt(args: PromptArgs): string {
  const style = getStyle(args.styleId);
  const variant = getModelVariant(args.model);

  const lines: string[] = [];
  lines.push(variant.opening);

  // Subject
  const subject = args.description.trim()
    ? `Subject: ${args.name.trim()}, ${args.description.trim()}`
    : `Subject: ${args.name.trim()}`;
  lines.push(subject);

  // Keywords (0개면 라인 생략)
  const keywords = args.keywords.map((k) => k.trim()).filter(Boolean);
  if (keywords.length > 0) {
    lines.push(`Keywords: ${keywords.join(', ')}`);
  }

  // Style
  lines.push(`Style: ${style.label} — ${style.enDetail}`);

  // Composition (고정)
  lines.push(COMPOSITION_LINE);

  // Background (모드 변형)
  lines.push(`Background: ${BG_DIRECTION[args.mode]}`);

  // Palette (선택/미선택 분기)
  if (args.paletteId) {
    const p = getPalette(args.paletteId);
    lines.push(
      `Palette: built around ${p.label} (${p.hex}), with harmonious supporting tones chosen by you.`,
    );
  } else {
    lines.push('Palette: choose harmonious tones that match the style.');
  }

  // Mood (키워드 → mood, 없으면 기본값)
  const moodHead = keywords.length > 0 ? keywords.join(', ') : 'modern, friendly';
  lines.push(`Mood: ${moodHead}, ${MOOD_TAIL}`);

  // 모델별 출력/제약
  lines.push(...variant.outputAndConstraints);

  if (variant.trailing) {
    lines.push(variant.trailing);
  }

  return lines.join('\n');
}
