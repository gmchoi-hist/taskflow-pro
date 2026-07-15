import * as state from "./state.js";
import { getCurrentTheme, toggleTheme } from "./theme.js";

const STATUS_LABEL = { todo: "할 일", in_progress: "진행 중", done: "완료" };
const STATUS_BADGE_CLASS = {
  todo: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  in_progress: "bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-100",
  done: "bg-emerald-200 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100",
};

function formatDueBadge(dueAt) {
  if (!dueAt) return { text: "마감 없음", overdue: false };
  const diffMs = new Date(dueAt).getTime() - Date.now();
  if (diffMs < 0) return { text: "기한 초과", overdue: true };
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return { text: `D-${days} ${pad(hours)}:${pad(minutes)}`, overdue: false };
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
const ABSOLUTE_DATE_FORMATTER = new Intl.DateTimeFormat("ko", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatCreatedAt(createdAt) {
  const date = new Date(createdAt);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return RELATIVE_TIME_FORMATTER.format(-diffMinutes, "minute");

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return RELATIVE_TIME_FORMATTER.format(-diffHours, "hour");

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return RELATIVE_TIME_FORMATTER.format(-diffDays, "day");

  return ABSOLUTE_DATE_FORMATTER.format(date);
}

function el(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

function button(label, className, onClick) {
  const btn = el("button", `min-h-11 min-w-11 ${className}`, label);
  btn.type = "button";
  btn.addEventListener("click", onClick);
  return btn;
}

function renderHeader({ onAddClick }) {
  const title = el("h1", "text-2xl font-semibold", "TaskFlow Pro");

  const themeBtn = button(
    getCurrentTheme() === "dark" ? "☀️ 라이트 모드" : "🌙 다크 모드",
    "rounded-xl px-3 py-2 bg-white/60 dark:bg-slate-800/60 shadow-lg backdrop-blur border border-black/5 dark:border-white/10",
    () => {
      toggleTheme();
      renderApp(currentHandlers);
    }
  );

  const addBtn = button(
    "+ 태스크 추가",
    "rounded-xl px-3 py-2 bg-blue-600 text-white shadow-lg",
    onAddClick
  );

  const actions = el("div", "flex items-center gap-2", [themeBtn, addBtn]);
  return el(
    "header",
    "flex items-center justify-between gap-4 mb-6",
    [title, actions]
  );
}

function renderTaskForm({ initialTask, onSubmit, onCancel }) {
  const titleInput = el("input", "w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-2 min-h-11");
  titleInput.placeholder = "태스크 제목";
  titleInput.value = initialTask?.title ?? "";

  const dueInput = el("input", "w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-2 min-h-11");
  dueInput.type = "datetime-local";
  if (initialTask?.due_at) {
    const d = new Date(initialTask.due_at);
    const pad = (n) => String(n).padStart(2, "0");
    dueInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const statusSelect = el("select", "w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-2 min-h-11");
  for (const [value, label] of Object.entries(STATUS_LABEL)) {
    const option = el("option", null, label);
    option.value = value;
    if ((initialTask?.status ?? "todo") === value) option.selected = true;
    statusSelect.append(option);
  }

  const descriptionInput = el("textarea", "w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-2");
  descriptionInput.placeholder = "설명 (선택)";
  descriptionInput.value = initialTask?.description ?? "";

  const errorText = el("p", "text-red-600 text-sm hidden");

  const submitBtn = button(
    initialTask ? "수정" : "추가",
    "rounded-xl px-4 py-2 bg-blue-600 text-white shadow-lg",
    async () => {
      if (!titleInput.value.trim()) {
        errorText.textContent = "제목을 입력해주세요";
        errorText.classList.remove("hidden");
        return;
      }
      try {
        await onSubmit({
          title: titleInput.value.trim(),
          description: descriptionInput.value || undefined,
          status: statusSelect.value,
          due_at: dueInput.value || undefined,
        });
      } catch (err) {
        errorText.textContent = err instanceof Error ? err.message : "저장에 실패했습니다";
        errorText.classList.remove("hidden");
      }
    }
  );

  const cancelBtn = button("취소", "rounded-xl px-4 py-2 bg-white/60 dark:bg-slate-700/60", onCancel);

  const form = el(
    "div",
    "task-form rounded-xl shadow-lg backdrop-blur bg-white/60 dark:bg-slate-800/60 border border-black/5 dark:border-white/10 p-4 mb-4 flex flex-col gap-3",
    [
      el("label", "flex flex-col gap-1 text-sm", ["제목", titleInput]),
      el("label", "flex flex-col gap-1 text-sm", ["설명", descriptionInput]),
      el("label", "flex flex-col gap-1 text-sm", ["상태", statusSelect]),
      el("label", "flex flex-col gap-1 text-sm", ["마감 일시", dueInput]),
      errorText,
      el("div", "flex gap-2", [submitBtn, cancelBtn]),
    ]
  );
  return form;
}

function renderTaskCard(task, { onCardClick, onDelete }) {
  const badge = formatDueBadge(task.due_at);

  const statusBadge = el(
    "span",
    `text-xs px-2 py-1 rounded-xl ${STATUS_BADGE_CLASS[task.status]}`,
    STATUS_LABEL[task.status]
  );

  const dueBadge = el(
    "span",
    `text-xs px-2 py-1 rounded-xl ${badge.overdue ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`,
    badge.text
  );

  const deleteBtn = button("🗑", "rounded-xl px-2 py-2 bg-white/60 dark:bg-slate-700/60", (e) => {
    e.stopPropagation();
    onDelete(task.id);
  });

  const createdAtText = el(
    "span",
    "text-xs text-slate-500 dark:text-slate-400",
    `생성: ${formatCreatedAt(task.created_at)}`
  );

  const card = el(
    "div",
    "task-card rounded-xl shadow-lg backdrop-blur bg-white/60 dark:bg-slate-800/60 border border-black/5 dark:border-white/10 p-4 flex items-center justify-between gap-3 cursor-pointer",
    [
      el("div", "flex flex-col gap-2 min-w-0", [
        el("h3", "font-medium truncate", task.title),
        el("div", "flex gap-2", [statusBadge, dueBadge]),
        createdAtText,
      ]),
      deleteBtn,
    ]
  );
  card.dataset.status = task.status;
  card.addEventListener("click", () => onCardClick(task.id));
  return card;
}

function renderEditModal({ task, onSubmit, onCancel }) {
  const overlay = el("div", "fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50");
  const modal = el("div", "w-full max-w-md");
  modal.append(renderTaskForm({ initialTask: task, onSubmit, onCancel }));
  overlay.append(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) onCancel();
  });
  return overlay;
}

let currentHandlers = null;
let shell = null;
let mountedFormOpen = false;
let mountedEditingTaskId = null;

function ensureShell(root) {
  if (shell && root.contains(shell.headerSlot)) return shell;
  root.innerHTML = "";
  const headerSlot = el("div");
  const formSlot = el("div");
  const listSlot = el("div", "flex flex-col gap-3");
  const modalSlot = el("div");
  root.append(headerSlot, formSlot, listSlot, modalSlot);
  shell = { headerSlot, formSlot, listSlot, modalSlot };
  mountedFormOpen = false;
  mountedEditingTaskId = null;
  return shell;
}

export function renderApp(handlers) {
  currentHandlers = handlers;
  const { onCreateSubmit, onCreateCancel, onEditSubmit, onEditCancel, onDelete, onAddClick } = handlers;

  const root = document.getElementById("app");
  const { headerSlot, formSlot, listSlot, modalSlot } = ensureShell(root);

  headerSlot.innerHTML = "";
  headerSlot.append(renderHeader({ onAddClick }));

  // 폼 열림/닫힘 상태가 실제로 바뀔 때만 새로 만든다.
  // 그렇지 않으면 폴링 등으로 인한 재렌더링마다 입력 중이던 값이 초기화된다.
  const isFormOpen = state.isCreateFormOpen();
  if (isFormOpen !== mountedFormOpen) {
    mountedFormOpen = isFormOpen;
    formSlot.innerHTML = "";
    if (isFormOpen) {
      formSlot.append(renderTaskForm({ onSubmit: onCreateSubmit, onCancel: onCreateCancel }));
    }
  }

  const tasks = state.getTasks();
  listSlot.innerHTML = "";
  if (tasks.length === 0) {
    listSlot.append(el("p", "text-slate-500 dark:text-slate-400", "등록된 태스크가 없습니다."));
  } else {
    for (const task of tasks) {
      listSlot.append(
        renderTaskCard(task, {
          onCardClick: (id) => state.openEditModal(id),
          onDelete,
        })
      );
    }
  }

  // 수정 모달도 같은 이유로 editingTaskId가 실제로 바뀔 때만 새로 만든다.
  const editingTaskId = state.getEditingTaskId();
  if (editingTaskId !== mountedEditingTaskId) {
    mountedEditingTaskId = editingTaskId;
    modalSlot.innerHTML = "";
    if (editingTaskId) {
      const task = tasks.find((t) => t.id === editingTaskId);
      if (task) {
        modalSlot.append(
          renderEditModal({
            task,
            onSubmit: (input) => onEditSubmit(task.id, input),
            onCancel: onEditCancel,
          })
        );
      }
    }
  }
}

export { formatDueBadge, formatCreatedAt };
