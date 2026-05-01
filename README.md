# 인앱토스 로고 메이커

인앱토스(in-Toss) 미니앱용 로고 아이콘을 만들기 위한 **영어 프롬프트 생성기**.
앱 정보를 짧게 입력하면 GPT-Image / Gemini Nano Banana 에 그대로 붙여넣을 수 있는 영어 프롬프트를 즉시 만들어 준다.

> 이미지 자체를 생성하지는 않는다. **프롬프트만** 만들어 주는 100% 클라이언트 사이드 정적 도구다.

## 주요 기능

- **클라이언트 템플릿 기반 프롬프트 생성** — LLM API 호출 없음, 네트워크 의존성 없음
- **모델별 변형** — `GPT-Image` / `Nano Banana` 탭. 어조·출력 명시·제약 표현이 모델에 맞게 다르게 채워진다
- **라이트/다크 모드 동시 출력** — 토글 ON 시 두 카드 동시 노출
- **Open in 버튼** — 활성 탭에 따라 ChatGPT 또는 Gemini로 새 탭 오픈 (클립보드 복사 후 이동)
- **입력값 자동 저장** — `localStorage` 자동 저장/복원, 150ms 디바운스 후 결과 재계산
- **앱 이름 가드** — 앱 이름이 비어있는 동안에는 결과 영역이 빈 상태(예시 + `예시로 채우기` 버튼)로 유지됨
- **접근성** — 모든 입력에 라벨, 토스트 `role="status"` + `aria-live="polite"`, 키보드 내비게이션, WCAG AA 색대비

## 기술 스택

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix Primitives)
- Vitest (프롬프트 빌더 단위 테스트)
- GitHub Actions → GitHub Pages 배포

## 시작하기

```bash
npm install
npm run dev          # 개발 서버
npm test             # 단위 테스트 (buildPrompt)
npm run build        # tsc -b && vite build
npm run preview      # 빌드 결과 로컬 미리보기
npm run lint         # 타입 체크 (tsc -b --noEmit)
```

Vite `base`가 `/app-in-toss-logo-maker/` 로 설정돼 있어 `npm run preview` 시 해당 경로로 열린다.

## 사용 흐름

1. 좌측 폼에서 **앱 이름**(필수), 한 줄 설명, 키워드(최대 5개), 컬러 팔레트, 로고 스타일을 입력
2. 다크/라이트 토글로 결과 카드 1장 또는 2장 분기
3. 우측 결과 카드에서 모델 탭(GPT-Image / Nano Banana)을 선택
4. `복사` 버튼으로 클립보드 복사, 또는 `Open in ChatGPT` / `Open in Gemini` 로 외부 도구로 이동
5. 외부 도구에 붙여넣어 이미지 생성. 600x600은 다운로드 후 직접 리사이즈

> 키워드는 영문 권장. 한글 입력도 가능하지만 모델 해석이 불안정할 수 있다.

## 프롬프트 템플릿 구조

`src/lib/prompt/buildPrompt.ts` 가 모든 입력을 영어 프롬프트로 직렬화한다. 출력 라인 구성:

```
<opening>                  # 모델별 (GPT-Image: 지시형 / Nano Banana: 생성형)
Subject: <NAME>[, <DESCRIPTION>]
Keywords: kw1, kw2, ...     # 키워드 0개면 라인 생략
Style: <Label> — <영문 디테일>
Composition: ...           # 600x600, edge-to-edge, 90° corners 고정
Background: <라이트/다크 변형>
Palette: ...               # 선택 시 hex 포함, 미선택 시 "choose harmonious tones..."
Mood: <kw 또는 modern, friendly>, modern, friendly, suitable for a Korean fintech mini-app surface.
Output / Aspect ratio ...  # 모델별 출력 명시 + 제약
[Render once. Do not produce variants.]   # Nano Banana 한정 trailing
```

세부 슬롯 채움 규칙은 `SPEC.md` §5 참고. 빈 필드 / 가변 키워드 / 팔레트 미선택 케이스는 `buildPrompt.test.ts` 로 커버한다.

## 디렉토리 구조

```
src/
  App.tsx, main.tsx, types.ts
  components/
    form/         # 8개 입력 컴포넌트 + FormPanel
    result/       # 결과 패널, 탭, 카드, 복사/Open 버튼
    ui/           # shadcn 컴포넌트 (Button, Tabs, Switch, Toast 등)
  lib/
    prompt/       # buildPrompt + styles / palettes / modelVariants 메타
    storage.ts    # localStorage wrapper (key prefix: app-in-toss-logo-maker:v1:)
    clipboard.ts  # writeText + select 기반 fallback
  hooks/          # useFormState, useDebouncedValue
```

## 배포

`main` 푸시 시 `.github/workflows/deploy.yml` 이 다음을 수행:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. `actions/upload-pages-artifact` → `actions/deploy-pages`

GitHub Pages source 는 **GitHub Actions** 모드여야 한다 (브랜치 배포 미사용).
배포 URL: `https://<user>.github.io/app-in-toss-logo-maker/`

## 비목표

LLM API 호출, 사용자 계정, 이미지 직접 생성, 결과 갤러리, 다국어 UI, 라우팅, 분석 도구, 프롬프트 히스토리, 한↔영 자동 번역은 다루지 않는다. 자세한 내용은 `SPEC.md` §11 참고.

## 라이선스

[MIT](./LICENSE)
