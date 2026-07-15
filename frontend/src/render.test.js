import { describe, expect, it } from "vitest";
import { formatDueBadge } from "./render.js";

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
