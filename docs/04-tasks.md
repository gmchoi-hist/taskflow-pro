# 04. Tasks

MVP는 3개 Phase로 순서대로 진행한다. 확장 단계(JWT 로그인, 팀, Kanban, 채팅, CI/CD 등)는 본 문서에 포함하지 않고 별도 문서에서 다룬다.

## 진행 규칙

- 각 Phase와 단계는 **순서대로만** 진행한다. 이전 단계가 끝나지 않으면 다음 단계로 넘어가지 않는다.
- 여러 단계를 **병렬로 진행하지 않는다.**
- 각 단계는 정의된 **검증 방법**을 통과해야 완료(`DONE`)로 표기한다 (절대 규칙 3과 연결).
- 명세에 없는 작업이 필요해지면 이 문서에 임의로 추가하지 않고 `02-specs.md`/`03-design.md` 갱신 여부를 사용자와 먼저 협의한다.

## 상태 표기

- `TODO`: 아직 시작 안 함
- `IN_PROGRESS`: 진행 중
- `DONE`: 완료 (검증 방법 통과 기준)

---

## Phase 1 — 설계 (`CLAUDE.md` + `docs/` 6종)

| 단계 | 작업 | 검증 방법 | 상태 |
|---|---|---|---|
| 1 | `CLAUDE.md` 작성 (역할/절대 규칙/모호 요청 처리) | 5개 절대 규칙, 문서 읽는 순서가 모두 명시되어 있는지 육안 확인 | DONE |
| 2 | `docs/00-overview.md` 작성 | 6개 문서 매핑표와 읽는 순서가 존재하는지 확인 | DONE |
| 3 | `docs/01-product.md` 작성 | 목표/페르소나/MVP 범위/성공 기준이 모두 포함됐는지 확인 | DONE |
| 4 | `docs/02-specs.md` 작성 | Task 필드/검증 규칙/API 5개/화면 명세가 모두 포함됐는지 확인 | DONE |
| 5 | `docs/03-design.md` 작성 | 8개 기술 결정표(선택/대안/근거/트레이드오프)가 모두 채워졌는지 확인 | DONE |
| 6 | `docs/04-tasks.md` 작성 (본 문서) | Phase 3개, 각 체크리스트와 검증 방법이 존재하는지 확인 | DONE |
| 7 | `docs/05-conventions.md` 작성 | 네이밍/커밋/코드 스타일 규칙이 모두 포함됐는지 확인 | DONE |
| 8 | 문서 간 상호 참조 정합성 점검 (스택/필드명/API 경로 등 불일치 없는지) | `00~05` 문서를 순서대로 재훑어 용어/스택 불일치 여부 확인 | DONE |
| 9 | `CLAUDE.md` 절대 규칙과 각 문서 내용 충돌 여부 점검 | 절대 규칙 5개 항목별로 관련 문서 조항이 모순되지 않는지 확인 | DONE |
| 10 | 문서 확정 (사용자 승인) | 사용자에게 Phase 1 완료 보고 및 승인 확인 | DONE |

---

## Phase 2 — 백엔드 (`backend/` FastAPI → CRUD API 5개 → Swagger 확인)

