import { TestBed } from "@angular/core/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { selectAllTasks } from "@app/core/store";
import { Task, Priority } from "@app/shared/models";
import { WidgetBarComponent } from "./widget-bar.component";

/** Helper: build a minimal Task array of given length */
function makeTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    title: `Task ${i}`,
    columnId: "col-todo",
    priority: Priority.Low,
    order: i,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

describe("WidgetBarComponent", () => {
  function setup(tasks: Task[]) {
    TestBed.configureTestingModule({
      imports: [WidgetBarComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectAllTasks, value: tasks }],
        }),
      ],
    });

    const fixture = TestBed.createComponent(WidgetBarComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it("taskCountStatus returns 'neutral' when task count is 0", () => {
    const component = setup(makeTasks(0));
    expect(component.taskCountStatus().status).toBe("neutral");
    expect(component.taskCountStatus().value).toBe(0);
  });

  it("taskCountStatus returns 'neutral' when task count equals WARNING threshold (10)", () => {
    const component = setup(makeTasks(10));
    expect(component.taskCountStatus().status).toBe("neutral");
  });

  it("taskCountStatus returns 'warning' when task count is 15 (between thresholds)", () => {
    const component = setup(makeTasks(15));
    expect(component.taskCountStatus().status).toBe("warning");
    expect(component.taskCountStatus().value).toBe(15);
  });

  it("taskCountStatus returns 'warning' when task count equals ERROR threshold (20)", () => {
    const component = setup(makeTasks(20));
    expect(component.taskCountStatus().status).toBe("warning");
  });

  it("taskCountStatus returns 'error' when task count is 25 (above ERROR threshold)", () => {
    const component = setup(makeTasks(25));
    expect(component.taskCountStatus().status).toBe("error");
    expect(component.taskCountStatus().value).toBe(25);
  });

  it("progressStatus.value equals the completionRate from the store", () => {
    // With all tasks in col-todo and no tasks in col-done, rate is 0
    const component = setup(makeTasks(4));
    expect(component.progressStatus().status).toBe("neutral");
    expect(component.progressStatus().value).toBe(0);
  });

  it("widgetConfigs is a plain array (not a signal) with two entries", () => {
    const component = setup(makeTasks(3));
    expect(Array.isArray(component.widgetConfigs)).toBe(true);
    expect(component.widgetConfigs.length).toBe(2);
  });
});
