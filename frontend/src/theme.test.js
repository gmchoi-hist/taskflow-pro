import { describe, expect, it, beforeEach } from "vitest";
import { getInitialTheme, applyTheme, getCurrentTheme, toggleTheme } from "./theme.js";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("localStorage에 저장된 값이 없으면 시스템 설정(light)을 따른다", () => {
    expect(getInitialTheme()).toBe("light");
  });

  it("localStorage에 저장된 값이 있으면 그 값을 우선한다", () => {
    localStorage.setItem("theme", "dark");
    expect(getInitialTheme()).toBe("dark");
  });

  it("applyTheme은 data-theme 속성과 localStorage를 함께 갱신한다", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("toggleTheme은 현재 테마의 반대로 전환하고 localStorage에 저장한다 (새로고침 유지 근거)", () => {
    applyTheme("light");
    toggleTheme();
    expect(getCurrentTheme()).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    toggleTheme();
    expect(getCurrentTheme()).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("새로고침을 흉내낸 재초기화에서도 저장된 테마가 유지된다", () => {
    applyTheme("dark");
    document.documentElement.removeAttribute("data-theme");
    applyTheme(getInitialTheme());
    expect(getCurrentTheme()).toBe("dark");
  });
});
