# 인앱토스 미니앱 로고 메이커 — 이미지 후처리 모듈 Spec

> 본 문서는 [SPEC.md](./SPEC.md)에 추가되는 신규 기능의 스펙이다.
> SPEC.md §11 "비목표"에 명시된 *"600x600 자동 리사이즈 도구"* 항목은 본 스펙이 채택됨에 따라 **범위 안으로 이동**한다.
> 본 스펙과 SPEC.md가 충돌하면 본 스펙이 우선한다(후처리 영역 한정).

## 1. 한 줄 정의
사용자가 1단계에서 만든 프롬프트로 ChatGPT·Gemini에서 **직접 생성한 이미지**를, 2단계에서 업로드해 **600x600 정사각**으로 리사이즈하고 **우하단 가시 워터마크 영역을 인페인팅**해 깔끔한 미니앱 로고 PNG를 만들어 주는 부가 도구. 1단계와 동일하게 **100% 클라이언트 사이드**에서 동작한다.

## 2. 핵심 결정 요약

| 항목 | 결정 |
|---|---|
| UI 배치 | **독립된 두 번째 탭** "이미지 후처리" (1단계 "프롬프트 생성"과 좌우 동등한 탭) |
| 탭 구현 | useState 기반 단순 탭 UI. **라우팅 라이브러리 미도입**, URL 해시 미사용 |
| 두 탭 간 상태 | **완전 독립**. 폼 컨텍스트(이름/모드)도 후처리 탭으로 넘기지 않음 |
| 워터마크 처리 | 우하단 **고정 10% 영역** edge-extend 인페인팅 (canvas 2D, 두 방향 평균) |
| 비율 보정 | 비정사각 입력은 **중앙 정사각 크롭** 후 600x600으로 리사이즈 |
| 입력 포맷 | PNG / JPG / WebP. **HEIC, GIF 등은 거부** |
| 입력 제한 | 파일당 최대 **10MB**, 한 번에 최대 **10장** |
| 입력 방식 | 드래그앤드롭 + 파일 다이얼로그. 다중 선택 지원 |
| 추가 업로드 | 결과 그리드가 있는 상태에서 추가 드롭 시 **이어붙이기** (총 10장 제한 내) |
| 처리 스레드 | **메인 스레드** + 이미지 단위 `requestAnimationFrame` 양보. Web Worker 미사용 |
| 진행 표시 | 항목별 상태 그리드(대기 / 처리중 / 완료 / 실패) |
| 일부 실패 | 성공한 항목만 다운로드에 포함. 실패는 카드별로 사유 표시 + 재시도 버튼 |
| 출력 형식 | **PNG 1종** |
| 다운로드 분기 | **1장 = PNG 직접 다운로드**, **2장 이상 = ZIP** |
| ZIP 라이브러리 | **JSZip** (다운로드 첫 클릭 시 동적 import — Tab 1만 쓰는 사용자에게 번들 부과 회피) |
| 출력 파일명 | `<원본 basename>-600.png` |
| 패치 영역 % | **10% 하드코딩** (Gemini 1024² 출력의 가시 워터마크 패딩 포함 실측 ~10%, 중앙 70% 심볼 영역과 비충돌), 사용자 노출 없음 |
| SynthID 고지 | 탭 상단 **접이식 알림 바** (기본 펼침 1회, 닫으면 localStorage에 기억) |
| localStorage | 후처리 탭은 이미지/결과 **저장하지 않음** (메모리 한정). SynthID 알림 닫음 여부만 기록 |

## 3. UI 진입 — 탭 구조

### 3.1 탭 컴포넌트
- 화면 최상단 (좌우 레이아웃 위, 헤더 아래)에 두 탭:
  - `프롬프트 생성` (기본, 기존 §3~§4 화면)
  - `이미지 후처리`
