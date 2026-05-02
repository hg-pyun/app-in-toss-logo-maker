# 인앱토스 로고 메이커

인앱토스(in-Toss) 미니앱용 로고 아이콘을 만들기 위한 두 단계 도구.

1. **프롬프트 생성** 탭 — 앱 정보를 짧게 입력해 GPT-Image / Gemini Nano Banana 용 영어 프롬프트를 즉시 만든다.
2. **이미지 후처리** 탭 — 위 프롬프트로 직접 생성한 이미지를 600×600으로 정사각 보정·우하단 워터마크 영역 인페인팅·PNG로 정리한다.

> 이미지 자체를 생성하지는 않는다. 두 단계 모두 **100% 클라이언트 사이드** 정적 도구다 (네트워크 의존 없음, localStorage 외 영속 저장 없음).

## Sample
아래 이미지는 생성기를 사용해 만든 이미지 샘플

### Logo
<img width="600" height="600" alt="profile-maker_600x600" src="https://github.com/user-attachments/assets/1a440df8-c289-41bf-ba73-bc517df1a956" />

### Thumbnail
<img width="1932" height="828" alt="profile_maker_thumbnail" src="https://github.com/user-attachments/assets/eef83839-0996-484a-ab7b-f87ea6607035" />

## 주요 기능

### 1단계: 프롬프트 생성

- **클라이언트 템플릿 기반 프롬프트 생성** — LLM API 호출 없음, 네트워크 의존성 없음
- **모델별 변형** — `GPT-Image` / `Nano Banana` 탭. 어조·출력 명시·제약 표현이 모델에 맞게 다르게 채워진다
- **라이트/다크 모드 동시 출력** — 토글 ON 시 두 카드 동시 노출
- **Open in 버튼** — 활성 탭에 따라 ChatGPT 또는 Gemini로 새 탭 오픈 (클립보드 복사 후 이동)
- **입력값 자동 저장** — `localStorage` 자동 저장/복원, 150ms 디바운스 후 결과 재계산
- **앱 이름 가드** — 앱 이름이 비어있는 동안에는 결과 영역이 빈 상태(예시 + `예시로 채우기` 버튼)로 유지됨

### 2단계: 이미지 후처리

- **드롭/선택 → 큐 처리** — PNG/JPG/WebP 최대 10장, 장당 10MB. createImageBitmap의 EXIF orientation 자동 적용
- **우하단 가시 워터마크 인페인팅** — 패치 10% 영역을 좌측·상단 띠 평균으로 edge-extend. 워터마크 안티앨리어싱이 새어들지 않도록 3px 안쪽 띠를 평균
- **600×600 정사각 출력** — 비정사각 입력은 중앙 크롭, 600 미만은 업스케일 (각각 카드에 보조 뱃지)
- **다운로드 분기** — 1장 = PNG 직접 다운로드, 2장 이상 = ZIP (JSZip은 첫 다운로드 시 동적 import)
- **카드 클릭 풀스크린 미리보기** — 좌우 화살표/ESC 키 지원
- **SynthID 알림** — 가시 워터마크만 제거함을 명시. 닫음 상태는 localStorage에 영속

> 두 단계 탭은 완전 독립이다. 1단계 폼 컨텍스트(앱 이름 등)는 2단계로 넘어가지 않는다. 2단계의 이미지/결과/큐는 메모리에만 보관되고 새로고침 시 초기화된다.

### 공통

- **접근성** — 모든 입력에 라벨, 토스트 `role="status"` + `aria-live="polite"`, 키보드 내비게이션, WCAG AA 색대비

## 기술 스택

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix Primitives)
- 후처리: 표준 Canvas 2D API (Web Worker / OffscreenCanvas / canvas polyfill 미사용), JSZip (동적 import)
- Vitest — 프롬프트 빌더 + 이미지 계산층(좌표/플래그/파일명/픽셀 평균) + 파일 검증 단위 테스트
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

### 1단계: 프롬프트 생성 → 외부 도구로 이미지 생성

1. 좌측 폼에서 **앱 이름**(필수), 한 줄 설명, 키워드(최대 5개), 컬러 팔레트, 로고 스타일을 입력
2. 다크/라이트 토글로 결과 카드 1장 또는 2장 분기
3. 우측 결과 카드에서 모델 탭(GPT-Image / Nano Banana)을 선택
4. `복사` 버튼으로 클립보드 복사, 또는 `Open in ChatGPT` / `Open in Gemini` 로 외부 도구로 이동
5. 외부 도구에 붙여넣어 이미지를 생성하고 다운로드

