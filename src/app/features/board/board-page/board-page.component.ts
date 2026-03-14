import { Component, DestroyRef, inject, OnInit, signal, Signal } from "@angular/core";
import { TaskMockService } from "@app/core/services/task-mock.service";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { Actions, ofType } from "@ngrx/effects";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Update } from "@ngrx/entity";

import {
  loadTasks,
  addTask,
  moveTask,
  moveTaskSuccess,
  moveTaskFailure,
  updateTask,
  removeTask,
  selectLoading,
  selectTasksByColumn,
  selectAllTasks,
} from "@app/core/store";
import { MOCK_COLUMNS } from "@app/core/services/mock-data";
import { ThemeService } from "@app/core/services/theme.service";
import { Task } from "@app/shared/models";

import { ColumnComponent } from "../column/column.component";
import {
  TaskFormComponent,
  TaskFormData,
  TaskFormResult,
} from "../task-form/task-form.component";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { MoveEvent } from "../task-card/task-card.component";
import { WidgetBarComponent } from "../widget-bar/widget-bar.component";

@Component({
  selector: "app-board-page",
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    ColumnComponent,
    WidgetBarComponent,
  ],
  templateUrl: "./board-page.component.html",
  styleUrl: "./board-page.component.scss",
})
export class BoardPageComponent implements OnInit {
  private readonly store = inject(Store);
  readonly theme = inject(ThemeService);
  private readonly actions$ = inject(Actions);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskMockService = inject(TaskMockService);

  // SIG-07: NGRX → Angular Signal bridge via store.selectSignal()
  readonly loading = this.store.selectSignal(selectLoading);

  // Available columns (from mock seed — static for Phase 3)
  readonly columns = MOCK_COLUMNS;

  // SIG-07: Per-column task signals — created once at class init, not in template
  // Anti-pattern avoided: factory selector NOT called inside template expressions
  readonly tasksByColumn: Record<string, Signal<Task[]>> = Object.fromEntries(
    MOCK_COLUMNS.map((col) => [
      col.id,
      this.store.selectSignal(selectTasksByColumn(col.id)),
    ])
  );

  // Local signal for pending task IDs (optimistic move feedback)
  private readonly pendingTaskIds = signal<Set<string>>(new Set());

  readonly getPendingTaskIds = () => this.pendingTaskIds();

  ngOnInit(): void {
    // Skip mock load if localStorage already hydrated the store with persisted tasks
    if (this.store.selectSignal(selectAllTasks)().length === 0) {
      this.store.dispatch(loadTasks({ boardId: "board-1" }));
    }

    // Listen for move outcomes to clear pending state and show failure toast
    this.actions$
      .pipe(
        ofType(moveTaskSuccess, moveTaskFailure),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((action) => {
        this.pendingTaskIds.update((s) => {
          const next = new Set(s);
          next.delete(action.taskId);
          return next;
        });

        if (action.type === moveTaskFailure.type) {
          this.snackBar.open("Failed to move task — reverted", "Dismiss", {
            duration: 4000,
            horizontalPosition: "end",
            verticalPosition: "bottom",
          });
        }
      });

    // E2E test seam: ?failNextMove=1 simulates server failure for rollback test.
    // Sets shouldFail=true for one operation only; the rollback spec navigates fresh
    // and performs exactly one move — ensuring the flag is consumed exactly once.
    const params = new URLSearchParams(window.location.search);
    if (params.get("failNextMove") === "1") {
      this.taskMockService.shouldFail = true;
    }
  }

  // --- CRUD handlers — all dispatch calls live here (APP-08) ---

  onAddTask(columnId: string, showColumnSelector = false): void {
    const ref = this.dialog.open<TaskFormComponent, TaskFormData, TaskFormResult>(
      TaskFormComponent,
      {
        width: "480px",
        data: {
          defaultColumnId: columnId,
          columns: this.columns,
          showColumnSelector,
        },
      }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(
          addTask({
            task: {
              title: result.title,
              description: result.description || undefined,
              columnId: result.columnId,
              priority: result.priority,
              assignee: result.assignee || undefined,
            },
          })
        );
      }
    });
  }

  onMoveTask(event: MoveEvent): void {
    this.pendingTaskIds.update((s) => new Set(s).add(event.taskId));
    this.store.dispatch(
      moveTask({
        taskId: event.taskId,
        previousColumnId: event.previousColumnId,
        newColumnId: event.newColumnId,
      })
    );
  }

  onEditTask(task: Task): void {
    const ref = this.dialog.open<TaskFormComponent, TaskFormData, TaskFormResult>(
      TaskFormComponent,
      {
        width: "480px",
        data: {
          task,
          defaultColumnId: task.columnId,
          columns: this.columns,
          showColumnSelector: false,
        },
      }
    );
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const changes: Update<Task> = {
          id: task.id,
          changes: {
            title: result.title,
            description: result.description || undefined,
            priority: result.priority,
            assignee: result.assignee || undefined,
          },
        };
        this.store.dispatch(updateTask({ update: changes }));
      }
    });
  }

  onDeleteTask(task: Task): void {
    const ref = this.dialog.open<ConfirmDialogComponent, void, boolean>(
      ConfirmDialogComponent,
      { width: "360px" }
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.store.dispatch(removeTask({ taskId: task.id }));
      }
    });
  }

  onGlobalAddTask(): void {
    // Opens form with column selector — defaults to first column
    this.onAddTask(this.columns[0].id, true);
  }
}
