# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server
npm test             # Vitest, run-once (used by CI)
npm run test:watch   # Vitest watch mode
npm run build        # tsc -b && vite build
npm run preview      # Serve dist/ at the configured base path
npm run lint         # tsc -b --noEmit (no ESLint configured)
```

Run a single test file or test name:
```bash
npx vitest run src/lib/prompt/buildPrompt.test.ts
npx vitest run -t "Nano Banana"
```

Vitest runs in `environment: 'node'` with `globals: true` (see `vite.config.ts`). Imports use the `@/` alias for `src/`.

## Architecture

This is a **single-page, 100% client-side static tool** that converts Korean form input into English image-generation prompts. There is no backend, no LLM API call, and no routing. The user copies the generated prompt into ChatGPT or Gemini themselves.

The data flow is one-directional and small enough to keep in your head:

```
FormState (useFormState)
  → useDebouncedValue (150ms)
    → ResultPanel (model tab + 1 or 2 PromptCards)
      → buildPrompt(PromptArgs) per card
        → English prompt string
```

Key boundaries:

- **`src/lib/prompt/`** is the pure core. `buildPrompt.ts` is the only function that knows the prompt template; it composes lines from three metadata sources (`styles.ts`, `palettes.ts`, `modelVariants.ts`). Mode (light/dark) is a switch on a fixed `BG_DIRECTION` map inside `buildPrompt.ts`. **Any prompt text change belongs here, not in components.** This module is the unit-tested boundary — keep it pure (no React, no DOM, no storage).
- **`src/hooks/useFormState.ts`** owns the entire form + selected model and is the single source of truth for what gets persisted. It sanitizes loaded values against allowlists for `styleId` / `paletteId` so a stale or hand-edited `localStorage` payload can't crash the app. `EMPTY_FORM` and `EXAMPLE_FORM` (used by the "예시로 채우기" button) live here.
- **`src/lib/storage.ts`** wraps `localStorage` with the key prefix **`app-in-toss-logo-maker:v1:`**. Per SPEC §3, schema migration is intentionally not supported: bumping to `v2:` simply orphans v1 keys and users start with an empty form. Don't read v1 keys from a v2 codepath.
- **`src/components/form/`** and **`src/components/result/`** are presentation only. They receive state and callbacks from `App.tsx` via `FormPanel` / `ResultPanel`. `ResultPanel` consumes the **debounced** form snapshot, while form components mutate the live form state — this prevents typing lag in the result area.

### App-level invariants worth knowing before editing

- **App name guard**: when `form.name` is empty, the result panel shows a placeholder/example state and **does not call `buildPrompt`**. Don't add codepaths that compute prompts unconditionally.
- **Light/Dark cards**: `form.showBothModes === true` renders two cards (Light + Dark). Off renders a single Light card with no mode label, capped at `max-width: 640px`. Both modes must always include the explicit "background must cover the entire 600x600 frame" sentence — this is intentional (see SPEC §5.2) because models otherwise produce transparent or padded outputs.
- **Model tabs vs. Open in buttons**: The active tab determines which external action button is shown — `Open in ChatGPT` for `gpt-image`, `Open in Gemini` for `nano-banana`. Both buttons must **copy to clipboard first, then open the new tab**, in the same user-gesture context (mobile clipboard policy). Gemini has no URL prefill, so the toast explicitly tells the user to paste with ⌘V.
- **Clipboard fallback**: `src/lib/clipboard.ts` falls back to selecting the `<pre>` text when `navigator.clipboard.writeText` fails (non-https, permission denied). UI strings for both success and fallback toasts include the model + mode context per SPEC §4.4.
- **Keyword chips**: max 5, trim + case-insensitive dedupe. When 0 keywords are entered, the `Keywords:` line is omitted entirely *and* `<MOOD>` falls back to `modern, friendly` — see `buildPrompt.ts` and SPEC §5.4.

### Source of truth for product behavior

`SPEC.md` is the canonical product spec. When the spec and the code disagree, treat the spec as intent and the code as current state — but check git log before assuming the spec is more recent. The spec covers exact prompt slot rules, palette/style metadata, toast copy, and a11y requirements; consult it before changing prompt output, copy, or layout breakpoints.

## Build / Deploy notes

- Vite `base` is `'/app-in-toss-logo-maker/'` — required for GitHub Pages. Keep this in sync with the repo name. `npm run preview` and production both serve from this path.
- `.github/workflows/deploy.yml` runs on push to `main`: `npm ci` → `npm test` → `npm run build` → `actions/deploy-pages`. **Tests are gating** — a failing prompt test will block deploy. GitHub Pages source must be set to **GitHub Actions** in repo settings.
- UI copy is Korean; generated prompts are English. Don't translate the prompt template.
