import * as api from "./api.js";
import * as state from "./state.js";
import { renderApp } from "./render.js";

const POLLING_INTERVAL_MS = 3000;

function rerender() {
  renderApp({
    onAddClick: () => state.openCreateForm(),
    onCreateSubmit: async (input) => {
      await api.createTask(input);
      state.closeCreateForm();
      await refreshTasks();
    },
    onCreateCancel: () => state.closeCreateForm(),
    onEditSubmit: async (taskId, input) => {
      await api.updateTask(taskId, input);
      state.closeEditModal();
      await refreshTasks();
    },
    onEditCancel: () => state.closeEditModal(),
    onDelete: async (taskId) => {
      const confirmed = window.confirm("이 태스크를 삭제하시겠습니까?");
      if (!confirmed) return;
      await api.deleteTask(taskId);
      await refreshTasks();
    },
  });
}

async function refreshTasks() {
  const tasks = await api.fetchTasks();
  state.setTasks(tasks);
}

state.subscribe(rerender);

refreshTasks();
setInterval(refreshTasks, POLLING_INTERVAL_MS);