- 활성 탭은 shadcn `Tabs` 스타일에 맞춤. 탭은 단일 페이지 안에서 같은 `<main>` 영역을 토글로 교체.
- **라우팅 / URL 해시 미사용**. 새로고침하면 기본 탭(`프롬프트 생성`)으로 돌아옴 — 후처리 탭에는 영속 상태가 없으므로 사용자 손해가 없다.
- 탭 라벨에는 신규 표식(NEW 닷)을 두지 않는다 — 1단계의 "Open in" 토스트 등에 후처리 탭으로의 자연스러운 안내를 별도로 두지 않는다(완전 독립 결정).

### 3.2 후처리 탭 레이아웃
```
+-----------------------------------------------------------+
|  [프롬프트 생성]  [이미지 후처리★]                       |
+-----------------------------------------------------------+
|  ▼ 이 도구는 가시 워터마크만 처리합니다 (접이식 알림)     |
|     · Gemini의 SynthID(보이지 않는 워터마크)는 제거 X     |
|     · 본인 소유·권한이 있는 이미지에만 사용하세요         |
+-----------------------------------------------------------+
|                                                           |
|   ┌─ 드롭 영역 ─────────────────────────────────────┐     |
|   │  📷  여기로 이미지를 드래그하거나 클릭해 선택   │     |
|   │      PNG · JPG · WebP / 최대 10장 / 장당 10MB    │     |
|   └──────────────────────────────────────────────────┘     |
|                                                           |
|   결과 그리드 (3열, 모바일 1열)                            |
|   ┌─ logo-light.png ─┐ ┌─ logo-dark.png ─┐ ┌─ … ─┐        |
|   │ ┌─Before─┐┌After-│ │ ┌─Before─┐┌After-│ │ ...  │        |
|   │ │  256  ││  300 │ │ │  256  ││  300 │ │      │        |
|   │ └────────┘└──────│ │ └────────┘└──────│ │      │        |
|   │  ✓ 완료          │ │  ⏳ 처리 중      │ │      │        |
|   │  [×]            │ │                  │ │      │        |
|   └──────────────────┘ └──────────────────┘ └──────┘        |
|                                                           |
|   [ ZIP 다운로드 (3 파일) ]   [ 모두 비우기 ]              |
+-----------------------------------------------------------+
```
- 드롭 영역은 항상 노출. 결과가 있어도 사라지지 않음(추가 업로드용).
- 결과 그리드는 결과가 0건이면 숨김.
- 다운로드 버튼은 **성공 항목 1개 이상**일 때만 활성. 라벨은 성공 카운트 반영.
- "모두 비우기"는 결과 그리드와 메모리 상태를 일괄 초기화. 1차 클릭 시 확인 팝오버(SPEC.md §3-8과 같은 패턴).

### 3.3 SynthID / 정책 고지 알림
- 탭 활성화 시 상단에 접이식 알림 카드(shadcn `Alert`):
  - 제목: `이 도구는 가시 워터마크 영역만 처리합니다`
  - 본문 (3줄):
    1. `Gemini가 함께 삽입하는 보이지 않는 SynthID 워터마크는 제거되지 않으며, 결과물이 AI 생성 이미지라는 사실은 변하지 않습니다.`
    2. `본인이 소유하거나 사용 권한이 있는 이미지에만 사용하세요.`
    3. `각 모델의 이용약관과 결과물 정책을 따르는 책임은 사용자에게 있습니다.`
  - 우상단 `[닫기]` 버튼 → 닫으면 `app-in-toss-logo-maker:v1:postprocess.dismissNotice = "1"` 저장. 닫힘 상태에서는 알림 자체가 사라지고, 드롭존 영역 우상단에 작은 ⓘ 아이콘만 남아 클릭 시 다시 펼쳐진다(접힌 상태의 한 줄 요약은 두지 않음 — 닫음의 의미를 살림).
- 알림 톤: 담백, 비-경고색(neutral). 빨강·노랑 대신 슬레이트.

