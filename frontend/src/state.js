let tasks = [];
let isFormOpen = false;
let editingTaskId = null;

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  for (const listener of listeners) listener();
}

export function getTasks() {
  return tasks;
}

export function setTasks(nextTasks) {
  tasks = nextTasks;
  notify();
}

export function isCreateFormOpen() {
  return isFormOpen;
}

export function openCreateForm() {
  isFormOpen = true;
  notify();
}

export function closeCreateForm() {
  isFormOpen = false;
  notify();
}

export function getEditingTaskId() {
  return editingTaskId;
}

export function openEditModal(taskId) {
  editingTaskId = taskId;
  notify();
}

export function closeEditModal() {
  editingTaskId = null;
  notify();
}
