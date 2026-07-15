# 03. Design

`02-specs.md`의 기능 명세를 구현하기 위한 기술 스택, 폴더 구조, 데이터 모델, API 설계를 정의한다.

## 기술 결정표

| # | 항목 | 선택 | 대안 | 근거 | 트레이드오프 |
|---|---|---|---|---|---|
| 1 | 백엔드 | FastAPI | Django, Express | 가볍고 빠른 개발 속도, 타입 힌트 기반 자동 검증/문서화(OpenAPI)로 `02-specs.md`의 검증 규칙 구현에 적합 | Django 대비 관리자 화면/ORM 등 배터리 포함 기능 없음, Express 대비 팀의 Node.js 경험 재사용 불가 |
| 2 | 프론트엔드 | Vanilla JS + Tailwind CDN | React, Vue | MVP 규모(단일 화면, CRUD 4종)에 프레임워크 도입은 과함, 빌드 설정 없이 즉시 구동 | 상태/DOM 동기화를 직접 관리해야 해 기능이 늘어나면 코드 복잡도 급증, 재사용성 낮음 |
| 3 | DB | SQLite + SQLAlchemy | PostgreSQL | 설치 없이 즉시 시작 가능, MVP 규모(단일 태스크 테이블)에서 별도 DB 서버 운영 불필요 | 동시 쓰기 처리량이 낮음, 향후 다중 사용자/동시 접속이 늘면 PostgreSQL 전환 필요(전환 시 이 문서에 재기록 후 진행) |
| 4 | CSS | Tailwind만 사용 | styled-components 금지 | 유틸리티 클래스로 빠른 스타일링, CDN 방식과 궁합이 좋음, CSS-in-JS 런타임 오버헤드 없음 | 클래스 나열로 마크업이 길어짐, 디자인 토큰을 코드 레벨로 강제하기 어려움(문서화된 토큰 규칙으로 보완) |
| 5 | 실시간 갱신 | MVP는 폴링 3초 | WebSocket(확장 단계 보류) | 구현 단순, 서버 상태 유지 불필요, MVP 트래픽 규모에서 폴링으로 충분 | 3초 지연 존재, 사용자 수가 늘면 폴링 트래픽 비용 증가(확장 시 WebSocket 재검토) |
| 6 | 상태 관리 | 모듈 변수 + DOM 직접 갱신 | (프레임워크 미도입에 따른 자연스러운 귀결) | 별도 상태관리 라이브러리 없이 단일 진실 소스(모듈 변수)를 유지, 변경 시 필요한 DOM만 갱신 | 상태-DOM 동기화 로직을 수작업으로 작성해야 하며, 화면이 복잡해지면 버그 발생 가능성 증가 |
| 7 | 디자인 시스템 | Mac OS UI 톤 | Material, Ant | `01-product.md`의 UI 톤 요구사항(둥근 모서리, 부드러운 그림자, 반투명 카드, 시스템 폰트)과 직접 일치 | 별도 컴포넌트 라이브러리가 없어 토큰/컴포넌트를 직접 구현 및 유지보수해야 함 |
| 8 | 테마 | 라이트/다크 토글 | (단일 방식으로 확정) | `data-theme` 속성 기반 변형(variant) + `localStorage('theme')`로 새로고침 후에도 유지, 초기값은 `prefers-color-scheme`로 사용자 시스템 설정 존중 | 저장된 값과 시스템 설정이 다를 경우 우선순위 규칙(저장값 우선)을 명확히 코드에 반영해야 함 |

## 의존성 추가 정책

- 새 패키지/라이브러리를 도입하려면 반드시 본 문서(`03-design.md`)에 사유를 먼저 기록한 뒤에만 도입할 수 있다.
- 사유 없이 임의로 의존성을 추가하지 않는다 (CLAUDE.md 절대 규칙 2와 연결).
- 현재 승인된 의존성 외 항목이 필요해지면, 이 문서에 행을 추가해 선택/대안/근거/트레이드오프를 기록하고 사용자 확인을 받은 뒤 진행한다.

### 승인된 의존성

| 영역 | 패키지 | 사유 |
|---|---|---|
| 백엔드 | fastapi, uvicorn | API 서버 프레임워크 및 ASGI 서버 |
| 백엔드 | sqlalchemy | DB ORM, SQLite/PostgreSQL 방언 추상화 |
| 백엔드 | pydantic | FastAPI 요청/응답 검증 (FastAPI 의존성에 포함) |
| 백엔드 | alembic | SQLAlchemy 마이그레이션 관리 |
| 프론트엔드 | (없음, CDN) | Tailwind는 CDN `<script>` 태그로 로드, 별도 npm 의존성 없음 |
| 프론트엔드(테스트 전용) | vitest, jsdom | 런타임에는 포함되지 않는 개발 의존성. 절대 규칙 3(테스트 없이 완료 금지)을 충족하기 위해 `state.js`/`render.js`의 순수 함수 단위 테스트에 사용 |

