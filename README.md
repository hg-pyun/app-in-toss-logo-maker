# 인앱토스 로고 메이커

**인앱토스(in-Toss) 미니앱용 로고를 만들기 위한 정적 웹 도구.**
짧은 입력 몇 줄로 ChatGPT·Gemini에 그대로 붙여넣을 영어 프롬프트를 만들고, 받아온 이미지를 600×600 PNG로 깔끔하게 정리한다.

🔗 **[지금 써보기 →](https://hg-pyun.github.io/app-in-toss-logo-maker/)**

---

## 무엇을 해주나요?

미니앱 로고를 직접 손으로 그리기는 부담스럽고, AI에 매번 그럴듯한 프롬프트를 작성해 넣기도 번거롭다. 이 도구는 그 두 단계를 모두 줄여준다.

| 단계 | 입력 | 결과 |
|---|---|---|
| **① 프롬프트 생성** | 앱 이름·간단한 설명·키워드·컬러·스타일 | GPT-Image / Gemini Nano Banana 용 영어 프롬프트 (라이트/다크 모드) |
| **② 이미지 후처리** | ①의 프롬프트로 직접 만든 이미지 (PNG/JPG/WebP, 최대 10장) | 600×600 정사각 PNG, 우하단 가시 워터마크 정리됨 |

이미지 자체를 생성하지는 않는다. **프롬프트와 후처리만** 해주는 100% 클라이언트 사이드 도구다 — 입력은 브라우저 밖으로 나가지 않으며, 네트워크 호출도 없다.

---

## 샘플

이 도구로 실제 만든 결과물.

### Logo (600×600)

<img width="600" height="600" alt="profile-maker_600x600" src="https://github.com/user-attachments/assets/1a440df8-c289-41bf-ba73-bc517df1a956" />

### Thumbnail

<img width="1932" height="828" alt="profile_maker_thumbnail" src="https://github.com/user-attachments/assets/eef83839-0996-484a-ab7b-f87ea6607035" />

---

## 사용 흐름

### ① 프롬프트 만들기

좌측 폼에 앱 정보를 입력하면 우측에 즉시 프롬프트가 채워진다.

1. **앱 이름** 입력 (예: "가계부 미니앱") — 이름이 비어있는 동안에는 결과가 만들어지지 않는다
2. 한 줄 설명, 키워드(최대 5개), 컬러 팔레트, 로고 스타일을 취향대로 채운다
3. 다크/라이트 토글로 결과 카드 1장 또는 2장으로 분기
4. 모델 탭에서 GPT-Image / Nano Banana 중 어디에 쓸지 선택
5. **`복사`** 또는 **`Open in ChatGPT`** / **`Open in Gemini`** 버튼으로 외부 도구로 이동
6. 외부 도구에서 이미지를 만들고 다운로드

> 💡 키워드는 영문을 권장한다. 한글도 가능하지만 모델 해석이 흔들릴 수 있다.

### ② 받아온 이미지 정리하기

상단 **`이미지 후처리`** 탭으로 이동.

1. 다운로드한 이미지를 드롭존에 드래그하거나 클릭으로 선택 (한 번에 최대 10장)
2. 카드별로 자동 처리 — 비정사각이면 중앙 크롭, 600 미만이면 업스케일, 우하단 워터마크 영역은 가장자리 색으로 인페인팅
3. 카드를 클릭하면 풀스크린 미리보기 (좌우 화살표 / ESC)
4. 1장은 **`PNG 다운로드`**, 2장 이상은 **`ZIP 다운로드`** — ZIP 파일명에는 자동으로 타임스탬프가 붙는다 (`app-in-toss-logos-600-YYYYMMDD-HHmm.zip`)

처리는 새로고침과 함께 휘발된다. 결과 이미지는 localStorage에 저장하지 않는다.

---

## 핵심 특징

- **한 번 입력하면 두 모델 어디에도** — GPT-Image와 Nano Banana는 어조·출력 명시·제약 표현이 달라야 가장 잘 작동한다. 입력은 한 번이면 되고, 모델 탭만 바꾸면 그에 맞춰 프롬프트가 다시 채워진다.
- **라이트/다크 동시 출력** — 하나의 입력에서 두 톤의 프롬프트를 같은 화면에 띄워, 두 가지를 한 번에 만들고 비교할 수 있다.
- **모바일 클립보드 정책 호환** — `Open in` 버튼은 클립보드 복사를 먼저 수행한 뒤 새 탭을 연다. 모바일 사파리에서도 prefill 실패 시 ⌘V로 즉시 붙여넣을 수 있다.
- **워터마크 정리 ≠ 가짜 만들기** — 후처리는 우하단 가시 워터마크 영역만 처리한다. Gemini가 함께 삽입하는 보이지 않는 SynthID는 손대지 않으며, 결과물이 AI 생성 이미지라는 사실은 변하지 않는다. 본인 소유·권한이 있는 이미지에만 사용할 것.
- **입력값 자동 저장 / 결과는 휘발** — 1단계의 폼은 localStorage에 자동 저장되어 새로고침 후에도 그대로. 2단계의 이미지/큐는 메모리에만 두며 새로고침 시 초기화된다 (용량·프라이버시).

---

## 개발

```bash
npm install
npm run dev          # 개발 서버
npm test             # vitest (계산층 + 검증 + 프롬프트)
npm run build        # tsc -b && vite build
npm run lint         # tsc -b --noEmit
```

기술 스택: Vite + React 18 + TypeScript, Tailwind + shadcn/ui (Radix), 후처리는 표준 Canvas 2D API + JSZip(동적 import).

상세 설계·결정 근거는 [`SPEC.md`](./SPEC.md) (1단계)와 [`SPEC-image-postprocess.md`](./SPEC-image-postprocess.md) (2단계) 참고. Claude Code 작업 가이드는 [`CLAUDE.md`](./CLAUDE.md).

배포는 `main` 푸시 시 GitHub Actions가 자동으로 GitHub Pages에 올린다. Vite `base`가 `/app-in-toss-logo-maker/`로 잡혀 있으니 저장소 이름을 바꾸면 함께 맞춰야 한다.

---

## 라이선스

[MIT](./LICENSE)
