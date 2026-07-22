# 오늘의아이 (Today Child) — MVP 목업

> 오늘 우리 아이에게 가장 필요한 한 가지. 매일 딱 하나의 육아 미션만 알려주는 서비스 목업입니다.

## 기술 스택 (표준 오픈소스 — 특정 플랫폼 종속 없음)

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 7 |
| 스타일 | Tailwind CSS 4 + shadcn/ui |
| 라우팅 | Wouter |
| 패키지 매니저 | pnpm (npm/yarn도 사용 가능) |

어떤 AI 코딩 도구(Cursor, Copilot, ChatGPT, Claude 등)나 로컬 개발 환경에서도 수정할 수 있습니다.

## 실행 방법

```bash
pnpm install   # 또는 npm install
pnpm dev       # 또는 npm run dev → http://localhost:3000
pnpm build     # 프로덕션 빌드
```

## 핵심 파일 구조

```
client/src/
  pages/Home.tsx        ← 앱 전체 화면 (온보딩 → 오늘의 카드 → 완료)
  lib/missions.ts       ← 월령별 미션 데이터 DB (콘텐츠 수정은 여기)
  index.css             ← 글로벌 테마 (색상 팔레트, 폰트)
client/index.html       ← 폰트 로드 (Gowun Batang + Pretendard)
```

## 서비스 컨셉 요약

- **하루 딱 하나**: 개월수 선택 → 오늘의 미션 카드 1장 (30초 안에 읽고 3분 안에 실행)
- **개인정보 미수집**: 회원가입 없음. 개월수는 브라우저 localStorage에만 저장
- **신뢰 포지셔닝**: "세계 최고 소아과 기관(AAP·CDC·NHS·WHO·Harvard)과 국내 공공기관(질병관리청·보건복지부·대한소아청소년과학회)의 자료를 부모가 바로 실천할 수 있게 재구성" — AI를 전면에 내세우지 않음
- **카드 구성**: 제목 / 소요시간 / 준비물 난이도(★) / "이렇게 말해보세요" / 실행 단계 / 안 하면 대처법 / 발달 근거 + 다중 출처 뱃지

## 콘텐츠 수정 방법

`client/src/lib/missions.ts`의 `Mission` 객체를 수정/추가하면 됩니다:

```ts
{
  category: "놀이",            // 놀이|대화|책|생활습관|발달|안전|부모팁
  title: "컵 쌓기 놀이",
  prep: "종이컵 3개",
  prepStars: 4,                // 5 = 준비물 없음
  time: "3분",
  say: "\"우와, 높이 쌓았네!\"",
  how: ["단계 1...", "단계 2..."],
  ifNot: "아이가 안 하면 대처법",
  why: "발달 근거 설명",
  sources: ["AAP 미국소아과학회", "대한소아청소년과학회"],
}
```

## 참고

- 현재 미션 콘텐츠는 **예시 데이터**입니다. 실제 서비스 전 기관 원문 기반 검증이 필요합니다.
- 이미지 에셋(로고, 히어로, 완료 일러스트)은 `/manus-storage/` URL을 참조합니다. 다른 환경으로 이전 시 이미지를 다운로드해 원하는 호스팅으로 교체하세요.
