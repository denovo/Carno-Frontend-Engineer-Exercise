import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewChild,
  effect,
  inject,
  OnInit,
  signal,
  Signal,
} from "@angular/core";
import { TaskMockService } from "@app/core/services/task-mock.service";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Store } from "@ngrx/store";
import { Actions, ofType } from "@ngrx/effects";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Update } from "@ngrx/entity";
import { CdkDropListGroup } from "@angular/cdk/drag-drop";
import { ReorderEvent } from "../column/column.component";

import {
  loadTasks,
  addTask,
  moveTask,
  moveTaskSuccess,
  moveTaskFailure,
  reorderTask,
  updateTask,
  removeTask,
  clearColumnTasks,
  selectLoading,
  selectTasksByColumn,
  selectAllTasks,
  BoardActions,
  selectBoardName,
  selectColumns,
} from "@app/core/store";
import { ThemeService } from "@app/core/services/theme.service";
import { Column, Task } from "@app/shared/models";

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
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule,
    CdkDropListGroup,
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
  readonly columns = this.store.selectSignal(selectColumns);
  readonly boardName = this.store.selectSignal(selectBoardName);

  // Per-column task signals — cached by column ID to avoid recreating on each render
  private readonly colSignalCache = new Map<string, Signal<Task[]>>();

  getTasksForColumn(columnId: string): Signal<Task[]> {
    if (!this.colSignalCache.has(columnId)) {
      this.colSignalCache.set(
        columnId,
        this.store.selectSignal(selectTasksByColumn(columnId))
      );
    }
    return this.colSignalCache.get(columnId)!;
  }

  // Local signal for pending task IDs (optimistic move feedback)
  private readonly pendingTaskIds = signal<Set<string>>(new Set());
  readonly getPendingTaskIds = () => this.pendingTaskIds();

  // Board name inline editing
  readonly isEditingBoardName = signal(false);
  readonly editBoardNameValue = signal("");
  @ViewChild("boardNameInput") private boardNameInputEl?: ElementRef<HTMLInputElement>;

  // Add column dialog
  readonly newColumnName = signal("");
  @ViewChild("addColumnDialog") private addColumnDialogRef!: TemplateRef<unknown>;

  constructor() {
    effect(() => {
      if (this.isEditingBoardName()) {
        setTimeout(() => this.boardNameInputEl?.nativeElement.focus(), 0);
      }
    });
  }

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
    const params = new URLSearchParams(window.location.search);
    if (params.get("failNextMove") === "1") {
      this.taskMockService.shouldFail = true;
    }
  }

  // --- Board management ---

  startEditBoardName(): void {
    this.editBoardNameValue.set(this.boardName());
    this.isEditingBoardName.set(true);
  }

  saveEditBoardName(): void {
    const name = this.editBoardNameValue().trim();
    if (name && name !== this.boardName()) {
      this.store.dispatch(BoardActions.updateBoardName({ name }));
    }
    this.isEditingBoardName.set(false);
  }

  openAddColumnDialog(): void {
    this.newColumnName.set("");
    this.dialog
      .open(this.addColumnDialogRef, { width: "320px" })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) this.saveNewColumn();
      });
  }

  saveNewColumn(): void {
    const name = this.newColumnName().trim();
    if (name) {
      const column: Column = {
        id: `col-${crypto.randomUUID()}`,
        name,
        order: this.columns().length,
      };
      this.store.dispatch(BoardActions.addColumn({ column }));
    }
  }

  onRenameColumn(columnId: string, name: string): void {
    this.store.dispatch(BoardActions.renameColumn({ id: columnId, name }));
  }

  onDeleteColumn(columnId: string): void {
    const ref = this.dialog.open<ConfirmDialogComponent, void, boolean>(
      ConfirmDialogComponent,
      { width: "360px" }
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.store.dispatch(clearColumnTasks({ columnId }));
        this.store.dispatch(BoardActions.removeColumn({ id: columnId }));
      }
    });
  }

  // --- CRUD handlers — all dispatch calls live here (APP-08) ---

  onAddTask(columnId: string, showColumnSelector = false): void {
    const ref = this.dialog.open<TaskFormComponent, TaskFormData, TaskFormResult>(
      TaskFormComponent,
      {
        width: "480px",
        data: {
          defaultColumnId: columnId,
          columns: this.columns(),
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

  onReorderTask(event: ReorderEvent): void {
    this.store.dispatch(reorderTask(event));
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
          columns: this.columns(),
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
    const cols = this.columns();
    if (cols.length > 0) {
      this.onAddTask(cols[0].id, true);
    }
  }
}
