import type { Observable, Signal, Type } from "@angular/core";

/** Represents a displayable widget value with a status category for visual styling. */
export type WidgetStatus<T> = {
  value: T;
  status: "success" | "warning" | "error" | "neutral";
  icon?: string;
  tooltip?: string;
};

/** Discriminated union describing how a single input value is delivered to a dynamic component. */
export type InputBinding<T> =
  | { type: "static"; value: T }
  | { type: "observable"; value: Observable<T> }
  | { type: "signal"; value: Signal<T> };

/** Configuration for rendering a dynamic component with typed input and output bindings. */
export type WidgetConfig<C extends object> = {
  component: Type<C>;
  inputs?: { [K in keyof C]?: InputBinding<C[K]> };
  outputs?: { [K in keyof C]?: (event: C[K]) => void };
};
