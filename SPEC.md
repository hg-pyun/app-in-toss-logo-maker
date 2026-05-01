# 인앱토스 미니앱 로고 메이커 — Spec

## 1. 한 줄 정의
사용자가 만들고 싶은 미니앱을 짧게 묘사하면, **GPT-Image / Gemini Nano Banana 용으로 최적화된 영어 프롬프트**를 즉시 생성·복사할 수 있게 해주는 정적 웹 도구. 사용자는 이 프롬프트를 자신이 쓰는 AI에 붙여넣어 직접 이미지를 생성한다.

## 2. 핵심 결정 요약

| 항목 | 결정 |
|---|---|
| Tech stack | Vite + React + TypeScript |
| UI 라이브러리 | shadcn/ui + Tailwind CSS |
| 프롬프트 생성 | **100% 클라이언트 템플릿**(LLM API 호출 없음) |
| 출력 언어 | 프롬프트는 영어, UI는 한국어 |
| 키워드 입력 | **영문 권장**, 한글 입력 시 그대로 사용 |
| 다크/라이트 | 두 모드 프롬프트를 **동시에** 두 카드로 노출 |
| 모델 분기 | `GPT-Image` / `Nano Banana` **탭**으로 분리 |
| Open in 버튼 | 활성 탭과 **매칭되는 모델만 노출** (GPT-Image→ChatGPT, Nano Banana→Gemini) |
| 사이트 테마 | 라이트모드 단일, 표준 모던 SaaS UI |
| 배포 | GitHub Actions (`actions/deploy-pages`) → GitHub Pages |
| 저장소 | `app-in-toss-logo-maker` (base: `/app-in-toss-logo-maker/`) |
| 분석 도구 | 없음 |

## 3. 입력 폼 (좌측)

필수 정책: **앱 이름만 필수**. 나머지는 비어있으면 프롬프트에서 해당 섹션을 자연스럽게 생략. 로고 스타일은 항상 기본값(`Flat Geometric`)이 들어 있어 사용자 입장에서는 추가 입력이 강제되지 않는다.

1. **앱 이름** (text, 필수)
2. **한 줄 설명** (textarea, 선택)
3. **키워드** (chip input, 선택, 최대 5개)
   - Enter / 쉼표로 추가, x로 제거
   - 입력 정규화: 앞뒤 공백 trim, 빈 문자열 무시, 대소문자 무시한 중복 차단
   - 5개 도달 시 추가 입력 무시
   - 입력란 도움말: `영문 권장 (예: clean, trustworthy, warm). 한글 입력도 가능하지만 모델 해석이 불안정할 수 있어요.`
4. **브랜드 컬러 팔레트** (preset, 선택, 단일 선택)
   - 16개 프리셋 (4×4 그리드):
     - Blue `#3182F6`
     - Sky `#38BDF8`
     - Teal `#0D9488`
     - Mint `#00C2A8`
     - Forest `#14B85F`
     - Lemon `#FFD93D`
     - Amber `#F59E0B`
     - Tangerine `#FB923C`
     - Coral `#FF6B6B`
     - Crimson `#E11D48`
     - Rose `#F472B6`
     - Violet `#A855F7`
     - Lavender `#8E7CFF`
     - Indigo `#4F46E5`
     - Slate `#64748B`
     - Charcoal `#1F2937`
   - 미선택 = "AI가 스타일에 맞춰 결정"
5. **로고 스타일** (dropdown, 기본값 = `Flat Geometric`)
   - 텍스트 + 한 줄 설명 형식
   - 10종:
     1. Flat Geometric — 면 분할 기반 모던 플랫
     2. Gradient Mesh — 부드러운 그라데이션 메시
     3. 3D Isometric — 입체감 있는 아이소메트릭
     4. Glassmorphism — 반투명 유리 질감
     5. Neumorphism — 부드러운 음영 뉴모피즘
     6. Line Art Mono — 단색 라인 아트
     7. Pixel/Retro — 픽셀/레트로 게임 풍
     8. Sticker Pop — 두꺼운 외곽선 스티커
     9. Minimal Symbol — 극도로 단순한 심볼
     10. Korean Calligraphy — 굵직한 느낌의 추상 동양 기호 (텍스트 아님)