## 4. 입력 처리

### 4.1 드롭 영역 동작
- 마크업: `<label>` 안에 hidden `<input type="file" accept="image/png,image/jpeg,image/webp" multiple>`을 배치. 시각적 영역(`<div>`)에 dragenter/dragover/dragleave/drop 핸들러를 건다.
  - `<button>`이 아닌 `<label>`을 쓰는 이유: 일부 브라우저에서 `<button>` 위 drag/drop 이벤트 전파가 어색할 수 있고, `<label>`은 키보드 Enter/Space → 파일 다이얼로그 오픈을 자동 처리한다.
- 드래그 진입 시 영역에 강조 보더 + 배경. `dragleave` / `drop` 처리.
- 동시 드롭 N장 = 그대로 큐에 추가. **거부 사유가 있는 파일은 그리드에 "거부됨" 카드로 노출** (사용자가 왜 안 들어갔는지 알 수 있게).
- 클립보드 붙여넣기(Ctrl/⌘+V) 지원은 **비목표** (1단계에서 결정).

### 4.2 입력 검증 (거부 사유)
| 사유 | 거부 메시지 |
|---|---|
| MIME이 png/jpeg/webp 아님 | `지원하지 않는 형식이에요. PNG, JPG, WebP만 처리할 수 있어요.` |
| 파일 크기 > 10MB | `파일이 너무 커요 (최대 10MB).` |
| 총 파일 수 > 10장 | `한 번에 최대 10장까지만 처리할 수 있어요. 일부만 추가했어요.` |
| canvas decode 실패 | `이미지를 읽을 수 없어요. 파일이 손상됐을 수 있어요.` |
| 디코딩 후 픽셀 크기 > 4096×4096 | `이미지가 너무 커요 (최대 4096px). 작게 줄여서 다시 올려주세요.` |

- 총 10장 초과는 **앞에서부터 채울 수 있는 만큼만** 받고 나머지를 한 번에 거부 토스트.
- 검증은 두 단계: (1) `File` 메타 단계, (2) `<img>` decode 후 픽셀 크기 단계.

### 4.3 처리 큐
- 입력 → `PendingItem` 상태로 그리드에 즉시 노출 (썸네일은 `URL.createObjectURL`로 빠르게 표기).
- 큐는 **순차 처리** (한 번에 하나씩). 각 아이템 사이에 `await new Promise(r => requestAnimationFrame(r))`로 1프레임 양보 → 입력 핸들 차단 방지.
- 각 아이템 처리 종료 후 `URL.revokeObjectURL` + 원본 ImageBitmap close. 결과 PNG는 `Blob`으로 보관.

## 5. 처리 파이프라인

각 이미지는 다음 단계로 가공된다.

```
File
 → decode: createImageBitmap(blob, { imageOrientation: 'from-image' })
   ※ EXIF 회전 자동 적용 — 모바일 카메라 JPG의 가로/세로 뒤집힘 방지
 → 5.1 정사각 보정 (중앙 크롭)
 → 5.2 인페인팅 (우하단 10% edge-extend)
 → 5.3 600x600 리사이즈
 → encode PNG (canvas.toBlob → null이면 §7.2 실패)
```

### 5.1 정사각 보정
- 입력 `(W, H)`. `S = min(W, H)`.
- 시작점 `sx = (W - S) / 2`, `sy = (H - S) / 2`.
- `drawImage(src, sx, sy, S, S, 0, 0, S, S)`로 크기 `S` 정사각 캔버스에 그림.
- 비정사각이라 "내용을 잘랐을 수 있다"는 안내는 결과 카드에 작은 뱃지로 노출(§7.1).

### 5.2 인페인팅 — 우하단 edge-extend
- 패치 사이즈: `P = round(S * 0.10)` (10%, 하드코딩 상수 `WATERMARK_PATCH_RATIO = 0.10`).
  - 근거: Gemini 1024² 출력의 가시 워터마크 배지(패딩 포함) 실측 ~10%. 7%로는 빠듯하고, 중앙 70% 심볼 영역과는 충돌하지 않는다(여유 = 50% - 35% - 10% = 5%).
