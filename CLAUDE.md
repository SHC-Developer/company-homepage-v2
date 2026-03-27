# 대한민국상이군경회시설사업소 홈페이지 v2

## 프로젝트 개요
대한민국상이군경회시설사업소 공식 홈페이지 리디자인 프로젝트.
목표: 고급 한국 기업 홈페이지 수준의 세련된 디자인 (JISEUNG 등 레퍼런스 기준).

## 기술 스택
- React + TypeScript + Vite + Tailwind CSS
- 라우터: React Router DOM
- 아이콘: Lucide React

## 프로젝트 경로
```
C:\Users\kdvo\OneDrive\Desktop\02. private\01. company homepage\03. company homepage v2\facility-trust-hub-main
```

## 주요 파일
- `src/components/LandingSections.tsx` — 메인 랜딩 7섹션 (가장 많이 수정)
- `src/components/Navigation.tsx` — 상단 네비게이션 바
- `src/pages/Index.tsx` — 루트 페이지, activeIndex 상태 관리
- `src/components/ScrollToTop.tsx` — 우하단 버튼
- `src/index.css` — CSS 변수(디자인 토큰)
- `index.html` — Google Fonts 로드

## 디자인 토큰
- 주색: `#0B1C2B` (딥 네이비), `#1D66B3` (블루 포인트)
- `--font-logo`: Noto Serif KR (회사명 등 강조 텍스트)
- `--font-korean`: Noto Sans KR (본문)
- 사이트맵 배경: `radial-gradient(ellipse at 50% 45%, #122438 0%, #0B1C2B 55%, #060f18 100%)`

## 레이아웃 구조
- **7섹션 scroll-snap**: Hero(0) → Slides 1~5 → Sitemap(6)
- 인디케이터: Sitemap 섹션(index 6)에서 숨김 처리
- 네비게이션 정렬 기준: `max(1.5rem, calc((100vw - 90rem) / 2 + 1.5rem))`
- `--vh`: 모바일 주소창 대응용 CSS 변수 (`calc(var(--vh, 1vh) * 100)`)

## 사이트 구조 (네비게이션)
```
회사소개 → /greeting
  ├── 인사말 (#ceo-message)
  ├── 회사연혁 (#company-history)
  ├── 보유면허 및 기술 (#license)
  └── 조직구성 (#organization-chart)
관계법령 → /legal-basis
분야별 수행실적 → /portfolio
  ├── 안전진단 (#portfolio-safety-bridge-tunnel)
  ├── 설계 (#portfolio-design)
  └── 건설사업관리 (#portfolio-supervision)
자료실 → /recruit
```

## 4대 사업 분야
안전진단전문기관 | 엔지니어링사업 | 건설엔지니어링업 | 초경량비행장치사용사업

## 연락처 정보 (footer에 사용)
- TEL: 02)572-6218
- FAX: 050-5115-9274
- ADD: 경기도 성남시 분당구 판교역로 230, 907호 (삼환하이펙스B동, 삼평동)
- © 2026 대한민국상이군경회시설사업소. All rights reserved.

## public 폴더 주요 파일
- `/대한민국상이군경회시설사업소 지명원.pdf` — 다운로드용
- `/certification/` — 등록증·특허증 이미지
- `/portfolio/` — 현장 사진 (performance1~N.jpg 등)
- `/video/` — 히어로 배경 영상

## 개발 서버
- 서버명: `facility-trust-hub-v2`
- 포트: 8081

---

## 작업 원칙 (반드시 준수)

### 디자인 기준
1. **비례와 여백에 민감** — 텍스트·카드·간격 크기 하나하나가 중요. "살짝", "적절히" 요청 시 과하지 않게 조정.
2. **중복 제거 우선** — 네비게이션 바에 이미 있는 정보(회사명, 사업분야 등)는 섹션 안에 반복하지 않음.
3. **고급 기업 홈페이지 감도** — 단순 기능 구현보다 시각적 퀄리티 우선. 애니메이션·hover·폰트 디테일에 신경 씀.
4. **정보 위계 명확히** — 텍스트 크기·색상 대비로 메인/서브 계층 구조가 드러나야 함.

### 커뮤니케이션 원칙
5. **다음 단계 확인 질문 금지** — "다음으로 넘어갈까요?" 같은 질문 하지 말 것. 사용자가 직접 지시함.
6. **결정 후 즉시 실행** — 옵션 선택 후 추가 확인 없이 바로 진행.
7. **수정 후 스크린샷 확인** — 코드 수정 완료 시 반드시 preview 스크린샷으로 결과 검증.
8. **수정 작업 후 개선안 제안 3가지"" - 코드 수정 완료 시 반드시 다음으로 수정하면 좋을 개선안에 대해 3가지씩 제안.