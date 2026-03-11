import { Priority } from "./priority.enum";
import { Task } from "./task.model";

/**
 * Discriminated union for strongly-typed task action variants.
 * Used by NGRX actions (Phase 2) for compile-time exhaustive checking.
 *
 * Example switch with exhaustive check:
 *   switch (action.type) {
 *     case 'move':   // fromColumnId, toColumnId known
 *     case 'add':    // title, columnId, priority known
 *     case 'remove': // taskId known
 *     case 'update': // changes: Partial<Task> known
 *     // No default needed — TypeScript errors if a case is missing
 *   }
 */
export type TaskAction =
  | { type: "move"; taskId: string; fromColumnId: string; toColumnId: string }
  | { type: "add"; title: string; columnId: string; priority: Priority }
  | { type: "remove"; taskId: string }
  | { type: "update"; taskId: string; changes: Partial<Task> };

/** Internal compile-time exhaustive check — never called at runtime. */
function _exhaustiveCheck(action: TaskAction): void {
  switch (action.type) {
    case "move":
      break;
    case "add":
      break;
    case "remove":
      break;
    case "update":
      break;
  }
}
