import { describe, it, expect, beforeEach } from "vitest";
import { firstValueFrom } from "rxjs";
import { Priority } from "@app/shared/models";
import type { Task } from "@app/shared/models";
import { TaskMockService } from "./task-mock.service";
import { MOCK_TASKS } from "./mock-data";

describe("TaskMockService", () => {
  let service: TaskMockService;

  beforeEach(() => {
    service = new TaskMockService();
    service.latencyMs = 0;
  });

  it("loadTasks returns array with expected length", async () => {
    const tasks = await firstValueFrom(service.loadTasks("board-1"));
    expect(tasks).toHaveLength(MOCK_TASKS.length);
  });

  it("loadTasks with shouldFail=true rejects with Error", async () => {
    service.shouldFail = true;
    await expect(
      firstValueFrom(service.loadTasks("board-1"))
    ).rejects.toThrow();
  });

  it("moveTask with shouldFail=false resolves to undefined (void)", async () => {
    const result = await firstValueFrom(
      service.moveTask("task-1", "col-in-progress")
    );
    expect(result).toBeUndefined();
  });

  it("addTask returns task with auto-generated id and matching title", async () => {
    const partial: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
      title: "New test task",
      columnId: "col-todo",
      priority: Priority.Medium,
    };
    const task = await firstValueFrom(service.addTask(partial));
    expect(typeof task.id).toBe("string");
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe("New test task");
  });
});
