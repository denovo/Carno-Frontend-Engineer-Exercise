import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, map, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { TaskMockService } from "@app/core/services/task-mock.service";
import * as TaskActions from "../actions/task.actions";

@Injectable()
export class TaskEffects {
  // CRITICAL: inject() fields MUST be declared before createEffect() fields.
  // Vitest initializes class fields in declaration order; createEffect() executes
  // during instantiation and reads this.actions$. If actions$ is declared after
  // the effect, it is undefined at that point (NGRX issue #4708).
  private readonly actions$ = inject(Actions);
  private readonly taskService = inject(TaskMockService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      concatMap(({ boardId }) =>
        this.taskService.loadTasks(boardId).pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((err: unknown) =>
            of(
              TaskActions.loadTasksFailure({
                error: err instanceof Error ? err.message : "Load failed",
              })
            )
          )
        )
      )
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.addTask),
      concatMap(({ task }) =>
        this.taskService.addTask(task).pipe(
          map((newTask) => TaskActions.addTaskSuccess({ task: newTask })),
          catchError((err: unknown) =>
            of(
              TaskActions.addTaskFailure({
                error: err instanceof Error ? err.message : "Add failed",
              })
            )
          )
        )
      )
    )
  );

  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.moveTask),
      concatMap(({ taskId, previousColumnId, newColumnId }) =>
        this.taskService.moveTask(taskId, newColumnId).pipe(
          map(() => TaskActions.moveTaskSuccess({ taskId })),
          catchError((err: unknown) =>
            of(
              TaskActions.moveTaskFailure({
                taskId,
                previousColumnId,
                error: err instanceof Error ? err.message : "Move failed",
              })
            )
          )
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      concatMap(({ update }) =>
        this.taskService.updateTask(update).pipe(
          map(() => TaskActions.updateTaskSuccess({ update })),
          catchError((err: unknown) =>
            of(
              TaskActions.updateTaskFailure({
                error: err instanceof Error ? err.message : "Update failed",
              })
            )
          )
        )
      )
    )
  );

  removeTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.removeTask),
      concatMap(({ taskId }) =>
        this.taskService.removeTask(taskId).pipe(
          map(() => TaskActions.removeTaskSuccess({ taskId })),
          catchError((err: unknown) =>
            of(
              TaskActions.removeTaskFailure({
                error: err instanceof Error ? err.message : "Remove failed",
              })
            )
          )
        )
      )
    )
  );
}
