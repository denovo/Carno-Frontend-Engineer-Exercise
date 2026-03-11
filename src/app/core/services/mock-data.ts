import type { Board, Column, Task } from "@app/shared/models";
import { Priority } from "@app/shared/models";
import { DONE_COLUMN_ID } from "@app/core/constants";

export const MOCK_COLUMNS: Column[] = [
  { id: "col-todo", name: "Todo", order: 0 },
  { id: "col-in-progress", name: "In Progress", order: 1 },
  { id: DONE_COLUMN_ID, name: "Done", order: 2 },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Design login screen",
    description: "Create wireframes for the login UI",
    columnId: "col-todo",
    priority: Priority.Low,
    assignee: "alice",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "task-2",
    title: "Set up CI pipeline",
    description: "Configure GitHub Actions for lint, test, build",
    columnId: "col-todo",
    priority: Priority.Medium,
    assignee: "bob",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "task-3",
    title: "Implement authentication",
    description: "JWT-based auth with refresh token",
    columnId: "col-todo",
    priority: Priority.High,
    assignee: "alice",
    createdAt: new Date("2026-01-03"),
    updatedAt: new Date("2026-01-03"),
  },
  {
    id: "task-4",
    title: "Fix production bug",
    description: "Null pointer exception in task list",
    columnId: "col-in-progress",
    priority: Priority.Critical,
    assignee: "charlie",
    createdAt: new Date("2026-01-04"),
    updatedAt: new Date("2026-01-05"),
  },
  {
    id: "task-5",
    title: "Performance profiling",
    description: "Profile board rendering with large datasets",
    columnId: "col-in-progress",
    priority: Priority.High,
    assignee: "bob",
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
  },
  {
    id: "task-6",
    title: "Write API documentation",
    description: "Document all REST endpoints",
    columnId: DONE_COLUMN_ID,
    priority: Priority.Medium,
    assignee: "alice",
    createdAt: new Date("2026-01-06"),
    updatedAt: new Date("2026-01-07"),
  },
];

export const MOCK_BOARD: Board = {
  id: "board-1",
  name: "Petello Board",
  columns: MOCK_COLUMNS,
};
