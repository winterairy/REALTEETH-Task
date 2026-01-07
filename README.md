# FSD (Feature-Sliced Design) 아키텍처

## 프로젝트 구조

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

## 레이어 규칙

### Import 규칙

- 각 레이어는 **같은 레이어** 또는 **하위 레이어**만 import 가능
- 상위 레이어로의 import는 금지

> app → pages → widgets → features → entities → shared

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