## 폴더 구조

```
taskflow-pro/
├── frontend/
│   ├── index.html        # Tailwind CDN 스크립트 포함
│   └── src/
│       ├── state.js      # 모듈 변수 기반 상태
│       ├── api.js        # 백엔드 API 호출 함수 (fetch)
│       ├── render.js     # 상태 -> DOM 렌더링 함수
│       ├── theme.js      # 테마 토글, localStorage 처리
│       └── main.js       # 진입점, 이벤트 바인딩
├── backend/
│   └── app/
│       ├── main.py        # FastAPI 앱 진입점
│       ├── routers/       # 라우트 정의 (tasks.py 등)
│       ├── schemas.py     # Pydantic 요청/응답 스키마
│       ├── models.py      # SQLAlchemy 모델
│       ├── crud.py        # DB 접근 함수
│       ├── database.py    # 엔진/세션 설정 (SQLite/PostgreSQL)
│       └── alembic/       # 마이그레이션
├── docs/
└── CLAUDE.md
```

이 구조는 절대 규칙 5에 따라 임의로 변경하지 않는다.

## 레이어 흐름 (backend)

```
routers -> schemas(검증) -> crud -> models(SQLAlchemy) -> DB
```

## 데이터 모델 (Task)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | PK |
| title | VARCHAR(200) | 필수 |
| description | TEXT | 선택 |
| status | ENUM(`todo`, `in_progress`, `done`) | 기본값 `todo` |
| due_at | DATETIME (UTC) | 선택 |
| created_at | DATETIME | 자동 생성 |
| updated_at | DATETIME | 자동 갱신 |

## API 설계

- 기본 경로: `/api/tasks`
- 응답 포맷(에러): `{ "error": { "message": string, "code"?: string } }`

| 메서드 | 경로 | 응답 | 설명 |
|---|---|---|---|
| POST | `/api/tasks` | 201 | 태스크 생성 |
| GET | `/api/tasks` | 200 | 목록 조회 (`description` 제외) |
| GET | `/api/tasks/{id}` | 200 | 단건 조회 (전체 필드) |
| PUT | `/api/tasks/{id}` | 200 | 부분 수정 |
| DELETE | `/api/tasks/{id}` | 204 | 삭제 |

세부 검증 규칙은 `02-specs.md`를 따른다.

## 폴링 정책

- 프론트엔드는 3초 주기로 `GET /api/tasks`를 재호출해 목록을 갱신한다 (`state.js`에서 `setInterval` 관리)

## 디자인 토큰 (Mac OS UI 톤)

Tailwind 유틸리티 클래스를 다음 기준으로 사용한다.

| 토큰 | Tailwind 클래스 | 용도 |
|---|---|---|
| 둥근 모서리 | `rounded-xl` | 카드, 버튼, 입력 필드 |
| 그림자 | `shadow-lg` | 카드 입체감 |
| 반투명/블러 | `backdrop-blur` (+ `bg-white/60` 등 반투명 배경) | 카드 유리질감 |
| 폰트 | 시스템 폰트 스택 (`font-sans` 커스터마이즈: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) | 전역 타이포 |
| 터치 타깃 | 버튼/클릭 요소 최소 `44px` (`min-h-11 min-w-11` 등으로 보장) | 모바일 반응형 접근성 |

## 테마 처리

- `localStorage` 키 `theme` (`light` | `dark`)
- 초기값 결정 순서: `localStorage`에 저장된 값이 있으면 그 값 사용 → 없으면 `prefers-color-scheme` 미디어 쿼리로 시스템 설정 감지 → 그마저 없으면 `light`
- 다크 모드는 `dark:` Tailwind variant + `[data-theme="dark"]`를 `<html>`에 적용하는 방식으로 처리 (Tailwind `dark` variant를 `class` 전략이 아닌 `selector`/`data-theme` 기준으로 설정)
- 토글 클릭 시 `localStorage`에 즉시 저장하여 새로고침 후에도 유지

## 참고

- 이 설계는 `02-specs.md`의 명세를 반영한 개정안이며, 기존 React + Express + Prisma 기반 구현 코드는 이번 결정에 따라 전면 재작성이 필요하다.
- 구현 중 세부 사항이 필요해지면 추측하지 않고 사용자와 확인한다(절대 규칙 1).
- 상세 컨벤션(네이밍, 커밋 규칙 등)은 `05-conventions.md`에서 정의한다.
