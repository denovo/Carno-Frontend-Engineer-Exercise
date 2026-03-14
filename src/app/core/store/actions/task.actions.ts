import { createAction, props } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { Task } from "@app/shared/models";

// --- Load Tasks (NGR-01) ---
export const loadTasks = createAction(
  "[Board Page] Load Tasks",
  props<{ boardId: string }>()
);
export const loadTasksSuccess = createAction(
  "[Task API] Load Tasks Success",
  props<{ tasks: Task[] }>()
);
export const loadTasksFailure = createAction(
  "[Task API] Load Tasks Failure",
  props<{ error: string }>()
);

// --- Add Task (NGR-02) ---
export const addTask = createAction(
  "[Task Form] Add Task",
  props<{ task: Omit<Task, "id" | "order" | "createdAt" | "updatedAt"> }>()
);
export const addTaskSuccess = createAction(
  "[Task API] Add Task Success",
  props<{ task: Task }>()
);
export const addTaskFailure = createAction(
  "[Task API] Add Task Failure",
  props<{ error: string }>()
);

// --- Move Task — carries previousColumnId for optimistic rollback (NGR-03, NGR-10) ---
export const moveTask = createAction(
  "[Task Card] Move Task",
  props<{ taskId: string; previousColumnId: string; newColumnId: string }>()
);
export const moveTaskSuccess = createAction(
  "[Task API] Move Task Success",
  props<{ taskId: string }>()
);
export const moveTaskFailure = createAction(
  "[Task API] Move Task Failure",
  props<{ taskId: string; previousColumnId: string; error: string }>()
);

// --- Update Task (NGR-04) ---
export const updateTask = createAction(
  "[Task Form] Update Task",
  props<{ update: Update<Task> }>()
);
export const updateTaskSuccess = createAction(
  "[Task API] Update Task Success",
  props<{ update: Update<Task> }>()
);
export const updateTaskFailure = createAction(
  "[Task API] Update Task Failure",
  props<{ error: string }>()
);

// --- Reorder Task within a column (NGR-11) ---
export const reorderTask = createAction(
  "[Task Card] Reorder Task",
  props<{ columnId: string; fromIndex: number; toIndex: number }>()
);

// --- Remove Task (NGR-05) ---
export const removeTask = createAction(
  "[Task Card] Remove Task",
  props<{ taskId: string }>()
);
export const removeTaskSuccess = createAction(
  "[Task API] Remove Task Success",
  props<{ taskId: string }>()
);
export const removeTaskFailure = createAction(
  "[Task API] Remove Task Failure",
  props<{ error: string }>()
);

// --- Clear all tasks in a column (used when deleting a column) ---
export const clearColumnTasks = createAction(
  "[Board Page] Clear Column Tasks",
  props<{ columnId: string }>()
);