> 키워드는 영문 권장. 한글 입력도 가능하지만 모델 해석이 불안정할 수 있다.

### 2단계: 이미지 후처리 → 600×600 PNG 정리

1. 상단 `이미지 후처리` 탭으로 이동
2. 1단계에서 받아온 이미지(들)를 드롭존에 드래그하거나 클릭으로 선택 (최대 10장, 장당 10MB)
3. 큐가 자동 처리. 카드별로 Before/After 썸네일 + 상태 뱃지(`대기` → `처리 중…` → `완료`/`실패`)가 노출됨
4. 카드 클릭 → 풀스크린 미리보기 (좌우 화살표 / ESC)
5. 1장은 `PNG 다운로드`, 2장 이상은 `ZIP 다운로드 (N개)`. ZIP 파일명은 `app-in-toss-logos-600-YYYYMMDD-HHmm.zip` 형태로 타임스탬프 포함

> 본 도구의 인페인팅은 가시 워터마크 영역만 처리한다. Gemini가 함께 삽입하는 보이지 않는 SynthID 워터마크는 제거되지 않으며, 결과물이 AI 생성 이미지라는 사실은 변하지 않는다. 본인 소유·권한이 있는 이미지에만 사용할 것.

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
    form/         # 1단계 입력 컴포넌트 + FormPanel
    result/       # 1단계 결과 패널 (탭, 카드, 복사/Open 버튼)
    layout/       # AppTabs (1단계 / 2단계 탭 컨테이너)
    postprocess/  # 2단계: DropZone, ResultGrid, ResultCard, DownloadBar,
                  #        SynthIdNotice, PreviewModal, types
    ui/           # shadcn 컴포넌트 (Button, Tabs, Switch, Toast 등)
  lib/
    prompt/       # buildPrompt + styles / palettes / modelVariants 메타
    image/        # cropToSquare / inpaintEdgeAverage / inpaintWatermark /
                  # resizeTo600 / processImage / filename / validateFile / constants
    zip.ts        # JSZip 동적 import 래퍼 + 타임스탬프 + Blob 다운로드 트리거
    storage.ts    # localStorage wrapper (key prefix: app-in-toss-logo-maker:v1:)
    clipboard.ts  # writeText + select 기반 fallback
  hooks/          # useFormState, useDebouncedValue, usePostProcessQueue
```

### 후처리 파이프라인 요약

```
File
 → createImageBitmap(blob, { imageOrientation: 'from-image' })
 → cropToSquare       (W,H → sx,sy,S; 중앙 크롭)
 → inpaintWatermark   (우하단 10%, 좌측·상단 3px 띠 평균을 픽셀 평균)
 → resizeTo600        (S=600, imageSmoothingQuality='high')
 → canvas.toBlob('image/png')
```

계산층(`lib/image/*`의 좌표·플래그·파일명·픽셀 평균 함수)은 순수 함수로 분리해 vitest로 검증한다. 캔버스 어댑터(getImageData/putImageData/drawImage)는 자동 단위 테스트 대상이 아니며, 실제 Gemini 출력 골든 샘플로 시각 회귀 검증을 거쳤다.

## 배포

`main` 푸시 시 `.github/workflows/deploy.yml` 이 다음을 수행:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. `actions/upload-pages-artifact` → `actions/deploy-pages`

GitHub Pages source 는 **GitHub Actions** 모드여야 한다 (브랜치 배포 미사용).
배포 URL: `https://<user>.github.io/app-in-toss-logo-maker/`

## 비목표

- 1단계: LLM API 호출, 사용자 계정, 이미지 직접 생성, 결과 갤러리, 다국어 UI, 라우팅, 분석 도구, 프롬프트 히스토리, 한↔영 자동 번역
- 2단계: 보이지 않는 SynthID 제거, 사용자 마스크 인페인팅, 좌하단/우상단/중앙 등 다른 위치 워터마크, AI 인페인팅, JPG/WebP 출력, 일반 이미지 편집, HEIC/GIF/SVG 입력, 클립보드 붙여넣기, 결과/큐 영속화, Web Worker, 1↔2단계 자동 컨텍스트 전달, 11장 이상 배치

자세한 내용은 `SPEC.md` §11 + `SPEC-image-postprocess.md` §11 참고.

## 라이선스

[MIT](./LICENSE)
