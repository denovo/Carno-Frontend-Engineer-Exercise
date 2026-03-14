import { describe, it, expect } from "vitest";
import { selectTasksByColumn, selectCountByPriority, selectCompletionRate } from "./task.selectors";
import { Priority, Task } from "@app/shared/models";

const tasks: Task[] = [
  { id: "1", title: "T1", columnId: "col-todo", priority: Priority.High, order: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", title: "T2", columnId: "col-todo", priority: Priority.Medium, order: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", title: "T3", columnId: "col-done", priority: Priority.High, order: 0, createdAt: new Date(), updatedAt: new Date() },
];

describe("selectTasksByColumn", () => {
  it("filters tasks to only those in the given column", () => {
    const result = selectTasksByColumn("col-todo").projector(tasks);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.columnId === "col-todo")).toBe(true);
  });
});

describe("selectCountByPriority", () => {
  it("counts tasks by priority across all columns", () => {
    const result = selectCountByPriority.projector(tasks);
    expect(result[Priority.High]).toBe(2);
    expect(result[Priority.Medium]).toBe(1);
    expect(result[Priority.Low]).toBe(0);
    expect(result[Priority.Critical]).toBe(0);
  });
});

describe("selectCompletionRate", () => {
  it("returns the rounded percentage of tasks in the done column", () => {
    const result = selectCompletionRate("col-done").projector(tasks);
    expect(result).toBe(33); // 1/3 = 33.33% rounded to 33
  });

  it("returns 0 when the task list is empty (no division by zero)", () => {
    const result = selectCompletionRate("col-done").projector([]);
    expect(result).toBe(0);
  });
});
