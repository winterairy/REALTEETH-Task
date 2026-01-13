# ☀️ 날씨 정보 애플리케이션

기상청 단기예보 API와 카카오 Local API를 기반으로, 현재 위치 또는 검색한 지역의 최신 날씨 정보를 보여주는 웹 애플리케이션입니다.

---

## 🚀 프로젝트 실행 방법

### 1️⃣ 환경 변수 설정

루트 디렉토리에 `.env` 파일을 생성하고 아래와 같이 API 키를 입력하세요.

```env
VITE_API_KEY=기상청_공공데이터_API_키
VITE_KAKAO_API_KEY=카카오_로컬_API_키
2️⃣ 의존성 설치
bash
npm install
3️⃣ 개발 서버 실행
bash
npm run dev
브라우저에서 http://localhost:5173으로 접속합니다.

4️⃣ 프로덕션 빌드
bash
npm run build
빌드 결과물은 dist/ 폴더에 생성됩니다.

5️⃣ 빌드 미리보기
bash
npm run preview
```

## 🧩 기술 스택

| 구분           | 사용 기술                             |
| -------------- | ------------------------------------- |
| **프레임워크** | React, TypeScript, Vite               |
| **상태 관리**  | TanStack Query (React Query)          |
| **라우팅**     | React Router DOM                      |
| **스타일링**   | Tailwind CSS, @heroicons/react        |
| **외부 API**   | 기상청 단기예보 API, 카카오 Local API |

## ✨ 주요 기능

### 🔍 1. 현재 위치 기반 날씨 조회

- 브라우저 Geolocation API로 사용자 위치 자동 감지

- 실시간 날씨 정보 표시

- 카카오 Local API를 이용한 좌표 ↔ 주소 변환

### 🗺️ 2. 지역 검색

- korea_districts.json 기반 지역 검색 구현

- 입력 시 Debounce (300ms)로 최적화

- 최대 100개의 결과 제한

- 검색된 지역 좌표로 날씨 연동

### 🌡️ 3. 날씨 정보 표시

- 현재 기온 / 최고·최저 기온

- 8시간 단위 예보

- 날짜별 주간 예보 탐색

### ⭐ 4. 즐겨찾기 관리

- 최대 6개 지역 저장 (FIFO 방식)

- sessionStorage에 데이터 보관

- 중복 추가 시 최신 순으로 재배치

- 이름 수정 및 삭제 모달 제공

### 🔄 5. 자동 데이터 갱신

- 매 정각 자동 갱신

- React Query 캐싱 전략으로 API 호출 최소화

### ⚠️ 6. 에러 처리

- 호출 실패 시 사용자 메시지 표시

- 데이터 미제공 지역 예외 처리

- Mock 데이터 기반 Fallback 제공

## 🧠 기술적 의사결정 및 이유

### 🧩 Feature-Sliced Design (FSD)

- 기능 단위로 모듈화하여 유지보수성과 확장성 확보

- 레이어 의존성이 명확해 순환 참조 방지

- 협업 시 일관된 구조 유지

```md
app → pages → widgets → features → entities → shared
```

### ⚡ TanStack Query (React Query)

- 서버 상태와 클라이언트 상태를 분리

- 자동 캐싱·재시도·백그라운드 갱신으로 UX 향상

- 로딩/에러 상태 자동 관리

### 🎨 Tailwind CSS

- 유틸리티 퍼스트 방식으로 빠른 스타일링

- 반응형 디자인에 용이

- 사용하지 않는 스타일은 빌드시 제거 (번들 최소화)

### 📚 Queue 기반 즐겨찾기 관리

- FIFO 로직으로 6개 제한 및 순서 유지

- 중복 시 재등록하여 최신 사용 지역 유지

- sessionStorage 연동으로 세션 내 상태 보존

### 🧭 기상청 Grid 좌표계 변환

- 기상청 API는 Grid 좌표계 사용

- 위·경도(WGS84) → Grid 변환 알고리즘 구현

