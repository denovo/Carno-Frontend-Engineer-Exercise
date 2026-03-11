import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject, firstValueFrom } from "rxjs";
import { TaskEffects } from "./task.effects";
import { TaskMockService } from "@app/core/services/task-mock.service";
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
});