- 패치 사각형: `(S - P, S - P, P, P)`.
- 채우기는 **두 방향 edge-extend의 픽셀 평균**:
  1. **수직 stretch (좌측 띠 기반)**: 패치 좌측 바깥 **3픽셀 폭** 띠 `(S - P - 3, S - P, 3, P)`를 읽어 가로 평균(채널별)으로 1픽셀 컬럼을 만들고, 그 컬럼을 패치 가로 전체에 stretch → `P × P` 결과 A.
     - 3픽셀 띠를 쓰는 이유: 워터마크의 안티앨리어싱·드롭 섀도우가 패치 경계 바로 바깥 1px까지 번져 있을 수 있어 단일 픽셀 샘플은 워터마크 색을 다시 끌고 들어옴. 3px 평균으로 그 영향을 희석.
  2. **수평 stretch (상단 띠 기반)**: 패치 상단 바깥 **3픽셀 높이** 띠 `(S - P, S - P - 3, P, 3)`를 같은 방식으로 평균하여 1픽셀 행을 만들고, 패치 세로 전체에 stretch → `P × P` 결과 B.
  3. **A와 B를 ImageData 픽셀 단위로 산술 평균**하여 패치에 `putImageData`. `globalAlpha`로 합성하면 알파 곱셈이 끼어들어 정확한 50:50이 안 되므로 픽셀 평균으로 단순화 — 단위 테스트도 가능.
- 효과: 단색·그라디언트·세로 줄무늬·가로 줄무늬 배경 모두 자연스럽게 연장. 로고 본체(중앙 70%)는 영향받지 않음(SPEC.md §5.1).
- **한계**:
  - 로고 외곽이 우하단에 닿는 디자인은 약간 변형될 수 있다 — §7.1 뱃지 + §11 비목표.
  - GPT-Image처럼 가시 워터마크가 없는 출력에도 동일하게 패치를 적용한다. 깨끗한 우하단을 edge-extend하므로 미세한 색띠가 생길 수 있으나, 모델별 분기를 두지 않는 단순성을 우선 — 실측상 시각적으로 거의 인지되지 않는 수준.
- **검증 절차**: PP2 종료 시점에 Gemini 출력 골든 샘플 5장(단색/그라디언트/세로줄/가로줄/사진 배경) 으로 시각 회귀 비교. 패치 경계의 RGB 거리 임계 통과 시 PP3로 진입(§12 PP2.5).

### 5.3 600x600 리사이즈
- 5.2 결과(`S × S`)를 일반 `HTMLCanvasElement` 600×600에 `drawImage`로 다운/업스케일.
  - `OffscreenCanvas`는 사용하지 않음(메인 스레드에서 이점 적고, Safari 16.3 미만 미지원).
- 다운스케일 품질: `imageSmoothingEnabled = true`, `imageSmoothingQuality = 'high'`.
- 입력이 600 미만이라도 거부하지 않고 600으로 업스케일 (안내 뱃지 노출, §7.1).
- 인코딩: `canvas.toBlob(blob => …, 'image/png')`. 메모리 부족으로 `blob === null`이면 §7.2 실패 처리(특히 iOS Safari에서 4096² 입력 누적 시 빈번).