| 단계 | 작업 | 검증 방법 | 상태 |
|---|---|---|---|
| 1 | Python venv 생성 및 `requirements.txt` 설치 (FastAPI, SQLAlchemy, pytest 등) | `pip list`로 패키지 설치 확인 | DONE |
| 2 | SQLAlchemy `Task` 모델 정의 (`app/models.py`) | `02-specs.md` 필드 표와 1:1 대조 | DONE |
| 3 | Pydantic 스키마 정의 (`TaskCreate`/`TaskUpdate`/`TaskListItem`/`TaskDetail`) | 목록 스키마에 `description` 없음, 단건 스키마에 있음을 코드 리뷰로 확인 | DONE |
| 4 | DB 연결/세션 설정 (`app/database.py`, SQLite) | 앱 기동 시 `taskflow.db` 파일 생성 및 테이블 자동 생성 확인 | DONE |
| 5 | `POST /api/tasks` 구현 (201) | pytest 통과 + curl로 실제 생성 응답 201 확인 | DONE |
| 6 | `GET /api/tasks` 구현 (200, 목록은 description 제외) | pytest 통과 + curl 응답에 `description` 필드 없음 확인 | DONE |
| 7 | `GET /api/tasks/{id}` 구현 (200, 단건은 description 포함) | pytest 통과 + curl 응답에 `description` 포함 확인 | DONE |
| 8 | `PUT /api/tasks/{id}` 구현 (부분 수정, 200) | pytest 통과 + 일부 필드만 보낸 요청이 나머지 값을 유지하는지 확인 | DONE |
| 9 | `DELETE /api/tasks/{id}` 구현 (204) + 검증 규칙(400/404) 전체 적용 | pytest 12개 전체 통과 확인 | DONE |
| 10 | Swagger UI(`/docs`)에서 5개 API 수동 실행 확인 | 브라우저로 `http://localhost:8000/docs` 접속 후 각 엔드포인트 Try it out으로 직접 호출 | TODO |

---

## Phase 3 — 프론트엔드 (`frontend/` HTML+JS+Tailwind → 메인 화면 → API 연결 → git push)

| 단계 | 작업 | 검증 방법 | 상태 |
|---|---|---|---|
| 1 | `index.html` + Tailwind CDN 스켈레톤 작성 | 정적 서버로 열어 페이지가 200 응답, Tailwind 클래스가 적용되는지 확인 | DONE |
| 2 | `state.js` 모듈 변수 기반 상태 작성 | vitest 단위 테스트 통과 | DONE |
| 3 | `api.js` fetch 래퍼 작성 (5개 REST 호출) | vitest/코드 리뷰 + 실제 백엔드 대상 curl 응답 포맷과 일치 확인 | DONE |
| 4 | `render.js` 렌더링 작성 (카드/추가폼/수정모달, 상태 배지 + `D-N HH:MM`) | vitest로 `formatDueBadge` 로직 테스트 통과 | DONE |
| 5 | `main.js` 이벤트 바인딩 + 3초 폴링 연결 | 코드 리뷰로 폴링 인터벌/이벤트 핸들러 연결 확인 | DONE |
| 6 | 메인 화면에서 CRUD 4종 브라우저 수동 확인 (추가/목록/수정/삭제) | 브라우저로 실제 추가→목록 반영→수정→삭제까지 한 번씩 직접 수행 | TODO |
| 7 | 테마 토글 및 360px 반응형 브라우저 수동 확인 | 브라우저에서 테마 전환 후 새로고침 유지 확인, 뷰포트 360px로 레이아웃 확인 | TODO |
| 8 | git 저장소 초기화 및 `git push` | `git status`/`git log`로 커밋 존재 확인, 원격 저장소에 push 완료 확인 | TODO |

## 미해결 이슈

- 마감이 지난 태스크와 `due_at`이 없는 태스크의 `D-N HH:MM` 표시 방식이 `02-specs.md`에 명시되지 않아, 각각 "기한 초과"/"마감 없음"으로 임시 구현했다. 최종 확정 여부는 사용자 확인이 필요하다(절대 규칙 1).

## 참고

- Phase 2 10단계, Phase 3 6~7단계는 코드/자동 테스트 레벨 검증까지는 완료되었으나, 브라우저/Swagger를 통한 수동 확인은 아직 진행하지 않아 `TODO`로 남겨두었다.
- Phase 3 8단계(git push)는 현재 저장소가 git으로 초기화되어 있지 않아 `git init` 및 원격 저장소 설정이 선행되어야 한다. 원격 저장소 주소 등은 추측하지 않고 사용자에게 확인한다(절대 규칙 1).
- 확장 단계(JWT 로그인, 팀, Kanban, 채팅, CI/CD, PostgreSQL 전환 등)는 이 문서에 포함하지 않으며, 착수 시점에 별도 문서(`06-extensions.md` 등)로 다룬다.
