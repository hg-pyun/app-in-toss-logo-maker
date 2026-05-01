import { useCallback, useEffect, useState } from 'react';
import type { FormState, ModelId, PaletteId, StyleId } from '@/types';
import { loadJSON, saveJSON, removeKey } from '@/lib/storage';

const FORM_KEY = 'form';
const MODEL_KEY = 'model';

export const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  keywords: [],
  paletteId: null,
  styleId: 'flat-geometric',
  showBothModes: true,
};

export const EXAMPLE_FORM: FormState = {
  name: '가계부 미니앱',
  description: '간단한 수입/지출 기록',
  keywords: ['clean', 'trustworthy', 'warm'],
  paletteId: 'mint',
  styleId: 'flat-geometric',
  showBothModes: true,
};

const VALID_STYLE_IDS: StyleId[] = [
  'flat-geometric',
  'gradient-mesh',
  'isometric-3d',
  'glassmorphism',
  'neumorphism',
  'line-art-mono',
  'pixel-retro',
  'sticker-pop',
  'minimal-symbol',
  'korean-calligraphy',
];

const VALID_PALETTE_IDS: PaletteId[] = [
  'blue',
  'sky',
  'teal',
  'mint',
  'forest',
  'lemon',
  'amber',
  'tangerine',
  'coral',
  'crimson',
  'rose',
  'violet',
  'lavender',
  'indigo',
  'slate',
  'charcoal',
];

function sanitize(loaded: unknown): FormState {
  if (!loaded || typeof loaded !== 'object') return EMPTY_FORM;
  const f = loaded as Partial<FormState>;
  return {
    name: typeof f.name === 'string' ? f.name : '',
    description: typeof f.description === 'string' ? f.description : '',
    keywords: Array.isArray(f.keywords) ? f.keywords.filter((k): k is string => typeof k === 'string').slice(0, 5) : [],
    paletteId: f.paletteId && VALID_PALETTE_IDS.includes(f.paletteId as PaletteId) ? (f.paletteId as PaletteId) : null,
    styleId: f.styleId && VALID_STYLE_IDS.includes(f.styleId as StyleId) ? (f.styleId as StyleId) : 'flat-geometric',
    showBothModes: typeof f.showBothModes === 'boolean' ? f.showBothModes : true,
  };
}

export function useFormState() {
  const [form, setForm] = useState<FormState>(() => sanitize(loadJSON<FormState>(FORM_KEY, EMPTY_FORM)));
  const [model, setModel] = useState<ModelId>(() => {
    const m = loadJSON<ModelId>(MODEL_KEY, 'gpt-image');
    return m === 'nano-banana' ? 'nano-banana' : 'gpt-image';
  });

  useEffect(() => {
    saveJSON(FORM_KEY, form);
  }, [form]);

  useEffect(() => {
    saveJSON(MODEL_KEY, model);
  }, [model]);

  const update = useCallback(<K extends keyof FormState>(patch: Pick<FormState, K>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    removeKey(FORM_KEY);
  }, []);

  const fillExample = useCallback(() => {
    setForm(EXAMPLE_FORM);
  }, []);

  return { form, model, setModel, update, reset, fillExample };
}

export function isFormEmpty(f: FormState): boolean {
  return (
    f.name.trim() === '' &&
    f.description.trim() === '' &&
    f.keywords.length === 0 &&
    f.paletteId === null
  );
}
