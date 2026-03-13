import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject, firstValueFrom } from "rxjs";
import { TaskEffects } from "./task.effects";
import { TaskMockService } from "@app/core/services/task-mock.service";
import { Priority } from "@app/shared/models";
import * as TaskActions from "../actions/task.actions";

describe("TaskEffects", () => {
  let effects: TaskEffects;
  let actions$: ReplaySubject<any>;
  let taskService: TaskMockService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    taskService = new TaskMockService();
    taskService.latencyMs = 0; // Fast tests — no wall-clock delay

    TestBed.configureTestingModule({
      providers: [
        TaskEffects,
        provideMockActions(() => actions$),
        { provide: TaskMockService, useValue: taskService },
      ],
    });

    effects = TestBed.inject(TaskEffects);
  });

  describe("moveTask$", () => {
    it("dispatches moveTaskFailure with previousColumnId when service fails", async () => {
      taskService.shouldFail = true;
      actions$.next(
        TaskActions.moveTask({
          taskId: "task-1",
          previousColumnId: "col-todo",
          newColumnId: "col-done",
        })
      );

      const result = await firstValueFrom(effects.moveTask$);
      expect(result.type).toBe(TaskActions.moveTaskFailure.type);
      expect((result as ReturnType<typeof TaskActions.moveTaskFailure>).previousColumnId).toBe("col-todo");
    });

    it("dispatches moveTaskSuccess when service succeeds", async () => {
      taskService.shouldFail = false;
      actions$.next(
        TaskActions.moveTask({
          taskId: "task-1",
          previousColumnId: "col-todo",
          newColumnId: "col-done",
        })
      );

      const result = await firstValueFrom(effects.moveTask$);
      expect(result.type).toBe(TaskActions.moveTaskSuccess.type);
      expect((result as ReturnType<typeof TaskActions.moveTaskSuccess>).taskId).toBe("task-1");
    });
  });

  describe("loadTasks$", () => {
    it("dispatches loadTasksFailure when service fails", async () => {
      taskService.shouldFail = true;
      actions$.next(TaskActions.loadTasks({ boardId: "board-1" }));

      const result = await firstValueFrom(effects.loadTasks$);
      expect(result.type).toBe(TaskActions.loadTasksFailure.type);
    });
  });

  describe("addTask$", () => {
    const partialTask = {
      title: "New task",
      columnId: "col-todo",
      priority: Priority.Medium,
    };

    it("dispatches addTaskSuccess with a generated Task when service succeeds", async () => {
      actions$.next(TaskActions.addTask({ task: partialTask }));

      const result = await firstValueFrom(effects.addTask$);
      expect(result.type).toBe(TaskActions.addTaskSuccess.type);
      const task = (result as ReturnType<typeof TaskActions.addTaskSuccess>).task;
      expect(task.title).toBe("New task");
      expect(task.id).toBeTruthy();
    });

    it("dispatches addTaskFailure when service fails", async () => {
      taskService.shouldFail = true;
      actions$.next(TaskActions.addTask({ task: partialTask }));

      const result = await firstValueFrom(effects.addTask$);
      expect(result.type).toBe(TaskActions.addTaskFailure.type);
    });
  });

  describe("updateTask$", () => {
    const update = { id: "task-1", changes: { title: "Updated" } };

    it("dispatches updateTaskSuccess with the same update when service succeeds", async () => {
      actions$.next(TaskActions.updateTask({ update }));

      const result = await firstValueFrom(effects.updateTask$);
      expect(result.type).toBe(TaskActions.updateTaskSuccess.type);
      expect((result as ReturnType<typeof TaskActions.updateTaskSuccess>).update).toEqual(update);
    });

    it("dispatches updateTaskFailure when service fails", async () => {
      taskService.shouldFail = true;
      actions$.next(TaskActions.updateTask({ update }));

      const result = await firstValueFrom(effects.updateTask$);
      expect(result.type).toBe(TaskActions.updateTaskFailure.type);
    });
  });

  describe("removeTask$", () => {
    it("dispatches removeTaskSuccess with taskId when service succeeds", async () => {
      actions$.next(TaskActions.removeTask({ taskId: "task-1" }));

      const result = await firstValueFrom(effects.removeTask$);
      expect(result.type).toBe(TaskActions.removeTaskSuccess.type);
      expect((result as ReturnType<typeof TaskActions.removeTaskSuccess>).taskId).toBe("task-1");
    });

    it("dispatches removeTaskFailure when service fails", async () => {
      taskService.shouldFail = true;
      actions$.next(TaskActions.removeTask({ taskId: "task-1" }));

      const result = await firstValueFrom(effects.removeTask$);
      expect(result.type).toBe(TaskActions.removeTaskFailure.type);
    });
  });
});
