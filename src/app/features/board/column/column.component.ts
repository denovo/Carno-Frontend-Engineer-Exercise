import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { Task, Column } from "@app/shared/models";
import { TaskCardComponent, MoveEvent } from "../task-card/task-card.component";

@Component({
  selector: "app-column",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDividerModule, TaskCardComponent],
  templateUrl: "./column.component.html",
  styleUrl: "./column.component.scss",
})
export class ColumnComponent {
  // Inputs
  column = input.required<Column>();
  tasks = input<Task[]>([]);
  allColumns = input<Column[]>([]); // passed to TaskCard for move select
  pendingTaskIds = input<Set<string>>(new Set()); // from smart parent for optimistic feedback

  // Output events — bubbled from TaskCard or triggered by column buttons
  addTask = output<string>(); // emits columnId
  moveTask = output<MoveEvent>();
  editTask = output<Task>();
  deleteTask = output<Task>();
}
