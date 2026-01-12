# 날씨 정보 애플리케이션

기상청 단기예보 API와 카카오 Local API를 활용한 날씨 정보 조회 애플리케이션입니다.

## 프로젝트 실행 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 필요한 환경변수를 세팅합니다.

```env
VITE_API_KEY=기상청_공공데이터_API_키
VITE_KAKAO_API_KEY=카카오_로컬_API_키
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.

### 4. 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 5. 빌드 미리보기

빌드 결과를 미리보려면:

```bash
npm run preview
```

## 사용한 기술 스택

### 프론트엔드 프레임워크 및 라이브러리

- **React** 
- **TypeScript**
- **Vite** 

### 상태 관리 라이브러리

- **TanStack Query (React Query)** 
    - 서버 상태 관리 및 캐싱
  - 자동 캐싱, 재시도 로직, 백그라운드 업데이트 등 제공

### 라우팅

- **React Router DOM**

### 스타일링

- **Tailwind CSS**
- **@heroicons/react**

### 외부 API

- **기상청 단기예보 API** : 날씨 데이터 제공
- **카카오 Local API** : 주소-좌표 변환 및 역지오코딩

## 구현한 기능에 대한 설명

### 1. 현재 위치 기반 날씨 조회

- 브라우저의 Geolocation API를 사용하여 현재 위치를 자동으로 감지
- 현재 위치의 날씨 정보를 실시간으로 표시
- 카카오 Local API를 통해 좌표를 행정구역명(법정동)으로 변환 혹은 행정구역을 좌표로 변환

### 2. 지역 검색

- `korea_districts.json`으로 검색 목록 구현
- Debounce를 적용하여 입력 최적화(300ms 지연)
- 목록에 표시할 검색 결과 최대 100개로 제한하여 성능 최적화
- 카카오 Local API를 통해 검색된 지역의 좌표로 변환하여 날씨 조회 연동

### 3. 날씨 정보 표시

- **현재 기온**: 현재 시간 기준 가장 가까운 예보 기온
- **최고/최저 기온**: 오늘 날짜의 최고/최저 기온
- **시간대별 기온**: 현재 시간부터 8시간 동안의 시간대별 기온 예보
- **주간 날씨 네비게이션**: 날짜별 날씨 정보 탐색

### 4. 즐겨찾기 기능

- 최대 6개까지 지역 즐겨찾기 저장 (FIFO 방식)
- sessionStorage를 사용한 데이터 저장
- 즐겨찾기 목록 페이지에서 저장한 즐겨찾기 지역의 날씨를 카드 형태로 표시
- 즐겨찾기 제목 수정 기능
- 즐겨찾기 해제 시 확인 모달 표시
- 중복 추가 시 기존 항목 제거 후 재추가

### 5. 자동 데이터 갱신

- 기상청 API를 활용해 매시간 정각이 지나면 자동 데이터 갱신
- React Query의 캐싱 전략과 함께 사용하여 불필요한 API 호출 최소화

### 6. 에러 처리

- API 호출 실패 시 사용자에게 에러 메시지 표시
- 날씨 데이터가 제공되지 않는 지역에 대한 적절한 에러 처리
- Mock 데이터를 통한 Fallback 처리

## 기술적 의사결정 및 이유

### 1. Feature-Sliced Design (FSD) 아키텍처 채택

**이유:**
- 코드의 명확한 계층 구조로 유지보수성 향상
- 레이어 간 의존성 규칙으로 순환 참조 방지
- 기능별 독립적인 모듈화로 확장성 보장
- 팀 협업 시 코드 구조의 일관성 유지

**구조:**
```
app → pages → widgets → features → entities → shared
```

각 레이어는 하위 레이어만 import 가능하여 의존성 방향이 명확합니다.

### 2. TanStack Query (React Query) 사용

**이유:**
- 서버 상태와 클라이언트 상태의 분리
- 자동 캐싱으로 불필요한 API 호출 감소
- Background refetching으로 사용자 경험 향상
- 로딩, 에러 상태 관리 자동화


### 3. Tailwind CSS 사용

**이유:**
- 유틸리티 퍼스트 방식으로 빠른 스타일링
- 일관된 디자인 시스템 구축
- 번들 크기 최적화 (사용하지 않는 스타일 자동 제거)
- 반응형 디자인 구현의 편의성

### 4. Queue 자료구조를 사용한 즐겨찾기 관리

**이유:**
- FIFO(First In First Out) 원칙으로 최대 6개 제한 구현
- 가장 오래된 항목을 자동으로 제거하는 로직의 명확성
- sessionStorage와 연동하여 데이터 저장 (브라우저 세션 동안 유지)
- 중복 추가 시 재추가하는 로직으로 최근 사용 지역 상단 유지

### 5. 기상청 Grid 좌표 변환

**이유:**
- 기상청 API는 WGS84 좌표계가 아닌 Grid 좌표계를 사용
- 위경도를 Grid 좌표로 변환하는 알고리즘 구현
- 정확한 날씨 데이터 조회를 위한 필수 구현

### 6. URL 쿼리 파라미터를 통한 상태 관리

**이유:**
- 즐겨찾기에서 홈으로 이동 시 좌표 정보 전달
- 브라우저 뒤로가기/앞으로가기 지원
- 페이지 새로고침 시에도 상태 유지
- React Router의 `useSearchParams` 활용

### 7. TypeScript 사용

**이유:**
- 타입 안정성으로 런타임 에러 감소
- IDE 자동완성으로 개발 생산성 향상
- API 응답 타입 정의로 데이터 구조 명확화
- 리팩토링 시 안전성 보장

### 8. Vite 사용

**이유:**
- 기존 Create React App 대비 빠른 개발 서버 시작 속도
- HMR(Hot Module Replacement) 성능 최적화
- ES 모듈 기반 빌드로 번들 크기 최적화
- 간단한 설정과 플러그인 생태계

### 9. 환경 변수를 통한 API 키 관리

**이유:**
- API 키를 코드에 하드코딩하지 않아 보안 강화
- Vite의 `import.meta.env`를 사용한 환경 변수 접근
- 개발/프로덕션 환경별 다른 키 사용 가능

## 프로젝트 구조 (FSD 아키텍처)

```
src/
├── app/              # 애플리케이션 초기화 레이어
│   ├── providers/    # 전역 프로바이더 (Context, Theme 등)
│   ├── routing/      # 라우팅 설정
│   └── index.tsx     # App 컴포넌트
│
├── pages/            # 페이지 레이어
│   └── home/         # 홈 페이지
│       ├── ui/       # 페이지 UI 컴포넌트
│       └── index.ts  # Public API
│
├── widgets/          # 위젯 레이어 (독립적인 UI 블록)
│   └── [widget-name]/
│       ├── ui/
│       └── index.ts
│
├── features/         # 기능 레이어 (사용자 기능)
│   └── [feature-name]/
│       ├── ui/
│       ├── model/    # 비즈니스 로직, 상태 관리
│       ├── api/      # API 호출
│       └── index.ts
│
├── entities/         # 엔티티 레이어 (비즈니스 엔티티)
│   └── [entity-name]/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
│
└── shared/           # 공유 레이어
    ├── ui/           # 공유 UI 컴포넌트 (Button, Input 등)
    ├── lib/          # 유틸리티 함수
    ├── api/          # API 클라이언트 설정
    ├── config/       # 설정 파일
    ├── types/        # 공유 타입 정의
    ├── constants/    # 상수
    ├── assets/       # 공유 에셋
    └── styles/       # 공유 스타일
```

## Path Aliases

프로젝트에서 사용 가능한 path alias:

- `@/app/*` - 애플리케이션 레이어
- `@/pages/*` - 페이지 레이어
- `@/widgets/*` - 위젯 레이어
- `@/features/*` - 기능 레이어
- `@/entities/*` - 엔티티 레이어
- `@/shared/*` - 공유 레이어

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/get-started/overview)
