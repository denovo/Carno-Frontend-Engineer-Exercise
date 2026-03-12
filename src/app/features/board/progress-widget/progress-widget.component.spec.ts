import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ProgressWidgetComponent } from "./progress-widget.component";
import type { WidgetStatus } from "@app/core/models/widget.models";

describe("ProgressWidgetComponent", () => {
  let fixture: ComponentFixture<ProgressWidgetComponent>;

  function createComponent(status: WidgetStatus<number>): ComponentFixture<ProgressWidgetComponent> {
    TestBed.configureTestingModule({
      imports: [ProgressWidgetComponent],
      providers: [provideAnimationsAsync()],
    });
    fixture = TestBed.createComponent(ProgressWidgetComponent);
    fixture.componentRef.setInput("status", status);
    fixture.detectChanges();
    return fixture;
  }

  it("renders a mat-progress-bar element", () => {
    createComponent({ value: 50, status: "neutral" });
    const bar = fixture.nativeElement.querySelector("mat-progress-bar") as HTMLElement;
    expect(bar).toBeTruthy();
  });

  it("mat-progress-bar has mode=determinate", () => {
    createComponent({ value: 50, status: "neutral" });
    const bar = fixture.nativeElement.querySelector("mat-progress-bar") as HTMLElement;
    expect(bar.getAttribute("mode")).toBe("determinate");
  });

  it("percentage text displays the correct value with % suffix", () => {
    createComponent({ value: 62, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("62%");
  });

  it("renders Progress: label", () => {
    createComponent({ value: 62, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Progress:");
  });

  it("renders correct percentage for value 0", () => {
    createComponent({ value: 0, status: "neutral" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("0%");
  });

  it("renders correct percentage for value 100", () => {
    createComponent({ value: 100, status: "success" });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("100%");
  });
});
