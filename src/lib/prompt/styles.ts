import type { StyleId } from '@/types';

export interface StyleMeta {
  id: StyleId;
  label: string;
  koDescription: string;
  enDetail: string;
}

export const STYLES: StyleMeta[] = [
  {
    id: 'flat-geometric',
    label: 'Flat Geometric',
    koDescription: '면 분할 기반 모던 플랫',
    enDetail: 'clean geometric shapes, vector-friendly, flat fills, no gradients, crisp edges',
  },
  {
    id: 'gradient-mesh',
    label: 'Gradient Mesh',
    koDescription: '부드러운 그라데이션 메시',
    enDetail: 'smooth multi-color gradient mesh, soft transitions, glowing depth',
  },
  {
    id: 'isometric-3d',
    label: '3D Isometric',
    koDescription: '입체감 있는 아이소메트릭',
    enDetail: 'isometric 3D shapes with subtle shading, soft ambient occlusion, modern app-icon depth',
  },
  {
    id: 'glassmorphism',
    label: 'Glassmorphism',
    koDescription: '반투명 유리 질감',
    enDetail: 'translucent frosted-glass surfaces, soft blur, layered depth, gentle highlights',
  },
  {
    id: 'neumorphism',
    label: 'Neumorphism',
    koDescription: '부드러운 음영 뉴모피즘',
    enDetail: 'soft inner and outer shadows on a single base color, tactile cushioned look',
  },
  {
    id: 'line-art-mono',
    label: 'Line Art Mono',
    koDescription: '단색 라인 아트',
    enDetail: 'monoline icon, single-color strokes, even line weight, minimal fills',
  },
  {
    id: 'pixel-retro',
    label: 'Pixel/Retro',
    koDescription: '픽셀/레트로 게임 풍',
    enDetail: 'low-resolution pixel art, retro 16-bit game aesthetic, blocky pixels visible',
  },
  {
    id: 'sticker-pop',
    label: 'Sticker Pop',
    koDescription: '두꺼운 외곽선 스티커',
    enDetail: 'sticker-style icon with thick outer border, bold shapes, slight drop shadow',
  },
  {
    id: 'minimal-symbol',
    label: 'Minimal Symbol',
    koDescription: '극도로 단순한 심볼',
    enDetail: 'extremely minimal symbol, two or three shapes maximum, generous negative space',
  },
  {
    id: 'korean-calligraphy',
    label: 'Korean Calligraphy',
    koDescription: '굵직한 느낌의 추상 동양 기호 (텍스트 아님)',
    enDetail:
      'abstract East-Asian ink-brush mark, bold thick strokes, organic edges, no readable letters or words',
  },
];

const STYLE_BY_ID = new Map(STYLES.map((s) => [s.id, s]));

export function getStyle(id: StyleId): StyleMeta {
  const meta = STYLE_BY_ID.get(id);
  if (!meta) throw new Error(`Unknown style id: ${id}`);
  return meta;
}
