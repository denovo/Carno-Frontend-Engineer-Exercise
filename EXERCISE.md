# Senior Angular Frontend Engineer - Take Home Exercise

**Time Estimate**: 2 hours
**Technology**: Angular 17+, TypeScript, NGRX, Signals

---

> ### ⚠️ Important: A Note on AI-Assisted Development
>
> We embrace AI coding tools—our engineers use them daily to accelerate their work. However, **using AI effectively requires understanding the fundamentals**. Without this foundation, you're essentially "vibe coding": accepting AI output without the ability to validate, debug, or extend it. This is not something we allow.
>
> **Our expectation:**
> - You may use AI tools (Copilot, ChatGPT, Claude, etc.) to assist with this exercise.
> - **Be transparent**: In your README, briefly describe how you used AI assistance (if at all), what it helped with, and what you wrote or significantly modified yourself
> - **Understand your code**: You will be expected to walk through your solution in detail during the technical interview, explaining your architectural decisions and implementation choices
> - **Live follow-up**: During the interview call, you will complete a short coding exercise via screenshare. This will assess your ability to work with the concepts demonstrated in your submission
>
> We value engineers who can leverage AI as a force multiplier—not as a replacement for understanding. If you use AI, use it wisely, and be prepared to defend every line of your submission. You may NOT use it to blindly complete the entire exercise. We will not proceed with candidates with whom we suspect did this.

---

## Overview

You are building a **Task Board Application** - a simplified project management tool where users can create, organize, and track tasks across multiple boards. This exercise assesses your ability to architect scalable Angular applications with proper state management, signals integration, and dynamic rendering patterns.

---

## Requirements

### 1. Core Data Models

Design and implement TypeScript interfaces for the following entities:

**Board**
- Should contain an identifier, name, and a collection of columns

**Column**
- Should contain an identifier, name, and ordering information

**Task**
- Should contain: identifier, title, optional description, reference to its parent column, priority level (support at least 4 priority tiers), optional assignee, and timestamp information for creation and updates
- Consider using TypeScript union types or enums for the priority levels

*We're looking for: Strong typing, appropriate use of optional properties, and consideration of relationships between entities.*

### 2. State Management (NGRX)

Implement a complete NGRX store for managing tasks.

**Actions to implement:**
- Loading tasks for a board
- Adding a new task
- Moving a task between columns (this should use optimistic updates)
  - Drag and drop functionality is not the core focus here (though nice to have), we would accept it if the user can change the columns by simply editng a column via a select box. We care more about the state management side of things in the context of this exercise.
- Updating task details
- Removing a task

**Selectors to implement:**
- A parameterised/factory selector that returns tasks filtered by a specific column
- A selector that returns a count breakdown grouped by priority
- A selector that calculates the percentage of tasks that have reached the final column (completion rate)

**Effects requirements:**
- Implement at least one effect demonstrating proper error handling
- Demonstrate how you handle the difference between optimistic and pessimistic updates
- Show your rollback strategy when a `moveTask` operation fails on the server

*We're looking for: Proper action naming conventions, selector composition and memoisation, effect error handling patterns.*

### 3. Signal Integration

Create a **TaskCardComponent** that demonstrates:

- Input signals for receiving task data
- Derived/computed signals for transformed display values (e.g., CSS class based on priority, formatted dates, overdue calculations)
- Local UI state managed with signals (e.g., expansion state, edit mode)

Additionally, demonstrate how you bridge NGRX store selectors with Angular signals for reactive component consumption.

*We're looking for: Understanding of signal reactivity, proper separation between derived and local state, clean integration between NGRX and signals.*

### 4. Dynamic Component Rendering

Create a structural directive called `DynamicWidgetOutletDirective` that enables dynamic component rendering.

**The directive should:**
- Accept either a single component configuration or an array of configurations
- Dynamically instantiate and render components
- Pass inputs to rendered components (supporting static values, Observables, and Signals)
- Subscribe to component outputs and forward events to provided handler functions
- Properly manage component lifecycle (creation, input updates, destruction)
- Handle cleanup of subscriptions and component references

**Design a configuration interface** that describes:
- Which component to render
- What inputs to pass
- What output handlers to attach

Consider using TypeScript generics to provide type safety for the component inputs and outputs.

*We're looking for: Understanding of Angular's ViewContainerRef, ComponentRef, proper subscription management, and lifecycle awareness.*

### 5. Widget System

Create a widget system for displaying task metadata with status indicators.

**Design a WidgetStatus interface** that supports:
- A value (consider using generics for type flexibility)
- A status indicator (success, warning, error, neutral)
- Optional icon reference
- Optional tooltip text

**Implement at least two widgets:**
1. **TaskCountWidget** - Displays a count with appropriate status colouring
2. **ProgressWidget** - Displays visual progress indication

Demonstrate how widget state can be derived from store state using computed signals, reacting to changes in the underlying data.

*We're looking for: Generic type usage, signal-based derived state, clean separation between data and presentation.*

---

## Architecture Considerations

We want to see evidence of:

### A. Separation of Concerns
- How you structure your feature module(s)
- Separation between smart (container) and presentational (dumb) components
- Service layer organization

### B. Scalability Patterns
- How would your architecture scale if we added:
  - Multiple boards
  - Real-time collaboration (WebSocket updates)
  - Undo/redo functionality
  - Offline support

Please include a brief written section (README.md) addressing these scale considerations.

### C. Type Safety
- Proper TypeScript usage throughout
- Generic types where appropriate
- Discriminated unions for action types

### D. Memory Management
- Proper cleanup of subscriptions
- Use of `takeUntilDestroyed`, `DestroyRef`, or similar patterns
- Explain your approach to preventing memory leaks

---

## Deliverables

1. **Source Code** - A working Angular application with the above features
2. **README.md** - Including:
   - Setup instructions
   - Architecture decisions and rationale
   - Scalability considerations (as mentioned above)
   - Any tradeoffs you made given the time constraint

3. **Store Structure** - Document your NGRX store file/folder organisation and explain your reasoning

---

## Evaluation Criteria

| Area | What We're Looking For |
|------|------------------------|
| State Management | Proper NGRX patterns, selector composition, effect handling |
| Signals Usage | Correct signal patterns, computed signals, NGRX/Signal bridging |
| Dynamic Rendering | Robust directive implementation, proper lifecycle handling |
| Architecture | Scalable structure, separation of concerns, type safety |
| Code Quality | Clean code, adhering to SOLID principles |

As this is a limited time exercise we don't expect verbsoe documentation or unit tests, for that reason these are bonus point items, but we will expect the code itself to be clean and readable.

---

## Bonus Points (Optional)

If you have additional time and want to demonstrate more skills:

1. **Unit Tests** - Testing for selectors and effects
2. **Component Tests** - Testing for the dynamic directive
3. **Memoization Strategy** - Custom memoization for complex selectors
4. **Action Hygiene** - Demonstrate command vs event action patterns

---

## What NOT to Focus On

- **Styling/CSS** - Basic styling is fine, we're not assessing design skills
- **Backend/API** - Mock the data, or use a public dummy data API, no need for a real backend implementation.
- **Authentication** - Not required
- **Complex UI** - Focus on architecture over polish

---

## Submission

- Provide a link to a GitHub repository (or zip file)
- Ensure the project runs with `npm install && ng serve`
- Include any environment setup instructions if needed

---

## Questions?

If you have any questions about the requirements, please reach out before starting. We'd rather clarify upfront than have you make assumptions.

Good luck! We look forward to reviewing your solution.