### 5.4 모듈 경계 (계산층 / 캔버스층 분리)
- 5.1~5.3은 `src/lib/image/` 모듈로 분리. React/storage 의존 없음.
- canvas 2D API 호출은 본질적으로 DOM 의존이므로 `buildPrompt`처럼 완전 순수는 불가. 다음과 같이 **계산층 / 캔버스층 두 단계**로 분리한다.
  - **계산층 (순수, node 환경 vitest 가능)**: 좌표·치수·플래그·파일명·픽셀 평균 — `cropToSquare(W, H) → { sx, sy, S }`, `resizeTo600(S) → { upscaled }`, `filename(name, existing) → string`, `inpaintEdgeAverage(pixels, width, height, P) → Uint8ClampedArray`(픽셀 버퍼만 받는 순수 함수).
  - **캔버스층 (얇은 어댑터, 자동 단위 테스트 대상 아님)**: ImageBitmap/HTMLCanvasElement를 받아 계산층 결과를 `drawImage`/`putImageData`로 적용. 검증은 §5.2의 골든 샘플 시각 회귀로 대체(§12 PP2.5).
- 외부 canvas polyfill(node-canvas, jsdom-canvas 등)은 **추가하지 않는다** (8.3 의존성 정책과 정합).

## 6. 출력 / 다운로드

### 6.1 파일명
- 원본 `File.name`에서 확장자를 떼고 `-600.png` 접미사.
  - `logo-light.png` → `logo-light-600.png`
  - `IMG_4821.JPG` → `IMG_4821-600.png`
  - `사진 (1).webp` → `사진 (1)-600.png`
- 동일 basename 충돌 시 `-600 (2).png`, `-600 (3).png` 식으로 카운터 부여.
  - **충돌 비교 스코프 = 같은 ZIP 다운로드에 포함되는 항목 집합**, 다운로드 시점에 결정. 큐 추가 시점이 아닌 이유: 큐에서 카드 제거/추가가 빈번하므로 추가 시점 결정은 의미 없음.
- ZIP 자체 파일명: `app-in-toss-logos-600-YYYYMMDD-HHmm.zip` (사용자 로컬 시간 기준). 같은 세션에서 재다운로드 시 OS가 자동으로 ` (1)` 접미사를 붙여 어느 파일이 최신인지 헷갈리는 문제를 방지.

### 6.2 다운로드 분기
- 성공 카운트 = 1: 버튼 라벨 `PNG 다운로드`, 클릭 → 단일 PNG `Blob`을 `<a download>`로 저장. JSZip 미사용.
- 성공 카운트 ≥ 2: 버튼 라벨 `ZIP 다운로드 (N개)`, 클릭 → **첫 클릭 시 `await import('jszip')` 동적 import** 후 묶어 단일 zip blob 저장.
  - 정적 import 거부 사유: Tab 1만 쓰는 사용자(다수)에게 ~30KB(gzip)를 부과하지 않기 위함. 첫 ZIP 다운로드 시 100~200ms 추가 로딩이 붙지만, 사용자는 이미 처리 결과를 본 뒤이므로 인지 비용이 낮다. 두 번째 다운로드부터는 import 캐시되어 즉시.
- 다운로드 후 토스트: `다운로드를 시작했어요.` (모델/모드 컨텍스트 없음 — 1단계와 달리 후처리는 모델 분기가 없다.)

### 6.3 결과 그리드
- 3열 그리드 (모바일 1열). 카드 1개 = 입력 1개에 1:1 대응.
- 카드 구성:
  - 헤더: 원본 파일명 (truncate)
  - 본문: Before(원본 썸네일, 약 96–128px) + After(600 결과 썸네일) 가로 배치
  - 상태 뱃지: `대기` / `처리 중…` / `완료` / `실패` / `거부됨`
  - 보조 뱃지(필요 시):
    - `정사각 크롭됨` (입력 비율이 정사각이 아닐 때)
    - `업스케일됨` (입력 픽셀이 600 미만일 때)
  - 우상단 `[×]` 버튼 — 카드 단위 제거
- 클릭 동작: 카드 클릭 시 After 이미지를 풀스크린 모달로 확대(우/좌측 화살표로 카드 간 이동). Before/After 비교 슬라이더는 **초기 범위 외**.
- 메모리: 카드 제거나 "모두 비우기" 시 해당 ObjectURL/Blob 해제.

