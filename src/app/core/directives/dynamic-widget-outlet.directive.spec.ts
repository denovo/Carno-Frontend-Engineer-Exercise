import {
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Subject } from "rxjs";
import { DynamicWidgetOutletDirective } from "./dynamic-widget-outlet.directive";
import type { WidgetConfig } from "@app/core/models/widget.models";

/** Minimal fake widget component used across all directive tests. */
@Component({
  selector: "app-fake-widget",
  standalone: true,
  template: `<span>{{ title() }}</span>`,
})
class FakeWidgetComponent {
  title = input<string>("default");
  dismissed = output<string>();
}

/** Host component that applies the directive via its selector. */
@Component({
  selector: "app-test-host",
  standalone: true,
  imports: [DynamicWidgetOutletDirective],
  template: `<div appDynamicWidgetOutlet [configs]="configs()"></div>`,
})
class TestHostComponent {
  configs = signal<WidgetConfig<object>[]>([]);
}

describe("DynamicWidgetOutletDirective", () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TestHostComponent>>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  // DYN-01: directive creates one ComponentRef per config entry
  it("DYN-01: creates a ComponentRef in ViewContainerRef for each config", () => {
    host.configs.set([
      { component: FakeWidgetComponent },
      { component: FakeWidgetComponent },
    ]);
    fixture.detectChanges();
    const rendered = fixture.nativeElement.querySelectorAll("app-fake-widget");
    expect(rendered.length).toBe(2);
  });

  // DYN-02: renders all components from the config array
  it("DYN-02: renders all components from a config array", () => {
    host.configs.set([{ component: FakeWidgetComponent }]);
    fixture.detectChanges();
    const rendered = fixture.nativeElement.querySelector("app-fake-widget");
    expect(rendered).not.toBeNull();
  });

  // DYN-04: static input binding calls setInput() synchronously
  it("DYN-04: passes static input values via setInput()", () => {
    host.configs.set([
      {
        component: FakeWidgetComponent,
        inputs: {
          title: { type: "static", value: "Hello World" },
        },
      },
    ]);
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector("span");
    expect(span?.textContent?.trim()).toBe("Hello World");
  });

  // DYN-05: observable input binding subscribes and calls setInput() on each emission
  it("DYN-05: subscribes to observable input and calls setInput() on each emission", () => {
    const subject = new Subject<string>();
    host.configs.set([
      {
        component: FakeWidgetComponent,
        inputs: {
          title: { type: "observable", value: subject.asObservable() },
        },
      },
    ]);
    fixture.detectChanges();

    subject.next("From Observable");
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector("span");
    expect(span?.textContent?.trim()).toBe("From Observable");
  });

  // DYN-06: signal input binding runs effect() and updates component reactively
  it("DYN-06: runs effect() for signal input and calls setInput() reactively", async () => {
    const sig = signal("Initial");
    host.configs.set([
      {
        component: FakeWidgetComponent,
        inputs: {
          title: { type: "signal", value: sig },
        },
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    sig.set("Updated");
    fixture.detectChanges();
    await fixture.whenStable();

    const span = fixture.nativeElement.querySelector("span");
    expect(span?.textContent?.trim()).toBe("Updated");
  });

  // DYN-07: output events are forwarded to provided handler functions
  it("DYN-07: forwards output events to provided handler function", () => {
    const handler = vi.fn();
    host.configs.set([
      {
        component: FakeWidgetComponent,
        outputs: {
          dismissed: handler,
        },
      },
    ]);
    fixture.detectChanges();

    // Find the FakeWidgetComponent instance and trigger its dismissed output
    const allDebugEls = fixture.debugElement.queryAll(() => true);
    const widgetDebugEl = allDebugEls.find(
      (el) => el.componentInstance instanceof FakeWidgetComponent
    );
    if (widgetDebugEl) {
      (widgetDebugEl.componentInstance as FakeWidgetComponent).dismissed.emit(
        "payload"
      );
    }
    expect(handler).toHaveBeenCalledWith("payload");
  });

  // DYN-08: vcr.clear() is called when directive is destroyed
  it("DYN-08: calls vcr.clear() when directive is destroyed", () => {
    host.configs.set([{ component: FakeWidgetComponent }]);
    fixture.detectChanges();

    // Verify widget is rendered
    expect(
      fixture.nativeElement.querySelectorAll("app-fake-widget").length
    ).toBe(1);

    // Destroy the fixture — triggers directive's destroyRef.onDestroy
    fixture.destroy();

    // After destruction, the host element no longer contains the widget
    expect(
      fixture.nativeElement.querySelectorAll("app-fake-widget").length
    ).toBe(0);
  });

  // DYN-09: observable subscription is cleaned up on directive destroy (no dangling subs)
  it("DYN-09: observable subscription is cleaned up on directive destroy", () => {
    const subject = new Subject<string>();

    host.configs.set([
      {
        component: FakeWidgetComponent,
        inputs: {
          title: {
            type: "observable",
            value: subject.asObservable(),
          },
        },
      },
    ]);
    fixture.detectChanges();

    // Subject should be observed while directive is alive
    expect(subject.observed).toBe(true);

    // Destroy the fixture — takeUntilDestroyed should unsubscribe
    fixture.destroy();

    // Subject should have no observers after destroy
    expect(subject.observed).toBe(false);
  });
});
