import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { TaskCardComponent } from "./task-card.component";
import { Task, Priority } from "@app/shared/models";
import { DONE_COLUMN_ID } from "@app/core/constants";

function makeTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  return {
    id: "t1",
    title: "Test Task",
    description: "A test description",
    columnId: "col-todo",
    priority: Priority.Medium,
    assignee: "Alice",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("TaskCardComponent", () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  function setup(task: Task) {
    TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [provideAnimationsAsync()],
    });
    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("task", task);
    fixture.detectChanges();
  }

  describe("SIG-02: priorityClass", () => {
    it("returns priority-low for Priority.Low", () => {
      setup(makeTask({ priority: Priority.Low }));
      expect(component.priorityClass()).toBe("priority-low");
    });

    it("returns priority-medium for Priority.Medium", () => {
      setup(makeTask({ priority: Priority.Medium }));
      expect(component.priorityClass()).toBe("priority-medium");
    });

    it("returns priority-high for Priority.High", () => {
      setup(makeTask({ priority: Priority.High }));
      expect(component.priorityClass()).toBe("priority-high");
    });

    it("returns priority-critical for Priority.Critical", () => {
      setup(makeTask({ priority: Priority.Critical }));
      expect(component.priorityClass()).toBe("priority-critical");
    });
  });

  describe("SIG-03: formattedCreatedAt", () => {
    it("returns a non-empty string for a valid createdAt date", () => {
      setup(makeTask({ createdAt: new Date("2025-01-15") }));
      expect(component.formattedCreatedAt()).toBeTruthy();
      expect(typeof component.formattedCreatedAt()).toBe("string");
    });

    it("returns a non-empty string for formattedUpdatedAt", () => {
      setup(makeTask({ updatedAt: new Date("2025-06-20") }));
      expect(component.formattedUpdatedAt()).toBeTruthy();
      expect(typeof component.formattedUpdatedAt()).toBe("string");
    });
  });

  describe("SIG-04: isOverdue", () => {
    it("returns false when columnId === DONE_COLUMN_ID regardless of age", () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
      setup(makeTask({ columnId: DONE_COLUMN_ID, createdAt: thirtyDaysAgo }));
      expect(component.isOverdue()).toBe(false);
    });

    it("returns true when task is older than 7 days and not in Done column", () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
      setup(makeTask({ columnId: "col-todo", createdAt: thirtyDaysAgo }));
      expect(component.isOverdue()).toBe(true);
    });

    it("returns false when task is recent (created today) and not in Done column", () => {
      setup(makeTask({ columnId: "col-todo", createdAt: new Date() }));
      expect(component.isOverdue()).toBe(false);
    });
  });

  describe("SIG-05: isExpanded and isEditMode", () => {
    it("isExpanded defaults to false", () => {
      setup(makeTask());
      expect(component.isExpanded()).toBe(false);
    });

    it("calling toggleExpand() sets isExpanded to true", () => {
      setup(makeTask());
      component.toggleExpand();
      expect(component.isExpanded()).toBe(true);
    });

    it("isEditMode defaults to false", () => {
      setup(makeTask());
      expect(component.isEditMode()).toBe(false);
    });

    it("isEditMode is independent of isExpanded", () => {
      setup(makeTask());
      component.toggleExpand();
      expect(component.isExpanded()).toBe(true);
      expect(component.isEditMode()).toBe(false);
    });
  });
});
