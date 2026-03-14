import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TaskCountWidgetComponent } from "./task-count-widget.component";
import type { WidgetStatus } from "@app/core/models/widget.models";

describe("TaskCountWidgetComponent", () => {
  let fixture: ComponentFixture<TaskCountWidgetComponent>;

  function createComponent(status: WidgetStatus<number>): ComponentFixture<TaskCountWidgetComponent> {
    TestBed.configureTestingModule({
      imports: [TaskCountWidgetComponent],
    });
    fixture = TestBed.createComponent(TaskCountWidgetComponent);
    fixture.componentRef.setInput("status", status);
    fixture.detectChanges();
    return fixture;
  }

  it("renders the task count value from status().value", () => {
    createComponent({ value: 5, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("5");
  });

  it("renders Tasks: label", () => {
    createComponent({ value: 3, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Tasks:");
  });

  it("applies status-neutral CSS class for neutral status", () => {
    createComponent({ value: 5, status: "neutral" });
    const dot = fixture.nativeElement.querySelector(".status-indicator") as HTMLElement;
    expect(dot).toBeTruthy();
    expect(dot.classList.contains("status-neutral")).toBe(true);
  });

  it("applies status-warning CSS class for warning status", () => {
    createComponent({ value: 8, status: "warning" });
    const dot = fixture.nativeElement.querySelector(".status-indicator") as HTMLElement;
    expect(dot.classList.contains("status-warning")).toBe(true);
  });

  it("applies status-error CSS class for error status", () => {
    createComponent({ value: 25, status: "error" });
    const dot = fixture.nativeElement.querySelector(".status-indicator") as HTMLElement;
    expect(dot.classList.contains("status-error")).toBe(true);
  });

  it("applies status-success CSS class for success status", () => {
    createComponent({ value: 0, status: "success" });
    const dot = fixture.nativeElement.querySelector(".status-indicator") as HTMLElement;
    expect(dot.classList.contains("status-success")).toBe(true);
  });

  it("renders different count values correctly", () => {
    createComponent({ value: 42, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("42");
  });
});
