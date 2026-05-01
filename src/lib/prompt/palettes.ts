import type { PaletteId } from '@/types';

export interface PaletteMeta {
  id: PaletteId;
  label: string;
  hex: string;
}

export const PALETTES: PaletteMeta[] = [
  { id: 'blue', label: 'Blue', hex: '#3182F6' },
  { id: 'sky', label: 'Sky', hex: '#38BDF8' },
  { id: 'teal', label: 'Teal', hex: '#0D9488' },
  { id: 'mint', label: 'Mint', hex: '#00C2A8' },
  { id: 'forest', label: 'Forest', hex: '#14B85F' },
  { id: 'lemon', label: 'Lemon', hex: '#FFD93D' },
  { id: 'amber', label: 'Amber', hex: '#F59E0B' },
  { id: 'tangerine', label: 'Tangerine', hex: '#FB923C' },
  { id: 'coral', label: 'Coral', hex: '#FF6B6B' },
  { id: 'crimson', label: 'Crimson', hex: '#E11D48' },
  { id: 'rose', label: 'Rose', hex: '#F472B6' },
  { id: 'violet', label: 'Violet', hex: '#A855F7' },
  { id: 'lavender', label: 'Lavender', hex: '#8E7CFF' },
  { id: 'indigo', label: 'Indigo', hex: '#4F46E5' },
  { id: 'slate', label: 'Slate', hex: '#64748B' },
  { id: 'charcoal', label: 'Charcoal', hex: '#1F2937' },
];

const PALETTE_BY_ID = new Map(PALETTES.map((p) => [p.id, p]));

export function getPalette(id: PaletteId): PaletteMeta {
  const meta = PALETTE_BY_ID.get(id);
  if (!meta) throw new Error(`Unknown palette id: ${id}`);
  return meta;
}
