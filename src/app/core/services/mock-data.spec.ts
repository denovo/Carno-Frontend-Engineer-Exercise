import { describe, it, expect } from "vitest";
import { MOCK_BOARD, MOCK_COLUMNS, MOCK_TASKS } from "./mock-data";
import { DONE_COLUMN_ID } from "@app/core/constants";
import { Priority } from "@app/shared/models";

describe("mock-data seed", () => {
  it("DONE_COLUMN_ID equals col-done", () => {
    expect(DONE_COLUMN_ID).toBe("col-done");
  });

  it("MOCK_BOARD has id=board-1 and name=Petello Board", () => {
    expect(MOCK_BOARD.id).toBe("board-1");
    expect(MOCK_BOARD.name).toBe("Petello Board");
  });

  it("MOCK_COLUMNS has 3 columns with correct ids", () => {
    const ids = MOCK_COLUMNS.map((c) => c.id);
    expect(ids).toContain("col-todo");
    expect(ids).toContain("col-in-progress");
    expect(ids).toContain(DONE_COLUMN_ID);
  });

  it("MOCK_TASKS has at least 5 tasks covering all 4 Priority values", () => {
    expect(MOCK_TASKS.length).toBeGreaterThanOrEqual(5);
    const priorities = MOCK_TASKS.map((t) => t.priority);
    expect(priorities).toContain(Priority.Low);
    expect(priorities).toContain(Priority.Medium);
    expect(priorities).toContain(Priority.High);
    expect(priorities).toContain(Priority.Critical);
  });

  it("MOCK_TASKS has at least 1 task in col-done for completion rate tests", () => {
    const doneTasks = MOCK_TASKS.filter((t) => t.columnId === DONE_COLUMN_ID);
    expect(doneTasks.length).toBeGreaterThanOrEqual(1);
  });

  it("MOCK_TASKS createdAt and updatedAt are Date instances", () => {
    for (const task of MOCK_TASKS) {
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    }
  });
});