6. **다크/라이트 토글** (switch)
   - ON: 라이트용·다크용 두 프롬프트 카드 동시 노출
   - OFF: 라이트용 단일 카드 (카드 헤더 라벨 없음)
7. **예시로 채우기** 버튼
   - 앱 이름이 비어있을 때 결과 패널 빈 상태(§4.3) 안에서만 노출. 클릭 시 데모 입력값 일괄 주입.
   - 폼 영역에는 별도로 노출하지 않는다 (단일 진입점 유지).
8. **초기화** 버튼
   - 폼 하단에 상시 노출 (입력값이 1개 이상일 때만 활성화)
   - 클릭 시 모든 입력 초기화 + localStorage 비움 → 7번 버튼이 다시 노출됨
   - 우발적 클릭 방지를 위해 1차 클릭 시 `정말 초기화?` 확인 팝오버

### 인터랙션
- **앱 이름이 비어있는 동안에는 결과 영역을 재계산하지 않음** — 우측은 빈 상태(§4.3) 유지
- 앱 이름이 채워진 이후 입력 변화 → 우측 결과 영역 **즉시 재계산** (디바운스 150ms)
- 모든 입력값 + 결과 상태 **localStorage 자동 저장 / 복원**
- 키 prefix: `app-in-toss-logo-maker:v1:`
- **스키마 마이그레이션 정책**: 향후 `v2:` 도입 시 마이그레이션 없이 v1 키는 무시. 사용자는 빈 폼으로 시작.

## 4. 결과 영역 (우측)

### 4.1 모델 탭
- `GPT-Image` / `Nano Banana` 두 탭. 기본 GPT-Image.
- 두 모델은 **프롬프트 미세 조정**이 다름 (§5 참조).
- 탭별로 노출되는 Open in 버튼이 다름 (§4.2).

### 4.2 모드 카드
- 다크/라이트 토글 ON일 때 **카드 2장** (Light / Dark)
- OFF일 때 **카드 1장** (라벨 없음)
- 각 카드 구성:
  - 헤더: `Light Mode` / `Dark Mode` 라벨 (토글 ON일 때만)
  - 본문: 영어 프롬프트 (구조화 10~14줄, 모노스페이스 폰트)
  - 액션 행:
    - `복사` (primary) — 클립보드 복사
    - 활성 탭이 `GPT-Image`일 때: `Open in ChatGPT`
    - 활성 탭이 `Nano Banana`일 때: `Open in Gemini`
- 단일 카드(다크 토글 OFF) 노출 시 카드 max-width = 640px, 우측 패널 안에서 좌측 정렬 (sticky 위치 유지).

### 4.3 빈 상태
- 앱 이름이 비어있을 때:
  - 예시 프롬프트 (gray placeholder) + `예시로 채우기` 버튼 — §3-7의 단일 진입점
  - 예시 시드: 이름="가계부 미니앱", 설명="간단한 수입/지출 기록", 키워드=["clean","trustworthy","warm"], 컬러=Mint, 스타일=Flat Geometric

### 4.4 복사 피드백
- 버튼 텍스트 `복사` → `복사됨 ✓` (2초)
- 화면 우상단 토스트 (`role="status"`, `aria-live="polite"`):
  - 다크 토글 ON: `GPT-Image용 라이트 모드 프롬프트가 복사되었어요`
  - 다크 토글 OFF: `GPT-Image 프롬프트가 복사되었어요` (모드 라벨 생략)
- 모델/모드 컨텍스트를 토스트 문구에 명시해 사용자가 헷갈리지 않게.
- 클립보드 API 미지원 / 권한 거부 fallback: 카드 본문을 자동 select 상태로 두고 토스트에 `자동 복사가 막혔어요. 텍스트가 선택돼 있으니 ⌘C로 복사하세요.` 안내.

## 5. 프롬프트 템플릿

