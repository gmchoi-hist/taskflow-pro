# 02. Specs

`01-product.md`의 MVP 범위를 구체적인 기능 명세로 정의한다. 각 기능은 동작 방식, 입출력, 예외 케이스를 포함한다.

MVP는 인증/팀/프로젝트 구조 없이 단일 태스크 목록을 다루는 CRUD 앱이다.

## 1. Task 모델 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| id | UUID | 자동 생성 | PK |
| title | VARCHAR(200) | 필수 | 태스크 제목, 최대 200자 |
| description | TEXT | 선택 | 태스크 설명 |
| status | ENUM | 선택 | `todo` \| `in_progress` \| `done`, 기본값 `todo` |
| due_at | DATETIME (UTC) | 선택 | 마감 일시, 시간대는 UTC로 저장 |
| created_at | DATETIME | 자동 생성 | 생성 시각 |
| updated_at | DATETIME | 자동 갱신 | 수정 시각 |

## 2. 검증 규칙

| 대상 | 규칙 | 위반 시 |
|---|---|---|
| title | 필수, 200자 이하 | 400 |
| status | `todo` / `in_progress` / `done` 중 하나만 허용 | 400 |
| due_at | ISO 8601 형식 문자열만 허용 (예: `2026-05-12T18:00:00Z`) | 형식 위반 시 400 |
| 대상 리소스 | 요청한 id의 태스크가 존재해야 함 | 없는 id 요청 시 404 |

- title/status/due_at 형식을 위반한 요청은 모두 400을 반환한다.
- due_at은 ISO 8601 형식이 아니면 400을 반환한다 (예: 날짜만 있는 값, 잘못된 포맷 등).
- 존재하지 않는 태스크 id로 조회/수정/삭제를 시도하면 404를 반환한다.

## 3. REST API

기본 경로: `/api/tasks`

| 메서드 | 경로 | 응답 코드 | 설명 |
|---|---|---|---|
| POST | `/api/tasks` | 201 | 태스크 생성 |
| GET | `/api/tasks` | 200 | 태스크 목록 조회 |
| GET | `/api/tasks/:id` | 200 | 태스크 단건 조회 |
| PUT | `/api/tasks/:id` | 200 | 태스크 부분 수정 |
| DELETE | `/api/tasks/:id` | 204 | 태스크 삭제 |

### 3.1 응답 필드 범위

- **목록 조회(GET /api/tasks)**: `description` 제외 (id, title, status, due_at, created_at, updated_at만 포함)
- **단건 조회(GET /api/tasks/:id)**: 전체 필드 포함 (`description` 포함)
- **생성/수정(POST, PUT)**: 전체 필드 포함 응답

### 3.2 PUT 부분 수정

- PUT은 이름과 달리 부분 수정을 지원한다 (요청 body에 포함된 필드만 갱신)
- 요청에 없는 필드는 기존 값을 유지한다

## 4. 화면 명세 (CRUD 4종 모두 UI로 동작)

### 4.1 추가 — 폼

- 입력 필드: `title`, `due_at`, `status`
- `due_at`은 날짜+시간을 함께 입력 (날짜만 입력하는 것은 허용하지 않음)
- 제출 시 `POST /api/tasks` 호출, 성공 시 목록에 반영

### 4.2 목록 — 카드

- 각 태스크는 카드 형태로 표시
- 카드에는 상태 배지(status badge)와 마감까지 남은 일수/시간 `D-N HH:MM` 형식으로 표시
  - 예: 마감이 2일 후 18시간 30분 남았으면 `D-2 18:30`
  - 마감이 지난 경우 및 `due_at`이 없는 경우의 표시 방식은 구현 전 별도 확인 필요 (추측 금지)
- 목록 조회는 `description`을 포함하지 않는 응답을 사용하므로 카드에는 설명을 표시하지 않는다

### 4.3 수정 — 카드 클릭 → 모달

- 카드를 클릭하면 수정 모달이 열린다
- 모달에서 title/description/status/due_at 수정 가능
- 저장 시 `PUT /api/tasks/:id` 호출

### 4.4 삭제 — 휴지통 아이콘 → 확인 → DELETE

- 카드에 휴지통 아이콘 버튼 배치
- 클릭 시 확인(confirm) 절차를 거친 후 `DELETE /api/tasks/:id` 호출

## 5. 공통 규칙

- 에러 응답 포맷은 `03-design.md`에서 정의한다
- API 응답 목표 속도: 200ms 이내 (`01-product.md` 성공 기준 참고)
- MVP는 WebSocket을 사용하지 않으며, 목록은 폴링 방식으로 갱신한다 (폴링 주기는 `03-design.md` 참고)

## 참고

- 위 명세에 없는 예외 상황(마감 지난 태스크의 D-N 표시 방식 등)이 구현 중 발견되면 추측해서 처리하지 않고 사용자에게 확인한다(절대 규칙 1).
- 이번 개정으로 API 메서드가 PATCH에서 PUT으로, 필드명이 camelCase(`dueAt`)에서 snake_case(`due_at`)로 변경되었다. `03-design.md`와 기존 구현 코드는 이 변경사항을 반영해 갱신이 필요하다.
