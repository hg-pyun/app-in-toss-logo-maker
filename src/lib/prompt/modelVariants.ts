import type { ModelId } from '@/types';

export interface ModelVariant {
  /** 시작 문장. 골격의 첫 줄을 대체한다. */
  opening: string;
  /** Composition·Background·Palette 다음에 들어가는 출력/제약 라인 모음. */
  outputAndConstraints: string[];
  /** 가장 마지막에 추가될 한 줄. 없을 수도 있음. */
  trailing?: string;
}

export const MODEL_VARIANTS: Record<ModelId, ModelVariant> = {
  'gpt-image': {
    opening: 'Create a square 1:1 mini-app icon, designed for 600x600 export.',
    outputAndConstraints: [
      'Constraints: no text, no letters, no numbers, no watermarks, no real-world brand logos, no human faces. No rounded edges. The background must always be present behind the logo and fully cover the 600x600 frame — never transparent, never cropped, never with white margins or padding.',
      'Output: 1:1 square, fully opaque edge-to-edge background, ready for 600x600 export.',
    ],
  },
  'nano-banana': {
    opening: 'Generate a single square mini-app icon image, designed for 600x600 export.',
    outputAndConstraints: [
      'Constraints: avoid any text, letters, numbers, watermarks, real-world brand logos, or human faces. Use sharp 90° corners. The background must always be present behind the logo and fully cover the 600x600 frame — never transparent, never cropped, never with margins or padding.',
      'Aspect ratio: 1:1. Solid opaque background filling the entire 600x600 frame edge-to-edge.',
    ],
    trailing: 'Render once. Do not produce variants.',
  },
};

export function getModelVariant(id: ModelId): ModelVariant {
  return MODEL_VARIANTS[id];
}
