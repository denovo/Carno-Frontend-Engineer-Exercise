import { Injectable, signal } from "@angular/core";

export type ColorScheme = "light" | "dark";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly _isDark = signal<boolean>(this.systemPrefersDark());

  readonly isDark = this._isDark.asReadonly();

  constructor() {
    this.apply(this._isDark());
  }

  toggle(): void {
    const next = !this._isDark();
    this._isDark.set(next);
    this.apply(next);
  }

  private systemPrefersDark(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  private apply(dark: boolean): void {
    document.body.style.colorScheme = dark ? "dark" : "light";
  }
}
