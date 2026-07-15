import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { formatDueBadge, formatCreatedAt, renderApp } from "./render.js";
import * as state from "./state.js";

function noopHandlers() {
  return {
    onAddClick: () => {},
    onCreateSubmit: async () => {},
    onCreateCancel: () => {},
    onEditSubmit: async () => {},
    onEditCancel: () => {},
    onDelete: async () => {},
  };
}

describe("formatDueBadge", () => {
  it("due_at이 없으면 마감 없음을 반환한다", () => {
    expect(formatDueBadge(null)).toEqual({ text: "마감 없음", overdue: false });
  });

  it("due_at이 지났으면 기한 초과를 반환한다", () => {
    const past = new Date(Date.now() - 60000).toISOString();
    expect(formatDueBadge(past)).toEqual({ text: "기한 초과", overdue: true });
  });

  it("due_at이 미래면 D-N HH:MM 형식으로 반환한다", () => {
    const future = new Date(Date.now() + (2 * 24 * 60 + 18 * 60 + 30) * 60000).toISOString();
    const result = formatDueBadge(future);
    expect(result.overdue).toBe(false);
    expect(result.text).toBe("D-2 18:30");
  });
});

describe("formatCreatedAt", () => {
  const NOW = new Date("2026-07-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("1분 미만이면 방금 전을 반환한다", () => {
    const createdAt = new Date(NOW.getTime() - 10_000).toISOString();
    expect(formatCreatedAt(createdAt)).toBe("방금 전");
  });

  it("1시간 미만이면 n분 전을 반환한다", () => {
    const createdAt = new Date(NOW.getTime() - 5 * 60_000).toISOString();
    expect(formatCreatedAt(createdAt)).toBe("5분 전");
  });

  it("하루 미만이면 n시간 전을 반환한다", () => {
    const createdAt = new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString();
    expect(formatCreatedAt(createdAt)).toBe("3시간 전");
  });

  it("일주일 미만이면 n일 전을 반환한다", () => {
    const createdAt = new Date(NOW.getTime() - 2 * 24 * 60 * 60_000).toISOString();
    expect(formatCreatedAt(createdAt)).toBe("그저께");
  });

  it("일주일 이상이면 절대 날짜를 반환한다", () => {
    const createdAt = new Date(NOW.getTime() - 10 * 24 * 60 * 60_000).toISOString();
    expect(formatCreatedAt(createdAt)).toBe("2026. 07. 05.");
  });
});

describe("renderApp 재렌더링 시 입력 폼 보존", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    state.setTasks([]);
    state.closeCreateForm();
    state.closeEditModal();
  });

  it("폼이 열린 채로 데이터만 갱신되는 재렌더링에서는 입력값이 유지된다", () => {
    const handlers = noopHandlers();
    state.openCreateForm();
    renderApp(handlers);

    const titleInput = document.querySelector('input[placeholder="태스크 제목"]');
    titleInput.value = "작성 중인 제목";

    // 폴링 등으로 인해 태스크 데이터만 바뀌었을 때의 재렌더링을 흉내낸다 (폼 열림 상태는 그대로).
    state.setTasks([
      { id: "1", title: "x", status: "todo", due_at: null, created_at: new Date().toISOString() },
    ]);
    renderApp(handlers);

    const titleInputAfter = document.querySelector('input[placeholder="태스크 제목"]');
    expect(titleInputAfter).toBe(titleInput);
    expect(titleInputAfter.value).toBe("작성 중인 제목");
  });

  it("폼을 닫으면 입력 폼이 DOM에서 제거된다", () => {
    const handlers = noopHandlers();
    state.openCreateForm();
    renderApp(handlers);
    expect(document.querySelector('input[placeholder="태스크 제목"]')).not.toBeNull();

    state.closeCreateForm();
    renderApp(handlers);
    expect(document.querySelector('input[placeholder="태스크 제목"]')).toBeNull();
  });
});
