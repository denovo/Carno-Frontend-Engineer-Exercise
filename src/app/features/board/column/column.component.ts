import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { CdkDrag, CdkDropList, CdkDragDrop } from "@angular/cdk/drag-drop";
import { Task, Column } from "@app/shared/models";
import { TaskCardComponent, MoveEvent } from "../task-card/task-card.component";

export interface ReorderEvent {
  columnId: string;
  fromIndex: number;
  toIndex: number;
}

@Component({
  selector: "app-column",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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
  reorderTask = output<ReorderEvent>();
  editTask = output<Task>();
  deleteTask = output<Task>();
  renameColumn = output<string>();
  deleteColumn = output<void>();

  readonly isDragOver = signal(false);
  readonly isEditingName = signal(false);
  readonly editNameValue = signal("");

  @ViewChild("nameInput") private nameInputEl?: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      if (this.isEditingName()) {
        setTimeout(() => this.nameInputEl?.nativeElement.focus(), 0);
      }
    });
  }

  startEditName(): void {
    this.editNameValue.set(this.column().name);
    this.isEditingName.set(true);
  }

  saveEditName(): void {
    const name = this.editNameValue().trim();
    if (name && name !== this.column().name) {
      this.renameColumn.emit(name);
    }
    this.isEditingName.set(false);
  }

  cancelEditName(): void {
    this.isEditingName.set(false);
  }

  onDropped(event: CdkDragDrop<string>): void {
    this.isDragOver.set(false);
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        this.reorderTask.emit({
          columnId: this.column().id,
          fromIndex: event.previousIndex,
          toIndex: event.currentIndex,
        });
      }
    } else {
      const task = event.item.data as Task;
      this.moveTask.emit({
        taskId: task.id,
        previousColumnId: event.previousContainer.data,
        newColumnId: event.container.data,
      });
    }
  }
}
