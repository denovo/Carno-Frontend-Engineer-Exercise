import { Component, computed, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { Task, Column } from "@app/shared/models";
import { DONE_COLUMN_ID, OVERDUE_THRESHOLD_DAYS } from "@app/core/constants";

export interface MoveEvent {
  taskId: string;
  previousColumnId: string;
  newColumnId: string;
}

@Component({
  selector: "app-task-card",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  // SIG-01: input() signal API — task is a Signal<Task>
  task = input.required<Task>();
  // Pending state passed from smart parent (optimistic move feedback)
  isPending = input<boolean>(false);
  // Available columns for move select (passed from smart parent)
  columns = input<Column[]>([]);

  // Output events — dumb component never dispatches to store directly
  move = output<MoveEvent>();
  edit = output<Task>();
  delete = output<Task>();

  // SIG-05: Local UI state — signal() not model()
  // model() would enable parent two-way binding; signal() is correct here since
  // no parent binds to these states programmatically
  isExpanded = signal(false);
  isEditMode = signal(false);

  // SIG-02: Priority CSS class — lowercased enum value ("LOW" → "priority-low")
  priorityClass = computed(() => `priority-${this.task().priority.toLowerCase()}`);

  // SIG-03: Formatted date display — createdAt/updatedAt are Date objects (no parsing needed)
  formattedCreatedAt = computed(() =>
    this.task().createdAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );

  formattedUpdatedAt = computed(() =>
    this.task().updatedAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );

  // SIG-04: Overdue indicator — age-based, tasks in Done column are never overdue.
  // Known constraint: Date.now() is evaluated at computation time, not a live clock.
  // Recomputes when task() changes (e.g., after updateTaskSuccess). Acceptable for Phase 3.
  isOverdue = computed(() => {
    const t = this.task();
    if (t.columnId === DONE_COLUMN_ID) return false;
    const ageMs = Date.now() - t.createdAt.getTime();
    return ageMs / 86_400_000 > OVERDUE_THRESHOLD_DAYS;
  });

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
    // Collapse edit mode when collapsing card
    if (!this.isExpanded()) this.isEditMode.set(false);
  }

  enterEditMode(): void {
    this.isEditMode.set(true);
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
  }

  onMoveChange(newColumnId: string): void {
    const t = this.task();
    if (newColumnId !== t.columnId) {
      this.move.emit({ taskId: t.id, previousColumnId: t.columnId, newColumnId });
    }
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onDelete(): void {
    this.delete.emit(this.task());
  }
}
