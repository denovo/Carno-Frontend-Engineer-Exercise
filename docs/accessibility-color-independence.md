# Accessibility: Not Relying Solely on Colour to Convey Status

## The Principle

**WCAG 2.1 criterion 1.4.1 — Use of Colour** states that colour must not be the *only* visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

This matters for:
- Colour-blind users (~8% of males have some form of colour vision deficiency)
- Users in high-contrast mode or on low-quality displays
- Users who rely on assistive technology that ignores visual styling

---

## Where the Current Implementation Relies on Colour Alone

### 1. Overdue indicator

The current implementation applies a CSS class that adds a red left border:

```scss
// task-card.component.scss
mat-card {
  &.overdue {
    border-left: 4px solid #f44336; // red — colour only
  }
}
```

A user who cannot distinguish red from the default border colour has no way of knowing the task is overdue. There is no icon, label, or other non-colour cue.

### 2. Priority border (high / critical)

```scss
.priority-high {
  border-left: 4px solid #ff9800; // orange — colour only
}

.priority-critical {
  border-left: 4px solid #f44336; // red — colour only
}
```

The chip already contains the text label (`HIGH`, `CRITICAL`) — that's good. But the left-border accent, which is the most prominent visual signal at a glance, carries meaning through colour alone, and at high/critical the border colour is identical to the overdue border colour (`#f44336`), making the two states visually indistinguishable.

### 3. Priority chip (no icon)

```html
<mat-chip [class]="priorityClass()">{{ task().priority }}</mat-chip>
```

The text label is present, which satisfies 1.4.1 on its own. But there is no icon, so scanning a dense board relies on reading every chip label. Adding an icon makes priority scannable without reading.

---

## The Intended Fix

The fix is to pair every colour-based indicator with at least one non-colour cue: an icon, a visible text label, or a shape/pattern difference.

### Overdue — add an icon + `aria-label`

```html
@if (isOverdue()) {
  <span class="overdue-badge" aria-label="Overdue">
    <mat-icon>schedule</mat-icon>
    <span class="overdue-label">Overdue</span>
  </span>
}
```

Now the overdue state is communicated by the clock icon, the visible "Overdue" text label, *and* the red border. Removing the colour entirely still leaves two clear indicators.

### Priority — add directional icons to the chip

```typescript
// In component
readonly PRIORITY_ICONS: Record<string, string> = {
  LOW:      'expand_more',
  MEDIUM:   'remove',
  HIGH:     'expand_less',
  CRITICAL: 'error',
};
```

```html
<mat-chip [class]="priorityClass()">
  <mat-icon>{{ PRIORITY_ICONS[task().priority] }}</mat-icon>
  {{ task().priority }}
</mat-chip>
```

A user who cannot see colour can still distinguish `expand_more` (low) from `error` (critical) at a glance. The icons are also directionally meaningful — lower icons for lower priority, higher/alert icons for higher priority — which makes them learnable rather than arbitrary.

### Priority border — differentiate by thickness, not just colour

```scss
.priority-low      { /* no border */ }
.priority-medium   { border-left: 2px solid; }
.priority-high     { border-left: 4px solid; }
.priority-critical { border-left: 6px solid; }
```

Varying the border *thickness* means priority can be read from shape alone. Colour still adds a redundant visual layer on top (green → amber → orange → red), but it is no longer load-bearing.

---

## Why This Matters Beyond Compliance

Colour independence isn't just about ticking a WCAG checkbox — it produces better UI in general:

- **Degraded conditions**: a user on a cheap laptop screen outdoors, or with brightness turned low, can still read status from icon/text
- **Print / export**: if the board is ever screenshotted or printed in greyscale, the information is preserved
- **Speed**: icons are processed pre-attentively (faster than reading text), so adding them alongside text makes the UI faster to scan for everyone

---

## Interview Talking Points

- WCAG 2.1 has three levels: A, AA, AA. 1.4.1 is Level A — the minimum bar — so this is not an edge-case compliance concern, it's baseline expected behaviour.
- The most common failure pattern is using only border or background colour to indicate state. The fix is always the same: add a second, non-colour cue. In practice that usually means an icon.
- Angular Material's `MatIcon` makes this cheap to add — there's no performance cost, and the Material icon set has strong semantic icons (`schedule`, `error`, `expand_more`) that map intuitively to the concepts.
- The `aria-label` on the overdue badge is separate from WCAG 1.4.1 (that's 1.1.1 — text alternatives for non-text content) but it's cheap to add at the same time and makes screen readers announce "Overdue" directly.
- In this codebase, the priority text in the chip already satisfies 1.4.1 for priority *labels*, but the card-level left border (the most eye-catching signal) was colour-only. The fix separates the decoration (colour) from the information (icon + thickness), so they each do one job well.
