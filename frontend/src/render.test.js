import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { formatDueBadge, formatCreatedAt } from "./render.js";

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