### 🔗 URL 쿼리 파라미터 상태 관리

- 쿼리 파라미터를 통해 상태 유지 및 전달

- 브라우저 앞으로/뒤로 가기 지원

- 새로고침 시에도 화면 상태 보존

### 🛡️ TypeScript

- 명확한 타입 정의로 런타임 오류 방지

- IDE 자동완성으로 생산성 향상

- API 응답 구조 명세로 코드 신뢰성 강화

### ⚙️ Vite

- CRA 대비 압도적으로 빠른 빌드 및 HMR

- ES 모듈 기반으로 번들 크기 최소화

#### Alias 설명

- @/app/\* 애플리케이션 초기화 레이어
- @/pages/\* 페이지 레이어
- @/widgets/\* 위젯 레이어
- @/features/\* 기능 레이어
- @/entities/\* 엔티티 레이어
- @/shared/\* 공용 리소스 (UI, 타입, 유틸 등)

### 🔒 환경 변수 관리

- .env 파일로 API 키 보호

- import.meta.env를 이용해 환경별 구분 가능

## 🏗️ 프로젝트 구조 (FSD)

```md
src/
├── app/ # 애플리케이션 초기화
│ ├── providers/ # 전역 Context, Theme 등
│ ├── routing/ # 라우팅 설정
│ └── index.tsx
│
├── pages/ # 페이지 레이어
│ └── home/
│ ├── ui/
│ └── index.ts
│
├── widgets/ # 독립적인 UI 블록
│ └── [widget-name]/
│ ├── ui/
│ └── index.ts
│
├── features/ # 사용자 기능 레이어
│ └── [feature-name]/
│ ├── ui/
│ ├── model/
│ ├── api/
│ └── index.ts
│
├── entities/ # 비즈니스 로직
│ └── [entity-name]/
│ ├── ui/
│ ├── model/
│ ├── api/
│ └── index.ts
│
└── shared/ # 공용 리소스
├── ui/
├── lib/
├── api/
├── config/
├── types/
├── constants/
├── assets/
└── styles/
```

## 🧭 보완해야할 점

- 공공데이터 포털 API 호출
  - 날씨 API 호출할 `base_time` 옵션을 `0200`으로 고정해둬서 이후 날씨가 변경됐을 때 반영이 어려움.
  - API 데이터를 가져오는 샘플코드가 XHR 형식으로 제공되어있는데, 시간상 한계로 fetch 구조로 변경하지 못함.
  - 제공 시 빈번하게 발생하는 문제인지, 에러를 자주 일으키고 데이터를 불러오지 못하는 경우가 간혹 발생함. 캐싱과 목업 데이터로 예외처리를 했으나 안정성 높은 API로 교체가 필요함.
- FSD 아키텍처
  - 구조를 사용해본 경험이 부족해 파일과 로직 분리가 명확하게 됐는지 알 수 없음.
- 스타일 및 애니메이션
  - UI 이동 흐름이 좀더 매끄럽게 느껴져 UX를 향상시킬 수 있도록 보완 필요.

📘 참고 자료

- [FSD 아키텍처 공식 문서서](https://feature-sliced.design/kr/docs/get-started/overview)
- [FSD 아키텍처 적용기 : "이 코드는 어디에 넣어야 할까?" FSD가 답해준 코드 위치의 명확성](https://tech.kakaopay.com/post/fsd/)
- [FSD(Feature-Sliced Design) 완벽 가이드](https://velog.io/@clydehan/FSDFeature-Sliced-Design-%EC%99%84%EB%B2%BD-%EA%B0%80%EC%9D%B4%EB%93%9C)
- [기상청 단기예보 조회서비스 API 사용하기](https://velog.io/@ksj0314/%EA%B8%B0%EC%83%81%EC%B2%AD%EB%8B%A8%EA%B8%B0%EC%98%88%EB%B3%B4-%EC%A1%B0%ED%9A%8C%EC%84%9C%EB%B9%84%EC%8A%A4-API-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
