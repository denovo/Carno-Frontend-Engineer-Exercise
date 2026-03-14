import { Component, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { CdkDrag, CdkDropList, CdkDragDrop } from "@angular/cdk/drag-drop";
import { Task, Column } from "@app/shared/models";
import { TaskCardComponent, MoveEvent } from "../task-card/task-card.component";

@Component({
  selector: "app-column",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    CdkDrag,
    CdkDropList,
    TaskCardComponent,
  ],
  templateUrl: "./column.component.html",
  styleUrl: "./column.component.scss",
})
export class ColumnComponent {
  column = input.required<Column>();
  tasks = input<Task[]>([]);
  allColumns = input<Column[]>([]);
  pendingTaskIds = input<Set<string>>(new Set());

  addTask = output<string>();
  moveTask = output<MoveEvent>();
  editTask = output<Task>();
  deleteTask = output<Task>();

  readonly isDragOver = signal(false);

  onDropped(event: CdkDragDrop<string>): void {
    this.isDragOver.set(false);
    if (event.previousContainer === event.container) return;

    const task = event.item.data as Task;
    this.moveTask.emit({
      taskId: task.id,
      previousColumnId: event.previousContainer.data,
      newColumnId: event.container.data,
    });
  }
}