### 5.1 공통 골격 (구조화 중간 길이)
```
Create a square 1:1 mini-app icon, designed for 600x600 export.
Subject: <NAME>, <DESCRIPTION>
Keywords: <KEYWORDS_JOINED>
Style: <STYLE_NAME> — <STYLE_DETAIL>
Composition: a single centered symbol filling 70% of the canvas,
  layered on top of a fully opaque background that bleeds edge-to-edge
  across the entire 600x600 frame, sharp 90° square corners,
  no rounded edges, no transparency, no border padding, no margins.
Background: <BG_DIRECTION>
<PALETTE_LINE>
Mood: <MOOD>, modern, friendly, suitable for a Korean
  fintech mini-app surface.
Constraints: no text, no letters, no numbers, no watermarks,
  no real-world brand logos, no human faces. The background must always
  be present behind the logo and fully cover the 600x600 frame —
  never transparent, never cropped, never with margins or padding.
Output: 1:1 square, fully opaque edge-to-edge background,
  ready for 600x600 export.
```

슬롯 채움 규칙:
- `<KEYWORDS_JOINED>`: 입력 키워드를 콤마로 결합 (예: `clean, trustworthy, warm`)
- `<MOOD>`: 키워드 그대로 콤마 결합. 키워드가 0개면 `<MOOD>`를 `modern, friendly` 단독으로 대체 (뒤의 고정 문구는 그대로)
- `<PALETTE_LINE>`: 팔레트 선택 시 `Palette: built around <PALETTE_NAME> (<PALETTE_HEX>), with harmonious supporting tones chosen by you.`, 미선택 시 `Palette: choose harmonious tones that match the style.`
- `<BG_DIRECTION>`: §5.2 모드 변형으로 치환
- `<STYLE_DETAIL>`: 각 스타일에 대한 짧은 영문 설명(예: `Flat Geometric — clean geometric shapes, vector-friendly, no gradients`)을 `lib/prompt/styles.ts`에 표로 보유

### 5.2 모드 변형
공통 원칙: **배경은 반드시 존재해야 하고, 600x600 프레임을 가장자리까지 완전히 채워야 한다** (투명·여백·크롭 금지). 두 변형 모두 이 문장을 명시적으로 포함한다.

- **Light Mode** 카드: `Background: bright, soft, off-white-leaning composition with gentle depth. The background must always exist behind the logo and completely cover the entire 600x600 frame edge-to-edge, with no transparent areas, no white margins, no padding, and no empty space.`
- **Dark Mode** 카드: `Background: deep, low-key composition (charcoal/midnight family) with subtle inner glow. The background must always exist behind the logo and completely cover the entire 600x600 frame edge-to-edge, with no transparent areas, no margins, no padding, and no empty space.`

### 5.3 모델 변형
| 영역 | GPT-Image | Nano Banana |
|---|---|---|
| 어조 | "Create a square 1:1 mini-app icon..." (지시형) | "Generate a single square mini-app icon image..." (생성 동사) |
| 포맷 명시 | `Output: 1:1 square, opaque background` | `Aspect ratio: 1:1. Solid opaque background.` |
| 제약 표현 | `no rounded edges, no text` (간결한 부정) | `Use sharp 90° corners. Avoid any text or letters.` (긍정 + Avoid) |
| 끝부분 추가 | — | `Render once. Do not produce variants.` |

### 5.4 빈 필드 / 가변 입력 처리
| 입력 상태 | 동작 |
|---|---|
| 앱 이름 비어있음 | 결과 영역은 §4.3 빈 상태 유지, 프롬프트 미생성 |
| 한 줄 설명 비어있음 | `Subject: <NAME>` (콤마 없이) |
| 키워드 0개 | `Keywords:` 라인 자체 생략 + `<MOOD>` = `modern, friendly` |
| 키워드 1~5개 | `Keywords: kw1, kw2, ...` + `<MOOD>` = `kw1, kw2, ...` |
| 팔레트 미선택 | `<PALETTE_LINE>` = `Palette: choose harmonious tones that match the style.` |

