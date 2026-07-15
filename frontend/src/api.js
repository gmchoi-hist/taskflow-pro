const API_BASE = "http://localhost:8000/api/tasks";

async function handleResponse(res) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `request failed with ${res.status}`;
    throw new Error(message);
  }
  return body;
}

export function fetchTasks() {
  return fetch(API_BASE).then(handleResponse);
}

export function fetchTask(id) {
  return fetch(`${API_BASE}/${id}`).then(handleResponse);
}

export function createTask(input) {
  return fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(handleResponse);
}

export function updateTask(id, input) {
  return fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(handleResponse);
}

export function deleteTask(id) {
  return fetch(`${API_BASE}/${id}`, { method: "DELETE" }).then(handleResponse);
}
