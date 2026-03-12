import { Component, input } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import type { WidgetStatus } from "@app/core/models/widget.models";

@Component({
  selector: "app-progress-widget",
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: "./progress-widget.component.html",
  styleUrl: "./progress-widget.component.scss",
})
export class ProgressWidgetComponent {
  readonly status = input.required<WidgetStatus<number>>();
}
