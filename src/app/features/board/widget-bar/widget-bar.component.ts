import { Component, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { DynamicWidgetOutletDirective } from "@app/core/directives/dynamic-widget-outlet.directive";
import { selectAllTasks, selectCompletionRate } from "@app/core/store";
import {
  DONE_COLUMN_ID,
  WIDGET_TASK_COUNT_WARNING,
  WIDGET_TASK_COUNT_ERROR,
} from "@app/core/constants";
import type { WidgetConfig, WidgetStatus } from "@app/core/models/widget.models";
import { TaskCountWidgetComponent } from "../task-count-widget/task-count-widget.component";
import { ProgressWidgetComponent } from "../progress-widget/progress-widget.component";

@Component({
  selector: "app-widget-bar",
  standalone: true,
  imports: [DynamicWidgetOutletDirective],
  templateUrl: "./widget-bar.component.html",
  styleUrl: "./widget-bar.component.scss",
})
export class WidgetBarComponent {
  private readonly store = inject(Store);

  // Store signals — factory selectors called ONCE at field init (Pitfall 4: memoization safety)
  private readonly totalTasks = this.store.selectSignal(selectAllTasks);
  private readonly completionRate = this.store.selectSignal(
    selectCompletionRate(DONE_COLUMN_ID)
  );

  readonly taskCountStatus = computed<WidgetStatus<number>>(() => {
    const count = this.totalTasks().length;
    return {
      value: count,
      status:
        count <= WIDGET_TASK_COUNT_WARNING
          ? "neutral"
          : count <= WIDGET_TASK_COUNT_ERROR
            ? "warning"
            : "error",
    };
  });

  readonly progressStatus = computed<WidgetStatus<number>>(() => ({
    value: this.completionRate(),
    status: "neutral",
  }));

  // Plain array — not a signal. Component set is static; signal effects handle value updates.
  readonly widgetConfigs: WidgetConfig<object>[] = [
    {
      component: TaskCountWidgetComponent,
      inputs: {
        status: { type: "signal", value: this.taskCountStatus },
      },
    },
    {
      component: ProgressWidgetComponent,
      inputs: {
        status: { type: "signal", value: this.progressStatus },
      },
    },
  ];
}
