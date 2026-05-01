export type StyleId =
  | 'flat-geometric'
  | 'gradient-mesh'
  | 'isometric-3d'
  | 'glassmorphism'
  | 'neumorphism'
  | 'line-art-mono'
  | 'pixel-retro'
  | 'sticker-pop'
  | 'minimal-symbol'
  | 'korean-calligraphy';

export type PaletteId =
  | 'blue'
  | 'sky'
  | 'teal'
  | 'mint'
  | 'forest'
  | 'lemon'
  | 'amber'
  | 'tangerine'
  | 'coral'
  | 'crimson'
  | 'rose'
  | 'violet'
  | 'lavender'
  | 'indigo'
  | 'slate'
  | 'charcoal';

export type ModelId = 'gpt-image' | 'nano-banana';
export type ModeId = 'light' | 'dark';

export interface FormState {
  name: string;
  description: string;
  keywords: string[];
  paletteId: PaletteId | null;
  styleId: StyleId;
  showBothModes: boolean;
}

export interface PromptArgs extends FormState {
  model: ModelId;
  mode: ModeId;
}
