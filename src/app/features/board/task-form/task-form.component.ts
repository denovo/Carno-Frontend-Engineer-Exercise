import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { Task, Column, Priority } from "@app/shared/models";

export interface TaskFormData {
  task?: Task; // present when editing; absent when creating
  defaultColumnId: string; // pre-seeded column
  columns: Column[]; // for column selector (shown when showColumnSelector=true)
  showColumnSelector: boolean; // true only for global "+ Add Task" toolbar button
}

export interface TaskFormResult {
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  columnId: string;
}

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.scss",
})
export class TaskFormComponent {
  private readonly dialogRef =
    inject<MatDialogRef<TaskFormComponent, TaskFormResult>>(MatDialogRef);
  readonly data = inject<TaskFormData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly isEditMode = !!this.data.task;
  readonly priorityOptions = Object.values(Priority);

  readonly form = this.fb.group({
    title: [this.data.task?.title ?? "", [Validators.required, Validators.minLength(1)]],
    description: [this.data.task?.description ?? ""],
    priority: [this.data.task?.priority ?? Priority.Medium],
    assignee: [this.data.task?.assignee ?? ""],
    columnId: [this.data.task?.columnId ?? this.data.defaultColumnId],
  });

  submit(): void {
    if (this.form.invalid) return;
    // getRawValue() includes disabled controls — safer than .value
    this.dialogRef.close(this.form.getRawValue() as TaskFormResult);
  }

  cancel(): void {
    this.dialogRef.close(); // emits undefined — caller guards with if(result)
  }
}
