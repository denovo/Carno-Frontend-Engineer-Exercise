import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { WidgetStatus } from "@app/core/models/widget.models";

@Component({
  selector: "app-task-count-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./task-count-widget.component.html",
  styleUrl: "./task-count-widget.component.scss",
})
export class TaskCountWidgetComponent {
  readonly status = input.required<WidgetStatus<number>>();
}