## 7. 엣지 케이스 / 예외 처리

### 7.1 안내 뱃지
| 조건 | 뱃지 | 설명 |
|---|---|---|
| 입력 W ≠ H | `정사각 크롭됨` | 중앙 정사각으로 잘랐다는 안내 |
| 입력 `min(W,H) < 600` | `업스케일됨` | 600 미만을 600으로 키웠다는 안내 |
| 입력이 600 정사각이고 메타 변경 없음 | (뱃지 없음) | 사실상 패치만 적용 |

### 7.2 실패 처리
- 카드에 `실패` 뱃지 + 사유 한 줄. 사유별 메시지:
  - 디코딩 실패: `이미지를 읽을 수 없어요.`
  - `canvas.toBlob`이 null 반환 (메모리 부족, iOS Safari에서 4096² 누적 시 빈번): `메모리가 부족해요. 다른 카드를 비우거나 작은 이미지로 다시 시도해 주세요.`
  - 그 외 예외: `처리 중 오류가 발생했어요.`
- 카드에 `재시도` 버튼 노출 → 같은 `File` 객체로 다시 큐 투입.
- 한 카드 실패는 다른 카드 처리에 영향 없음(독립 큐).

### 7.3 다중 처리 중 추가 드롭
- 처리 중 새 파일 드롭 → 큐 끝에 추가. UI는 막지 않음.
- 총합 10장 초과는 §4.2 규칙대로 일부만 수락.

## 8. 기술 구조

### 8.1 디렉토리 (신규/추가)
```
src/
  App.tsx                              // 탭 분기 추가
  components/
    layout/
      AppTabs.tsx                      // ★ 신규: 두 탭 컨테이너
    postprocess/                       // ★ 신규
      PostProcessPanel.tsx             // 후처리 탭 루트
      DropZone.tsx                     // 드롭 + 파일 input
      SynthIdNotice.tsx                // 접이식 고지
      ResultGrid.tsx                   // 결과 그리드
      ResultCard.tsx                   // Before/After 카드
      DownloadBar.tsx                  // 다운로드 + 비우기
      PreviewModal.tsx                 // 클릭 확대
  lib/
    image/                             // ★ 신규
      cropToSquare.ts                  // 5.1 — 계산층(좌표) + 캔버스 어댑터
      inpaintWatermark.ts              // 5.2 — 캔버스 어댑터
      inpaintEdgeAverage.ts            // 5.2 — 계산층 (Uint8ClampedArray 픽셀 평균, 순수)
      resizeTo600.ts                   // 5.3 — 계산층(플래그) + 캔버스 어댑터
      processImage.ts                  // 5.1→5.3 파이프라인
      filename.ts                      // 6.1 파일명 규칙 (순수)
      constants.ts                     // WATERMARK_PATCH_RATIO, EDGE_BAND_PX 등
    zip.ts                             // ★ 신규: JSZip 동적 import 래퍼
  hooks/
    usePostProcessQueue.ts             // ★ 신규: 큐 + rAF 양보
    // 탭 상태는 App.tsx에서 useState<'prompt' | 'postprocess'>로 인라인 관리 (별도 훅 미도입)
```

### 8.2 핵심 타입
```ts
type PostProcessStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'failed'
  | 'rejected';

interface PostProcessItem {
  id: string;                  // crypto.randomUUID
  file: File;                  // 원본
  filename: string;            // 출력 파일명 (다운로드 시점에 충돌 회피 후 확정)
  sourceUrl: string;           // ObjectURL (썸네일용)
  resultBlob?: Blob;           // 600x600 PNG (status === 'done'일 때만 존재)
  resultUrl?: string;          // ObjectURL (resultBlob과 동시 존재)
  status: PostProcessStatus;
  flags?: {                    // 처리 완료 후에만 채워짐
    croppedToSquare: boolean;
    upscaled: boolean;
  };
  error?: string;              // status === 'failed' | 'rejected'일 때
}

interface ProcessImageInput {
  bitmap: ImageBitmap;
}
interface ProcessImageOutput {
  blob: Blob;                  // image/png, 600x600
  flags: { croppedToSquare: boolean; upscaled: boolean };
}
function processImage(input: ProcessImageInput): Promise<ProcessImageOutput>;
```