### 5.5 600x600 처리
- 프롬프트에 `1:1` + `designed for 600x600 export` 명시
- 결과 카드 하단에 작게 안내: *"두 모델 모두 보통 1024 이상으로 출력합니다. 600x600은 다운로드 후 직접 리사이즈해 주세요."*

## 6. 외부 링크 동작

공통 동작 순서 (모바일 클립보드 정책 호환):
1. **먼저 클립보드에 복사** (사용자 제스처 컨텍스트 안에서 수행)
2. 그 다음 새 탭으로 외부 URL 열기
3. 토스트로 결과 안내

### Open in ChatGPT (GPT-Image 탭에서만 노출)
- URL: `https://chatgpt.com/?q=<encodeURIComponent(prompt)>`
- prefill은 로그인/플랜 상태에 따라 동작하지 않을 수 있음 → **항상 클립보드 복사를 함께 수행** (best-effort prefill)
- 토스트: `ChatGPT 탭이 열렸어요. 자동으로 입력되지 않으면 ⌘V로 붙여넣으세요.`

### Open in Gemini (Nano Banana 탭에서만 노출)
- URL: `https://gemini.google.com/app` (URL prefill 미지원)
- 동작: 클립보드 복사 → 새 탭 열기
- 토스트: `Gemini 탭이 열렸어요. 프롬프트가 클립보드에 있으니 ⌘V로 붙여넣으세요.`

## 7. 레이아웃

### Desktop (≥768px)
```
+------------------+----------------------+
|  Form (좌)       |  Result (우)         |
|  - 이름          |  [GPT-Image | Nano]  |
|  - 설명          |  ┌─Light─┐ ┌─Dark─┐  |
|  - 키워드 chips  |  │prompt│ │prompt│  |
|  - 팔레트        |  │[Copy]│ │[Copy]│  |
|  - 스타일        |  │[Open]│ │[Open]│  |
|  - 다크 토글     |  └──────┘ └──────┘  |
|  - 초기화        |                      |
+------------------+----------------------+
```
- 좌: 40%, 우: 60%
- 우측 sticky scroll
- 단일 카드 노출 시 카드 max-width 640px, 우측 패널 안에서 좌측 정렬

### Mobile (<768px)
- 세로 스택: Form → Result
- 결과 카드는 가로 스크롤 X, 세로로 쌓임
- 카드 width = 100%

## 8. 기술 구조

### 디렉토리
```
src/
  App.tsx
  main.tsx
  components/
    form/
      AppNameInput.tsx
      DescriptionInput.tsx
      KeywordChips.tsx
      PalettePicker.tsx
      StyleSelect.tsx
      DarkModeToggle.tsx
      FillExampleButton.tsx
      ResetButton.tsx
    result/
      ResultPanel.tsx
      ModelTabs.tsx
      PromptCard.tsx        // light/dark 모드 카드
      CopyButton.tsx
      OpenInButton.tsx
    ui/                      // shadcn 컴포넌트
  lib/
    prompt/
      buildPrompt.ts         // 핵심: 입력 → 프롬프트 텍스트
      styles.ts              // 10개 스타일 메타
      palettes.ts            // 8개 팔레트 메타
      modelVariants.ts       // gpt-image / nano-banana 변형
    storage.ts               // localStorage wrapper
    clipboard.ts             // copy + selectable fallback
  hooks/
    useFormState.ts          // 입력 상태 + localStorage 동기화
    useDebouncedValue.ts
  types.ts
```

### 핵심 타입
```ts
type StyleId =
  | 'flat-geometric' | 'gradient-mesh' | 'isometric-3d'
  | 'glassmorphism' | 'neumorphism' | 'line-art-mono'
  | 'pixel-retro' | 'sticker-pop' | 'minimal-symbol'
  | 'korean-calligraphy';

type PaletteId =
  | 'toss-blue' | 'mint' | 'coral' | 'lavender'
  | 'lemon' | 'charcoal' | 'forest' | 'rose'
  | null; // 미선택

type ModelId = 'gpt-image' | 'nano-banana';
type ModeId = 'light' | 'dark';

interface FormState {
  name: string;
  description: string;
  keywords: string[];
  paletteId: PaletteId;
  styleId: StyleId;
  showBothModes: boolean;
}

interface PromptArgs extends FormState {
  model: ModelId;
  mode: ModeId;
}

function buildPrompt(args: PromptArgs): string;
```

