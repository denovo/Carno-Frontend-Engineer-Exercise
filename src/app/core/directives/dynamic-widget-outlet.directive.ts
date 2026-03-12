import {
  DestroyRef,
  Directive,
  Injector,
  Signal,
  ViewContainerRef,
  effect,
  inject,
  input,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import type { InputBinding, WidgetConfig } from "@app/core/models/widget.models";

/**
 * DynamicWidgetOutletDirective
 *
 * Renders an array of Angular components from a runtime config array.
 * Supports static, Observable, and Signal input bindings with proper
 * lifecycle cleanup. Output events are forwarded to provided handler functions.
 *
 * Usage:
 *   <ng-container [appDynamicWidgetOutlet] [configs]="widgetConfigs()" />
 *
 * DYN-01 through DYN-09 are all handled in this single directive.
 */
@Directive({
  selector: "[appDynamicWidgetOutlet]",
  standalone: true,
})
export class DynamicWidgetOutletDirective {
  // inject() fields declared first — Vitest DI safety pattern (NGRX issue #4708)
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** Config array input — each entry describes one component to render. */
  readonly configs = input<WidgetConfig<object>[]>([]);

  constructor() {
    // DYN-02: React to config changes, re-render all components.
    // untracked() is required here because renderOne() may call effect() for
    // signal bindings (DYN-06). Angular 21 prohibits nested effect() calls
    // from within a reactive context (NG0602), so we read configs() in the
    // reactive scope to track changes, then process them outside it.
    effect(() => {
      const cfgs = this.configs();
      untracked(() => {
        this.vcr.clear();
        for (const cfg of cfgs) {
          this.renderOne(cfg);
        }
      });
    });

    // DYN-08: Clean up all ComponentRefs when directive is destroyed
    this.destroyRef.onDestroy(() => this.vcr.clear());
  }

  /**
   * Renders a single widget component and wires up its input bindings and output handlers.
   * DYN-01: Creates one ComponentRef per config entry.
   * DYN-04: Static bindings set synchronously via setInput().
   * DYN-05: Observable bindings subscribe via takeUntilDestroyed() — DYN-09.
   * DYN-06: Signal bindings use effect() with explicit injector.
   * DYN-07: Output events forwarded to provided handler functions.
   */
  private renderOne(cfg: WidgetConfig<object>): void {
    const ref = this.vcr.createComponent(cfg.component);

    for (const [key, binding] of Object.entries(cfg.inputs ?? {})) {
      const b = binding as InputBinding<unknown>;
      switch (b.type) {
        case "static":
          // DYN-04: synchronous, one-time set
          ref.setInput(key, b.value);
          break;
        case "observable":
          // DYN-05 + DYN-09: subscribe with automatic cleanup via destroyRef
          (b.value as Observable<unknown>)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((v) => ref.setInput(key, v));
          break;
        case "signal":
          // DYN-06: reactive update via effect with explicit injector
          effect(() => ref.setInput(key, (b.value as Signal<unknown>)()), {
            injector: this.injector,
          });
          break;
      }
    }

    // DYN-07: forward output events to provided handler functions
    for (const [key, handler] of Object.entries(cfg.outputs ?? {})) {
      const outputRef = (
        ref.instance as Record<
          string,
          { subscribe: (h: (v: unknown) => void) => void }
        >
      )[key];
      if (outputRef?.subscribe) {
        outputRef.subscribe(handler as (v: unknown) => void);
      }
    }
  }
}