### 8.3 의존성
- 신규 추가: **`jszip`** (`dependencies`에 추가하되 코드에서는 `await import('jszip')`로 동적 import — §6.2 참조). Vite는 동적 import를 자동으로 별도 청크로 분리하므로 별도 `manualChunks` 설정 불필요.
- 그 외 신규 외부 의존성 추가 금지 — 인페인팅·리사이즈는 모두 표준 canvas 2D API로 구현. canvas polyfill(node-canvas, jsdom-canvas 등)도 도입하지 않음(§5.4).
- shadcn 컴포넌트 추가: `Tabs`(이미 존재), `Alert`, `Dialog`(미리보기 모달).

### 8.4 localStorage
- SPEC.md §3 정책에 따라 키 prefix `app-in-toss-logo-maker:v1:` 사용.
- 후처리 탭이 쓰는 키:
  - `app-in-toss-logo-maker:v1:postprocess.dismissNotice` — `"1"` 또는 미존재
- **이미지/결과/큐는 localStorage에 저장하지 않는다** (용량·프라이버시).

### 8.5 메모리 관리
- 모든 ObjectURL은 카드 제거·"모두 비우기"·언마운트 시 `URL.revokeObjectURL`.
- 처리 직후 원본 `ImageBitmap`은 `.close()` 호출.
- 결과 `Blob`은 다운로드/제거 시까지만 유지. 사용자가 탭을 떠나면 메모리에 남지만 새로고침 시 휘발(저장 안 함).

### 8.6 테스트 전략

**단위 테스트 (Vitest, node 환경)** — 계산층(§5.4) 한정. canvas API 의존 없음:
- `cropToSquare(W, H)` — 가로 긴 입력, 세로 긴 입력, 정사각 입력의 sx/sy/S 좌표.
- `resizeTo600(S)` — 다양한 입력 크기에서 업스케일 플래그가 맞는지(S < 600 여부).
- `filename(name, existingNames)` — basename·확장자 분리, 한글 파일명, 중복 카운터(같은 ZIP 스코프).
- `inpaintEdgeAverage(pixels, width, height, P)` — 합성 픽셀 버퍼(단색/그라디언트/세로 줄무늬/가로 줄무늬) 입력에서 패치 영역의 평균 RGB가 경계 띠 평균과 임계 이내인지.

**시각 회귀 (수동, 마일스톤 게이트)** — 캔버스층 검증:
- PP2 종료 시점에 Gemini 출력 골든 샘플 5장(단색/그라디언트/세로줄/가로줄/사진 배경)을 도구에 통과시켜 결과 PNG를 육안 + 픽셀 거리(워터마크 영역 RGB 거리 < 임계)로 비교.
- 자동화 안 함 — jsdom + canvas polyfill 도입 비용이 효용을 초과한다고 판단(§8.3 의존성 정책과 정합).

CI 게이트는 SPEC.md와 동일하게 `npm test` 실패 시 배포 차단. 시각 회귀는 게이트 아님(수동 체크포인트).

## 9. 접근성 (a11y)
- 드롭 영역: `<label>` + hidden `<input type=file>` 패턴(§4.1). Enter/Space로 파일 다이얼로그 오픈은 `<label>` 기본 동작으로 자동 처리.
- 그리드 카드: 카드 자체 `<article>` + `aria-label="<filename>, <status>"`.
- 상태 변화 시 화면 우상단 토스트 (`role="status"`, `aria-live="polite"`) — 시작/종료 **2회만** 발생, 카드별 완료 토스트는 두지 않음(소음 방지):
  - 시작: `3개 이미지 처리를 시작했어요.`
  - 종료: `2개 완료, 1개 실패했어요.`
