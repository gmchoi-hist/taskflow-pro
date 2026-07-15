import { describe, expect, it, vi, beforeEach } from "vitest";
import * as state from "./state.js";

describe("state", () => {
  beforeEach(() => {
    state.setTasks([]);
    state.closeCreateForm();
    state.closeEditModal();
  });

  it("setTasks 후 getTasks로 조회할 수 있다", () => {
    const tasks = [{ id: "1", title: "a" }];
    state.setTasks(tasks);
    expect(state.getTasks()).toEqual(tasks);
  });

  it("openCreateForm/closeCreateForm이 상태를 토글한다", () => {
    expect(state.isCreateFormOpen()).toBe(false);
    state.openCreateForm();
    expect(state.isCreateFormOpen()).toBe(true);
    state.closeCreateForm();
    expect(state.isCreateFormOpen()).toBe(false);
  });

  it("openEditModal/closeEditModal이 editingTaskId를 관리한다", () => {
    expect(state.getEditingTaskId()).toBeNull();
    state.openEditModal("task-1");
    expect(state.getEditingTaskId()).toBe("task-1");
    state.closeEditModal();
    expect(state.getEditingTaskId()).toBeNull();
  });

  it("subscribe한 리스너는 상태 변경 시 호출된다", () => {
    const listener = vi.fn();
    state.subscribe(listener);
    state.setTasks([{ id: "1" }]);
    expect(listener).toHaveBeenCalled();
  });
});