### 의존성 (최소)
- `react`, `react-dom`
- `tailwindcss`
- shadcn/ui로 추가될 컴포넌트만: `Button`, `Input`, `Textarea`, `Select`, `Tabs`, `Switch`, `Toast`, `Popover`
- `clsx` (선택)
- 그 외 외부 의존성 추가 금지

### 접근성 (a11y)
- 모든 입력 요소에 명시적 `<label>` 연결
- 키워드 chip: `role="listitem"`, 삭제 버튼은 `aria-label="키워드 삭제: <text>"`
- 토스트: `role="status"` + `aria-live="polite"`
- 색대비: 본문 텍스트와 인터랙티브 요소 모두 WCAG AA (4.5:1) 이상
- 키보드: Tab 순서는 폼 위→아래, 결과 영역은 탭 → 카드별 본문 → 액션 버튼 순. 모든 액션은 Enter/Space로 실행 가능
- 포커스 링: shadcn 기본 ring 유지, 제거 금지

### 클립보드 fallback
- `navigator.clipboard.writeText` 시도 → 실패 시 카드 본문 `<pre>`를 자동 select + §4.4 안내 토스트
- non-https 환경(예: 로컬 file://)에서도 동일 fallback 동작

## 9. 배포

### Vite 설정
- `vite.config.ts`: `base: '/app-in-toss-logo-maker/'`
- HashRouter 불필요 (라우팅 없음, 단일 페이지)

### GitHub Actions
- `.github/workflows/deploy.yml`
- 트리거: `push` to `main`
- 단계: checkout → setup node → `npm ci` → `npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`
- GitHub Pages source: **GitHub Actions** (브랜치 배포 방식 미사용)

### 도메인
- `https://<user>.github.io/app-in-toss-logo-maker/`
- 커스텀 도메인 추후 검토.

## 10. 푸터 / SEO

### 푸터
- 한 줄: `Made for in-Toss mini-app makers · GitHub`
- GitHub 링크 1개

### `<head>` 메타
- `<title>인앱토스 로고 메이커</title>`
- `<meta name="description" content="인앱토스 미니앱용 로고 프롬프트를 만들어 ChatGPT·Gemini에 붙여넣을 수 있는 도구">`
- `og:title`, `og:description`, `og:image`
- OG 이미지 사양: **1200×630 PNG**, `public/og.png`, 한 장 정적 사용
- favicon 1개 (`favicon.svg`)

## 11. 비목표 (Out of Scope)
- LLM API 호출
- 사용자 계정 / 로그인
- 결과 이미지 직접 생성 (이미지 모델 호출)
- 결과 이미지 갤러리 / 저장소
- 다국어 UI
- 라우팅 / About 페이지
- 분석 도구
- 결과 변형 ("Surprise me", A/B 변형)
- 프롬프트 히스토리
- 600x600 자동 리사이즈 도구
- 한↔영 키워드 자동 번역 (영문 권장 안내만 제공)

## 12. 마일스톤 제안
1. **M1 — 골격**: Vite 셋업, shadcn 설치, base path, 좌우 레이아웃
2. **M2 — 입력**: 폼 컴포넌트 8종(예시/초기화 포함) + 스타일/팔레트 메타 + localStorage
3. **M3 — 프롬프트 엔진**: `buildPrompt` + 모델/모드 변형 + 단위 테스트 (빈 필드 / 가변 키워드 / 팔레트 미선택 / 모델별 변형 케이스 커버)
4. **M4 — 결과 UI**: 탭, 카드 1·2장 분기, 복사 + 클립보드 fallback, 매칭 모델 Open in 버튼, 토스트
5. **M5 — 빈 상태/예시 시드**: `예시로 채우기`, 빈 필드 생략 처리, 앱 이름 빈 상태 가드
6. **M6 — 접근성/배포**: a11y QA, GitHub Actions, OG 이미지, 푸터, 메타