- 색대비 WCAG AA, 포커스 링 유지(SPEC.md §8과 동일).
- 처리 중 키보드 입력: rAF 양보는 큐 **아이템 사이**에서만 일어나므로, 한 장의 큰 이미지(예: 4096²)를 처리하는 동안에는 메인 스레드가 1~3초간 잡힌다. 이는 Web Worker 미사용의 트레이드오프(§2)이며, 처리 중 카드에는 spinner와 "처리 중…" 라벨로 사용자에게 작업 중임을 명시한다.

## 10. 레이아웃 / 반응형
- 후처리 탭은 SPEC.md §7과 달리 **단일 컬럼**. 좌우 분할 미사용.
- 데스크톱 ≥768px: max-width 1024px 가운데 정렬.
- 모바일 <768px: 그리드 1열, 드롭 영역 풀폭.

## 11. 비목표 (Out of Scope)
- 보이지 않는 SynthID 워터마크 제거
- 사용자가 직접 마스크를 그리는 인페인팅
- 좌하단·우상단·중앙 등 **다른 위치**의 워터마크 제거
- AI 인페인팅(WASM 모델, 외부 API)
- JPG / WebP 출력
- 이미지 편집 기능 (밝기, 크롭 박스 조정, 회전)
- HEIC / GIF / SVG 입력
- 클립보드 붙여넣기 입력 (`Ctrl/⌘+V`)
- 결과 클립보드 복사 (PNG를 클립보드로)
- 처리 결과 / 큐의 localStorage·IndexedDB 영속화
- Web Worker / OffscreenCanvas 워커 분리
- Light/Dark **자동 감지** 후 패치 색 보정
- 1·2단계 탭 간 자동 컨텍스트 전달 (`form.name` → 다운로드 파일명 등)
- 11장 이상 배치 처리

## 12. 마일스톤 제안
1. **PP1 — 탭 골격**: `AppTabs`로 1단계 화면을 첫 탭에 그대로, 두 번째 탭은 빈 placeholder. 탭 상태는 `App.tsx`에 `useState<'prompt' | 'postprocess'>` 인라인.
2. **PP2 — 계산층 + 캔버스층**: `lib/image/*` 구현. 계산층(§5.4) 단위 테스트 통과. 캔버스층은 임시 페이지에서 수동 호출로 동작 확인.
3. **PP2.5 — 골든 샘플 검증 (게이트)**: Gemini 1024²·1536² 출력 5장(단색/그라디언트/세로줄/가로줄/사진)을 도구에 통과시켜 패치 결과를 육안 + RGB 거리 임계로 검증. 실패 시 §5.2의 패치 비율(`WATERMARK_PATCH_RATIO`)·샘플링 띠 폭(현재 3px) 조정 후 재시도. 통과해야 PP3 진입.
4. **PP3 — 입력/검증**: `DropZone`(label 패턴, §4.1) + 파일 검증(§4.2) + 거부 카드 + EXIF orientation 처리(§5).
5. **PP4 — 처리 큐 + 그리드**: `usePostProcessQueue` (rAF 양보) + `ResultGrid` + 상태 뱃지 + 보조 뱃지.
6. **PP5 — 다운로드**: 단일 PNG 분기 + JSZip **동적 import** 묶음, 파일명 충돌 회피(다운로드 시점 결정), ZIP 파일명 타임스탬프.
7. **PP6 — 알림/접근성/QA**: `SynthIdNotice`(닫음 = 완전히 사라지고 ⓘ 아이콘만 남음) + 토스트(시작/종료 2회) + a11y QA + 반응형 점검 + iOS Safari에서 4096² 한 장 + `toBlob` null 케이스 확인 + README의 1단계/2단계 안내 갱신.
